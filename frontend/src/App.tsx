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
      <p role="status">{status}</p>
    </main>
  )
}

export default App
