import { useState, useEffect } from 'react'
import { goalsApi } from '../api/goals'
import Spinner from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const TAGS = ['Apply', 'Network', 'Profile', 'Prep', 'Research', 'Other']

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Apply')
  const toast = useToast()

  useEffect(() => { goalsApi.list().then(setGoals).finally(() => setLoading(false)) }, [])

  const done  = goals.filter(g => g.done).length
  const pct   = goals.length ? Math.round(done / goals.length * 100) : 0

  const add = async () => {
    if (!text.trim()) return
    const g = await goalsApi.create({ text: text.trim(), tag })
    setGoals(prev => [...prev, g]); setText('')
  }

  const toggle = async (id, val) => {
    const updated = await goalsApi.update(id, { done: val })
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
  }

  const remove = async id => {
    await goalsApi.delete(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const reset = async () => {
    if (!confirm('Start a new week? This will uncheck all goals.')) return
    const updated = await goalsApi.resetWeek()
    setGoals(updated); toast('New week started — go get it! 🚀')
  }

  if (loading) return <div className="page"><Spinner text="Loading…" /></div>

  return (
    <div className="page">
      <div className="page-header"><h1>Weekly Goals</h1><p>Track your weekly job search actions.</p></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>This week</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{done} of {goals.length} done ({pct}%)</div>
          </div>
          <button className="btn btn-sm" onClick={reset}><i className="ti ti-refresh" />New week</button>
        </div>
        <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="form-row" style={{ marginBottom: 14 }}>
        <div className="form-group" style={{ flex: 3 }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a goal…" onKeyDown={e => e.key === 'Enter' && add()} />
        </div>
        <div className="form-group">
          <select value={tag} onChange={e => setTag(e.target.value)}>{TAGS.map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <button className="btn btn-primary" onClick={add} style={{ height: 36, alignSelf: 'flex-end' }}><i className="ti ti-plus" />Add</button>
      </div>

      {goals.map(g => (
        <div className="goal-item" key={g.id}>
          <input type="checkbox" className="goal-check" checked={g.done} onChange={e => toggle(g.id, e.target.checked)} />
          <span className={`goal-text${g.done ? ' done' : ''}`}>{g.text}</span>
          <span className="goal-tag-pill">{g.tag}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => remove(g.id)} style={{ color: 'var(--text-3)' }}><i className="ti ti-x" /></button>
        </div>
      ))}
      {!goals.length && <div className="empty"><i className="ti ti-checklist" /><p>No goals yet. Add your first one above.</p></div>}
    </div>
  )
}
