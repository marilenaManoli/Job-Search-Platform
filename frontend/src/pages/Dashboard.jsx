import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appsApi } from '../api/applications'
import { goalsApi } from '../api/goals'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const STATUS_LABELS = { saved: 'Saved', applied: 'Applied', interview: 'Interviewing', offer: 'Offer 🎉', rejected: 'Rejected' }

export default function Dashboard() {
  const [apps, setApps] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    Promise.all([appsApi.list(), goalsApi.list()])
      .then(([a, g]) => { setApps(a); setGoals(g) })
      .finally(() => setLoading(false))
  }, [])

  const toggleGoal = async (id, done) => {
    const updated = await goalsApi.update(id, { done })
    setGoals(g => g.map(x => x.id === id ? updated : x))
  }

  if (loading) return <div className="page"><Spinner text="Loading…" /></div>

  const active     = apps.filter(a => a.status === 'applied' || a.status === 'interview').length
  const interviews = apps.filter(a => a.status === 'interview').length
  const doneGoals  = goals.filter(g => g.done).length
  const pending    = goals.filter(g => !g.done).slice(0, 4)
  const recent     = apps.slice(0, 5)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Target: September 2026 · Zürich & Basel · Junior / Internship / Research</p>
      </div>

      <div className="stats-row">
        {[['Tracked roles', apps.length, 'total saved'], ['Active pipeline', active, 'applied / in progress'], ['Interviews', interviews, 'currently active'], ['Weekly goals', `${doneGoals}/${goals.length}`, 'completed this week']].map(([label, value, sub]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Quick actions</div>
      <div className="quick-actions">
        {[{ to: '/finder', icon: 'ti-search', label: 'Scan for jobs', sub: 'AI-powered job search' }, { to: '/letters', icon: 'ti-file-text', label: 'Write cover letter', sub: 'AI-tailored to company' }, { to: '/outreach', icon: 'ti-send', label: 'Recruiter outreach', sub: 'LinkedIn / email drafts' }, { to: '/tracker', icon: 'ti-plus', label: 'Add application', sub: 'Log a new role' }].map(({ to, icon, label, sub }) => (
          <Link key={to} to={to} className="quick-action">
            <i className={`ti ${icon} qa-icon`} />
            <div><div className="qa-label">{label}</div><div className="qa-sub">{sub}</div></div>
          </Link>
        ))}
      </div>

      <div className="section-label">Recent applications</div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="app-table">
          <thead><tr><th>Company</th><th>Role</th><th>City</th><th>Status</th></tr></thead>
          <tbody>
            {recent.length ? recent.map(a => (
              <tr key={a.id}>
                <td><div className="company-cell">{a.company}</div></td>
                <td><div className="role-cell">{a.role}</div></td>
                <td style={{ fontSize: 12 }}>{a.city}</td>
                <td><span className={`badge b-${a.status}`}>{STATUS_LABELS[a.status] || a.status}</span></td>
              </tr>
            )) : <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No applications yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-label">This week's goals</div>
      {pending.length ? pending.map(g => (
        <div className="goal-item" key={g.id}>
          <input type="checkbox" className="goal-check" checked={g.done} onChange={e => toggleGoal(g.id, e.target.checked)} />
          <span className="goal-text">{g.text}</span>
          <span className="goal-tag-pill">{g.tag}</span>
        </div>
      )) : <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 0' }}>All goals done this week! 🎉</div>}
    </div>
  )
}
