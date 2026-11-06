import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Properties from './App.tsx'
import Inspector from './inspector.tsx'
import InspectionReport from './InspectionReport.tsx'

const params = new URLSearchParams(window.location.search)
const reportId = params.get('report')
const showProperties = params.get('view') === 'properties'

let screen = showProperties ? <Properties /> : <Inspector />
if (reportId) {
  screen = <InspectionReport id={reportId} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <nav className="main-nav" aria-label="Main navigation">
      <a href="?view=properties" aria-current={!reportId && showProperties ? 'page' : undefined}>Properties</a>
      <a href={window.location.pathname} aria-current={!reportId && !showProperties ? 'page' : undefined}>Inspector</a>
    </nav>
    {screen}
  </StrictMode>,
)
