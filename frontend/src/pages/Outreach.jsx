import { useState } from 'react'
import { aiApi } from '../api/ai'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const RECRUITERS = [
  { name:'Hays Switzerland', type:'Recruitment agency', url:'https://www.hays.ch' },
  { name:'Michael Page CH',  type:'Recruitment agency', url:'https://www.michaelpage.ch' },
  { name:'Robert Walters CH',type:'Recruitment agency', url:'https://www.robertwalters.ch' },
  { name:'Swisslinx',        type:'Recruitment agency', url:'https://www.swisslinx.com' },
  { name:'Darwin Recruitment',type:'Recruitment agency',url:'https://www.darwinrecruitment.com' },
  { name:'English Forum',    type:'Expat jobs forum',   url:'https://www.englishforum.ch/jobs' },
  { name:'Swisslinks',       type:'Swiss networking',   url:'https://www.swisslinks.com' },
]

export default function Outreach() {
  const [form, setForm] = useState({ type: 'LinkedIn cold DM to recruiter', recipient_name: '', company: '', role: '', tone: 'professional and friendly' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = async () => {
    setLoading(true); setMessage('')
    try { const { text } = await aiApi.outreach(form); setMessage(text); toast('Message generated ✓') }
    catch (e) { toast('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  const copy = () => navigator.clipboard.writeText(message).then(() => toast('Copied ✓'))

  return (
    <div className="page">
      <div className="page-header"><h1>Recruiter Outreach</h1><p>AI-generated LinkedIn messages and emails for recruiters and companies.</p></div>

      <div className="section-label">Key recruiting agencies</div>
      <div className="recruiter-grid">
        {RECRUITERS.map(r => (
          <div className="recruiter-card" key={r.name}>
            <div className="recruiter-name">{r.name}</div>
            <div className="recruiter-type">{r.type}</div>
            <a className="recruiter-url" href={r.url} target="_blank" rel="noreferrer"><i className="ti ti-external-link" style={{ fontSize: 13 }} />{r.url.replace('https://','')}</a>
          </div>
        ))}
      </div>

      <div className="section-label">Generate message</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="form-group"><label>Message type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="LinkedIn cold DM to recruiter">LinkedIn DM — cold to recruiter</option>
              <option value="LinkedIn DM following up on application">LinkedIn DM — follow-up after applying</option>
              <option value="cold email to company HR">Cold email to company HR</option>
              <option value="LinkedIn DM to hiring manager">LinkedIn DM — hiring manager</option>
              <option value="networking message to alumni">Networking — alumni contact</option>
            </select>
          </div>
          <div className="form-group"><label>Recipient name (optional)</label><input value={form.recipient_name} onChange={e => set('recipient_name', e.target.value)} placeholder="e.g. Sophie Müller" /></div>
          <div className="form-group"><label>Company / agency</label><input value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Hays Switzerland" /></div>
          <div className="form-group"><label>Role or opportunity</label><input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Junior Software Engineer roles" /></div>
          <div className="form-group"><label>Tone</label>
            <select value={form.tone} onChange={e => set('tone', e.target.value)}>
              <option value="professional and friendly">Professional & friendly</option>
              <option value="formal">Formal</option>
              <option value="direct and concise">Direct & concise</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ width: '100%' }}>
            {loading ? <><div className="spinner" /> Writing…</> : <><i className="ti ti-sparkles" />Generate message</>}
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Generated message</span>
            {message && <button className="btn btn-sm btn-ghost" onClick={copy}><i className="ti ti-copy" />Copy</button>}
          </div>
          <div className="letter-box">
            {loading ? <Spinner text="Crafting your message…" /> :
             message ? message :
             <div className="ai-placeholder"><i className="ti ti-send" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />Configure the message and click "Generate".</div>}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)' }}><i className="ti ti-bulb" style={{ verticalAlign: -2 }} /> Tip: Always personalise the first line before sending.</div>
        </div>
      </div>
    </div>
  )
}
