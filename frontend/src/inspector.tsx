import { useEffect, useState } from 'react'


function App() {
const [properties, setProperties] = useState<{ id: number; property_name: string }[]>([])
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
  useEffect(() => {
    async function loadProperties() {
      const response = await fetch('/api/properties')
      const data = await response.json()
      setProperties(data)
    }
  
    loadProperties()
  }, [])
  return (
    <main>
      <h1>PropMan</h1>
      <p>Inspect Properties!</p>

      <form onSubmit={async (event) => {
        event.preventDefault()

        const form = event.currentTarget
        const data = new FormData(form)

        const response = await fetch('/api/inspections', {
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

        console.log('Saved inspector:', await response.json())
        form.reset()
      }}>
      <label htmlFor="inspector-name">Inspector name</label>
      <input id="inspector-name" name="inspector_name" type="text" required />
      <label htmlFor="inspection-property">Property</label>
    <select id="inspection-property" name="property_id" defaultValue="" required>
    <option value="" disabled>Choose a property</option>
    {properties.map((property) => (
        <option key={property.id} value={property.id}>
        {property.property_name}
        </option>
    ))}
    </select>
      <button type="submit">Start inspection</button>
    </form>
      <p role="status">{status}</p>
    </main>
  )
}
export default App