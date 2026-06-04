import { useState } from 'react'
import { aiApi } from '../api/ai'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const SECTION_META = {
  'Role Fit':               { icon: 'ti-target',     color: 'var(--accent)' },
  'Companies to Target':    { icon: 'ti-building',    color: 'var(--blue)' },
  'Strengths to Highlight': { icon: 'ti-star',        color: 'var(--amber)' },
  'Skill Gaps':             { icon: 'ti-trending-up', color: 'var(--purple)' },
  'Quick Wins This Week':   { icon: 'ti-bolt',        color: 'var(--accent)' },
}

export default function Suggestions() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')
  const toast = useToast()

  const analyse = async () => {
    setLoading(true); setResult('')
    try {
      const { text } = await aiApi.suggestions()
      setResult(text)
      setLastUpdated(new Date().toLocaleString('en-CH', { dateStyle: 'short', timeStyle: 'short' }))
      toast('Suggestions ready ✓')
    } catch (e) { toast('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  const sections = result ? result.split(/(?:^|\n)##\s+/).filter(s => s.trim()).map(section => {
    const nl = section.indexOf('\n')
    const title = nl === -1 ? section.trim() : section.slice(0, nl).trim()
    const body  = nl === -1 ? '' : section.slice(nl + 1).trim()
    const meta  = SECTION_META[title] || { icon: 'ti-bulb', color: 'var(--accent)' }
    return { title, body, meta, full: title === 'Quick Wins This Week' }
  }) : []

  return (
    <div className="page">
      <div className="page-header"><h1>Suggestions</h1><p>AI analysis of your profile and search progress — personalised advice to sharpen your search.</p></div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 22 }}>
        <button className="btn btn-primary" onClick={analyse} disabled={loading}>
          {loading ? <><div className="spinner" /> Analysing…</> : <><i className="ti ti-sparkles" />Analyse my profile</>}
        </button>
        {lastUpdated && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Last updated: {lastUpdated}</span>}
      </div>

      {loading ? <Spinner text="Analysing your profile and search progress…" /> :
       sections.length ? (
         <div className="sug-grid">
           {sections.map(({ title, body, meta, full }) => (
             <div className={`card${full ? ' sug-full' : ''}`} key={title}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                 <i className={`ti ${meta.icon}`} style={{ fontSize: 18, color: meta.color }} />
                 <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
               </div>
               <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{body}</div>
             </div>
           ))}
         </div>
       ) : <div className="empty"><i className="ti ti-bulb" /><p>Click "Analyse my profile" to get personalised suggestions.</p></div>}
    </div>
  )
}
