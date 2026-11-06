import { useEffect, useState } from 'react'
function App() {
  const [status, setStatus] = useState('Checking the Laravel API…')

  useEffect(() => {
    const request = new AbortController()

    async function checkApi() {
      try {
        const response = await fetch('/api/health', {
          headers: { Accept: 'application/json' },
          signal: request.signal,
        })

        if (!response.ok) {
          throw new Error('Health check failed')
        }

        const health = await response.json()
        if (health?.status !== 'ok') {
          throw new Error('Unexpected health response')
        }

        setStatus('Connected to the Laravel API')
      } catch {
        if (!request.signal.aborted) {
          setStatus('Could not connect to the Laravel API')
        }
      }
    }

    void checkApi()

    return () => request.abort()
  }, [])

  return (
    <main>
      <h1>PropMan</h1>
      <p>Property inspections and condition reports</p>

      <form onSubmit={async (event) => {
        event.preventDefault()

        const form = event.currentTarget
        const data = new FormData(form)

        const response = await fetch('/api/properties', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: data,
        })

        if (!response.ok) {
          console.error('Could not save property:', await response.json())
          return
        }

        console.log('Saved property:', await response.json())
        form.reset()
      }}>
      <label htmlFor="property-name">Property name</label>
      <input id="property-name" name="property_name" type="text" required />
      <label htmlFor="property-image">Property photo</label>
      <input id="property-image" name="image" type="file" accept="image/*" />      
      <button type="submit">Add Property</button>
    </form>
      <p role="status">{status}</p>
    </main>
  )
}

export default App
