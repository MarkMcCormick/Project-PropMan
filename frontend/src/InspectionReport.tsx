import { useEffect, useState } from 'react'

type Report = {
  property_name: string
  inspector_name: string
  completed_at: string
  total: number
  status_counts: Record<string, number>
  findings: {
    id: number
    item: string
    status: string
    severity: string
    notes: string | null
    image_path: string | null
  }[]
}

const severityLabels: Record<string, string> = { top: 'Top priority', vLow: 'Very low' }

export default function InspectionReport({ id }: { id: string }) {
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const request = new AbortController()

    async function loadReport() {
      try {
        const response = await fetch(`/api/inspections/${encodeURIComponent(id)}/report`, {
          headers: { Accept: 'application/json' },
          signal: request.signal,
        })

        if (!response.ok) {
          setError(response.status === 409 ? 'This inspection is still in progress.' : 'Could not load the report.')
          return
        }

        setReport(await response.json())
      } catch {
        if (!request.signal.aborted) setError('Could not reach the server.')
      }
    }

    void loadReport()
    return () => request.abort()
  }, [id])

  return (
    <main>
      <h1>Inspection report</h1>
      <a href={window.location.pathname}>Start another inspection</a>
      {error && <p role="alert">{error}</p>}
      {!error && !report && <p role="status">Loading report…</p>}
      {report && (
        <>
          <h2>{report.property_name}</h2>
          <p>Inspected by {report.inspector_name} on {new Date(report.completed_at).toLocaleString()}</p>
          <h3>Findings ({report.total})</h3>
          <p>
            Good: {report.status_counts.good ?? 0} · Damaged: {report.status_counts.damaged ?? 0}
            {' · '}Broken: {report.status_counts.broken ?? 0}
          </p>
          {report.findings.length === 0 && <p>No findings were recorded.</p>}
          {report.findings.map((finding) => (
            <article key={finding.id}>
              <h4>{finding.item}</h4>
              <p style={{ textTransform: 'capitalize' }}>
                {finding.status} · {severityLabels[finding.severity] ?? finding.severity}
              </p>
              {finding.notes && <p>{finding.notes}</p>}
              {finding.image_path && (
                <img
                  src={`/api/findings/${finding.id}/photo`}
                  alt={`Finding photo for ${finding.item}`}
                  style={{ maxWidth: 'min(100%, 24rem)' }}
                />
              )}
            </article>
          ))}
        </>
      )}
    </main>
  )
}
