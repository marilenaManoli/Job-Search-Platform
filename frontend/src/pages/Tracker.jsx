import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { appsApi } from '../api/applications'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const STATUS_LABELS = { saved: 'Saved', applied: 'Applied', interview: 'Interviewing', offer: 'Offer 🎉', rejected: 'Rejected' }
const TYPE_LABELS   = { junior: 'Junior', intern: 'Internship', research: 'Research', growth: 'Growth' }
const CITIES = ['Zürich', 'Basel', 'Bern', 'Remote', 'Other']
const TYPES  = ['junior', 'intern', 'research', 'growth']

function deadlineSoon(d) {
  if (!d) return false
  const diff = (new Date(d) - new Date()) / 86400000
  return diff >= 0 && diff <= 7
}

export default function Tracker() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCity, setFilterCity]     = useState('')
  const [filterType, setFilterType]     = useState('')
  const [form, setForm] = useState({ company: '', role: '', city: 'Zürich', type: 'junior', status: 'saved', url: '', date_applied: '', deadline: '', notes: '' })
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => { appsApi.list().then(setApps).finally(() => setLoading(false)) }, [])

  const filtered = apps.filter(a =>
    (!filterStatus || a.status === filterStatus) &&
    (!filterCity   || a.city   === filterCity)   &&
    (!filterType   || a.type   === filterType)
  )

  const add = async e => {
    e.preventDefault()
    if (!form.company || !form.role) { toast('Enter company and role'); return }
    const a = await appsApi.create(form)
    setApps(prev => [a, ...prev])
    setForm({ company: '', role: '', city: 'Zürich', type: 'junior', status: 'saved', url: '', date_applied: '', deadline: '', notes: '' })
    toast('Application added ✓')
  }

  const changeStatus = async (id, status) => {
    const updated = await appsApi.update(id, { status })
    setApps(prev => prev.map(a => a.id === id ? updated : a))
    if (status === 'offer') toast('🎉 Congratulations on the offer!')
  }

  const remove = async id => {
    if (!confirm('Remove this application?')) return
    await appsApi.delete(id)
    setApps(prev => prev.filter(a => a.id !== id))
    toast('Removed')
  }

  const goToLetter = (a) => navigate('/letters', { state: { company: a.company, role: a.role } })

  if (loading) return <div className="page"><Spinner text="Loading…" /></div>

  return (
    <div className="page">
      <div className="page-header"><h1>Application Tracker</h1><p>Log every role — saved, applied, in progress.</p></div>

      <form className="card" style={{ marginBottom: 16 }} onSubmit={add}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Add application</div>
        <div className="form-row">
          <div className="form-group"><label>Company</label><input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="Company name" /></div>
          <div className="form-group"><label>Role title</label><input value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))} placeholder="Job title" /></div>
          <div className="form-group"><label>City</label><select value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Type</label><select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>{TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>{Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="form-group"><label>Job URL</label><input type="url" value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} placeholder="https://…" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Date applied</label><input type="date" value={form.date_applied} onChange={e => setForm(f => ({...f, date_applied: e.target.value}))} /></div>
          <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
          <div className="form-group" style={{ flex: 2 }}><label>Notes</label><input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Recruiter, contacts, impressions…" /></div>
        </div>
        <button className="btn btn-primary" type="submit"><i className="ti ti-plus" />Add</button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All statuses</option>{Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All cities</option>{['Zürich','Basel'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All types</option>{TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto' }}>{filtered.length} role{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="app-table">
          <thead><tr><th>Company / Role</th><th>City</th><th>Type</th><th>Status</th><th>Applied</th><th>Deadline</th><th>Notes</th><th /></tr></thead>
          <tbody>
            {filtered.length ? filtered.map(a => (
              <tr key={a.id}>
                <td><div className="company-cell">{a.url ? <a href={a.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{a.company}</a> : a.company}</div><div className="role-cell">{a.role}</div></td>
                <td style={{ fontSize: 12 }}>{a.city}</td>
                <td><span className={`badge b-${a.type}`}>{TYPE_LABELS[a.type] || a.type}</span></td>
                <td><select className="status-sel" value={a.status} onChange={e => changeStatus(a.id, e.target.value)}>{Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></td>
                <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{a.date_applied || '—'}</td>
                <td style={{ fontSize: 12, color: deadlineSoon(a.deadline) ? 'var(--amber)' : 'var(--text-3)' }}>{a.deadline || '—'}</td>
                <td className="notes-cell" title={a.notes}>{a.notes || '—'}</td>
                <td><div className="action-cell">
                  <button className="btn btn-sm btn-ghost" onClick={() => goToLetter(a)} title="Write cover letter"><i className="ti ti-file-text" /></button>
                  <button className="btn btn-sm btn-ghost" onClick={() => remove(a.id)} style={{ color: 'var(--red)' }}><i className="ti ti-trash" /></button>
                </div></td>
              </tr>
            )) : <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No applications yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
