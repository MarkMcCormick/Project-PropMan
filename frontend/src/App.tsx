import { useEffect, useState, type FormEvent } from 'react'

type Property = {
  id: number
  property_name: string
  inspections: { id: number; inspector_name: string; completed_at: string }[]
}

function Properties() {
  const [properties, setProperties] = useState<Property[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const loading = properties === null && !loadError

  useEffect(() => {
    const request = new AbortController()

    async function loadProperties() {
      try {
        const response = await fetch('/api/properties/overview', {
          headers: { Accept: 'application/json' },
          signal: request.signal,
        })

        if (!response.ok) {
          throw new Error('Property list request failed')
        }

        setProperties(await response.json())
      } catch {
        if (!request.signal.aborted) {
          setLoadError('Could not load the property list. Refresh to try again.')
        }
      }
    }

    void loadProperties()
    return () => request.abort()
  }, [])

  async function addProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || loading) return

    const form = event.currentTarget
    setSaving(true)
    setSaveError('')

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })

      if (!response.ok) {
        const problem = response.status === 422 ? await response.json() : null
        setSaveError(problem?.message ?? 'Could not save the property. Try again.')
        return
      }

      const property = await response.json()
      setProperties((current) => [{ ...property, inspections: [] }, ...(current ?? [])])
      form.reset()
    } catch {
      setSaveError('Could not save the property. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <h1>Properties</h1>
      <form className="property-form" onSubmit={addProperty}>
        <label htmlFor="property-name">Property name</label>
        <input id="property-name" name="property_name" type="text" maxLength={255} required />
        <label htmlFor="property-image">Property photo (optional)</label>
        <input id="property-image" name="image" type="file" accept="image/*" />
        <button type="submit" disabled={saving || loading}>Add property</button>
      </form>
      {saveError && <p role="alert">{saveError}</p>}

      <h2>Saved properties</h2>
      {loading && <p role="status">Loading properties…</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {properties?.length === 0 && <p>No properties have been added yet.</p>}
      {properties?.map((property) => (
        <section className="property-row" key={property.id}>
          <h3>{property.property_name}</h3>
          <div>
            <h4>Completed inspections</h4>
            {property.inspections.length === 0 ? (
              <p>None yet.</p>
            ) : (
              <ul>
                {property.inspections.map((inspection) => (
                  <li key={inspection.id}>
                    <a href={`?report=${inspection.id}`}>{inspection.inspector_name}</a>
                    {' · '}
                    <time dateTime={inspection.completed_at}>
                      {new Date(inspection.completed_at).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </main>
  )
}

export default Properties
