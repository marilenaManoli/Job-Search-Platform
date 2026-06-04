import { useState } from 'react'
import { aiApi } from '../api/ai'
import { useProfile } from '../hooks/useProfile'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const CAT_KEYWORDS = { all:'junior software engineer OR data engineer OR AI engineer OR internship', swe:'junior software engineer developer', growth:'growth engineer product growth experimentation', data:'data engineer analyst machine learning', ai:'AI engineer machine learning NLP', research:'research engineer scientist', intern:'software technology internship', product:'product manager UX researcher digital' }
const CITY_LOCATION = { both:'Switzerland', zurich:'Zurich', basel:'Basel', remote:'Switzerland remote' }

export default function Finder() {
  const [cat, setCat] = useState('all')
  const [city, setCity] = useState('both')
  const [kw, setKw] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { profile } = useProfile()
  const toast = useToast()

  const isOllama = profile?.provider === 'ollama'

  const links = (() => {
    const base = CAT_KEYWORDS[cat] || CAT_KEYWORDS.all
    const query = kw ? `${base} ${kw}` : base
    const loc = CITY_LOCATION[city] || 'Switzerland'
    const q = encodeURIComponent(query), l = encodeURIComponent(loc), bq = encodeURIComponent(base)
    return [
      { name:'Jobs.ch',       url:`https://www.jobs.ch/en/vacancies/?term=${q}&location=${l}`,                        color:'var(--accent)' },
      { name:'LinkedIn',      url:`https://www.linkedin.com/jobs/search/?keywords=${q}&location=${l}%2C+Switzerland`, color:'var(--blue)' },
      { name:'SwissDevJobs',  url:`https://swissdevjobs.ch/?search=${bq}`,                                             color:'var(--purple)' },
      { name:'Indeed CH',     url:`https://ch.indeed.com/jobs?q=${q}&l=${l}`,                                          color:'var(--amber)' },
      { name:'Google Jobs',   url:`https://www.google.com/search?q=${q}+jobs+${l}&ibp=htl;jobs`,                       color:'var(--red)' },
      { name:'Glassdoor',     url:`https://www.glassdoor.com/Job/switzerland-jobs-SRCH_IL.0,11_IN209.htm?keyword=${q}`, color:'var(--text-2)' },
      { name:'English Forum', url:`https://www.englishforum.ch/jobs/search/?q=${bq}`,                                   color:'var(--accent)' },
      { name:'DataCareer.ch', url:`https://datacareer.ch/jobs?search=${q}`,                                             color:'var(--blue)' },
    ]
  })()

  const scan = async () => {
    setLoading(true); setResult('')
    try {
      const { text } = await aiApi.scan({ cat, city, kw })
      setResult(text); toast(isOllama ? 'Search strategy ready ✓' : 'Scan complete ✓')
    } catch (e) { toast('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="page">
      <div className="page-header"><h1>Find Jobs (AI)</h1><p>{isOllama ? 'Generates a targeted search strategy using your local model.' : 'Live web search via Claude to find current Swiss openings.'}</p></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row">
          <div className="form-group"><label>Job category</label>
            <select value={cat} onChange={e => setCat(e.target.value)}>
              <option value="all">All matching roles</option>
              <option value="swe">Junior Software Engineer</option>
              <option value="growth">Growth Engineer / Product Growth</option>
              <option value="data">Data / ML Engineer</option>
              <option value="ai">AI / Human-centered AI</option>
              <option value="research">Research / Academic</option>
              <option value="intern">Internships (all)</option>
              <option value="product">AI Product / UX</option>
            </select>
          </div>
          <div className="form-group"><label>City</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="both">Zürich + Basel</option>
              <option value="zurich">Zürich only</option>
              <option value="basel">Basel only</option>
              <option value="remote">Remote / anywhere CH</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label>Extra keywords (optional)</label><input value={kw} onChange={e => setKw(e.target.value)} placeholder="e.g. Python, startup, English-speaking" /></div>
        <button className="btn btn-primary" onClick={scan} disabled={loading}>
          {loading ? <><div className="spinner" />{isOllama ? ' Generating…' : ' Scanning…'}</> : <><i className={`ti ${isOllama ? 'ti-map' : 'ti-search'}`} />{isOllama ? 'Get search strategy' : 'Scan for jobs now'}</>}
        </button>
      </div>

      <div className="section-label">Quick search links</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Pre-filled from your filters — click any to open that platform directly. No API needed.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {links.map(l => (
            <a key={l.name} href={l.url} target="_blank" rel="noreferrer"
               style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:'var(--rad-sm)', border:`1px solid ${l.color}30`, background:`${l.color}10`, color:l.color, fontSize:12, fontWeight:500, textDecoration:'none', whiteSpace:'nowrap' }}>
              <i className="ti ti-external-link" style={{ fontSize: 13 }} />{l.name}
            </a>
          ))}
        </div>
      </div>

      <div className="section-label">AI results</div>
      {loading ? <Spinner text={isOllama ? 'Building search strategy…' : 'Searching job boards…'} /> :
       result ? (
         <div className="card">
           {isOllama && <div className="alert alert-info" style={{ marginBottom: 12 }}><i className="ti ti-bulb" style={{ verticalAlign: -2, marginRight: 6 }} />Running on Ollama — use the quick links above to search directly, then apply this strategy.</div>}
           <div className="stream-box">{result}</div>
         </div>
       ) : <div className="empty"><i className="ti ti-telescope" /><p>Run a scan to find current openings.</p></div>}
    </div>
  )
}
