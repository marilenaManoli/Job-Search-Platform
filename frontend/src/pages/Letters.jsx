import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { aiApi } from '../api/ai'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

export default function Letters() {
  const loc = useLocation()
  const [form, setForm] = useState({ company: loc.state?.company || '', role: loc.state?.role || '', jd: '', why: '', tone: 'professional and warm', length: 'concise (3 short paragraphs)', extra: '' })
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = async () => {
    if (!form.company || !form.role) { toast('Enter company and role'); return }
    setLoading(true); setLetter('')
    try { const { text } = await aiApi.coverLetter(form); setLetter(text); toast('Cover letter generated ✓') }
    catch (e) { toast('Error: ' + e.message) }
    finally { setLoading(false) }
  }

  const copy = () => navigator.clipboard.writeText(letter).then(() => toast('Copied ✓'))
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([letter], { type: 'text/plain' }))
    a.download = `cover_letter_${form.company.replace(/\s+/g,'_')}_${form.role.replace(/\s+/g,'_')}.txt`
    a.click(); toast('Downloaded ✓')
  }

  return (
    <div className="page">
      <div className="page-header"><h1>Cover Letter Generator</h1><p>AI-tailored letters based on your profile and the specific job.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>Job details</div>
          <div className="form-group"><label>Company name</label><input value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. ELCA Informatique" /></div>
          <div className="form-group"><label>Role title</label><input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Junior Software Engineer" /></div>
          <div className="form-group"><label>Job description (paste key points)</label><textarea rows={5} value={form.jd} onChange={e => set('jd', e.target.value)} placeholder="Paste the job description…" /></div>
          <div className="form-group"><label>What excites you about this role?</label><textarea rows={2} value={form.why} onChange={e => set('why', e.target.value)} placeholder="Their focus on human-centred AI, Swiss-based team…" /></div>
          <div className="form-row">
            <div className="form-group"><label>Tone</label>
              <select value={form.tone} onChange={e => set('tone', e.target.value)}>
                <option value="professional and warm">Professional & warm</option>
                <option value="formal">Formal</option>
                <option value="conversational">Conversational</option>
                <option value="confident and direct">Confident & direct</option>
              </select>
            </div>
            <div className="form-group"><label>Length</label>
              <select value={form.length} onChange={e => set('length', e.target.value)}>
                <option value="concise (3 short paragraphs)">Concise (3 paragraphs)</option>
                <option value="standard (4 paragraphs)">Standard (4 paragraphs)</option>
                <option value="detailed (5 paragraphs)">Detailed (5 paragraphs)</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Anything specific to highlight or avoid?</label><input value={form.extra} onChange={e => set('extra', e.target.value)} placeholder="Emphasise thesis project, mention Swiss study experience…" /></div>
          <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ width: '100%' }}>
            {loading ? <><div className="spinner" /> Writing…</> : <><i className="ti ti-sparkles" />Generate cover letter</>}
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Generated letter</span>
            {letter && <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm btn-ghost" onClick={copy}><i className="ti ti-copy" />Copy</button>
              <button className="btn btn-sm btn-ghost" onClick={download}><i className="ti ti-download" />Save .txt</button>
            </div>}
          </div>
          <div className="letter-box">
            {loading ? <Spinner text="Tailoring your cover letter…" /> :
             letter ? letter :
             <div className="ai-placeholder"><i className="ti ti-file-text" style={{ fontSize: 24, display: 'block', marginBottom: 8 }} />Fill in the job details and click "Generate".</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
