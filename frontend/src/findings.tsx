import { useState, type FormEvent } from 'react'

function Findings({ id, propertyName }: { id: number; propertyName: string }) {
  const [savedFindings, setSavedFindings] = useState<{ id: number; item: string }[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const inspectionUrl = `/api/inspections/${id}`

  async function addFinding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    setPending(true)
    setError('')

    try {
      const response = await fetch(`${inspectionUrl}/findings`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })

      if (!response.ok) {
        const problem = response.status < 500 ? await response.json() : null
        setError(problem?.message ?? 'Could not save the finding. Try again.')
        return
      }

      const finding = await response.json()
      setSavedFindings((previous) => [...previous, finding])
      form.reset()
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  async function completeInspection() {
    if (pending) return
    setPending(true)
    setError('')

    try {
      const response = await fetch(`${inspectionUrl}/complete`, {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        setError('Could not complete the inspection. Try again.')
        return
      }

      window.location.assign(`?report=${id}`)
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main>
      <h1>PropMan</h1>
      <p>Inspecting {propertyName} · Inspection ID: {id}</p>
      <p style={{ marginBottom: '15rem' }}>Image here...</p>
      <form
        onSubmit={addFinding}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
      >
        <label htmlFor="inspection_item">What are you inspecting?</label>
        <input id="inspection_item" name="item" type="text" maxLength={255} required />

        <label htmlFor="finding-status">Status</label>
        <select id="finding-status" name="status" defaultValue="" required>
          <option value="" disabled>Choose a status</option>
          <option value="good">Good</option>
          <option value="damaged">Damaged</option>
          <option value="broken">Broken</option>
        </select>

        <label htmlFor="priority_status">Severity</label>
        <select id="priority_status" name="severity" defaultValue="" required>
          <option value="" disabled>State priority</option>
          <option value="top">Top Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="vLow">Very Low</option>
        </select>

        <label htmlFor="item-image">Upload photo</label>
        <input id="item-image" name="image" type="file" accept="image/*" />

        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" maxLength={10000} />

        <button type="submit" disabled={pending}>Add finding</button>
      </form>

      <p role="status">Saved findings: {savedFindings.length}</p>
      {savedFindings.length > 0 && (
        <ul>
          {savedFindings.map((finding) => <li key={finding.id}>{finding.item}</li>)}
        </ul>
      )}
      <button type="button" disabled={pending} onClick={completeInspection}>Complete inspection</button>
      {error && <p role="alert">{error}</p>}
    </main>
  )
}

export default Findings
