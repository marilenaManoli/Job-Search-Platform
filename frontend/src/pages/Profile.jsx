import { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'

const SKILLS_LIST = ['Python','Java','JavaScript','TypeScript','React','Vue','Node.js','SQL','PostgreSQL','MongoDB','Git','Docker','Kubernetes','AWS','GCP','Azure','PyTorch','TensorFlow','scikit-learn','Pandas','NumPy','REST APIs','GraphQL','C++','C#','Kotlin','Swift','Figma','Linux','Bash']
const ROLE_MAP = { swe:'junior', growth:'growth', data:'data', ai:'ai', pm:'pm', ux:'ux', research:'research', intern:'intern', consult:'consult' }
const ROLE_LABELS = { swe:'Junior SWE', growth:'Growth Engineer', data:'Data Engineer', ai:'AI / ML', pm:'AI Product', ux:'UX / HCI', research:'Research', intern:'Internship', consult:'Consulting' }

export default function Profile() {
  const { profile, update } = useProfile()
  const toast = useToast()
  const [form, setForm] = useState(null)

  useEffect(() => { if (profile) setForm({ ...profile }) }, [profile])

  if (!form) return <div className="page"><Spinner text="Loading…" /></div>

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleSkill = s => set('skills', form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s])
  const toggleRole  = v => set('role_types', form.role_types.includes(v) ? form.role_types.filter(x => x !== v) : [...form.role_types, v])

  const save = async e => {
    e.preventDefault()
    await update(form); toast('Profile saved ✓')
  }

  return (
    <div className="page">
      <div className="page-header"><h1>My Profile</h1><p>Used by all AI tools to personalise cover letters, outreach, and job matching.</p></div>
      <form className="card" onSubmit={save}>
        <div className="form-row">
          <div className="form-group"><label>Full name</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Emma Clarke" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>LinkedIn URL</label><input type="url" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" /></div>
          <div className="form-group"><label>GitHub URL</label><input type="url" value={form.github} onChange={e => set('github', e.target.value)} placeholder="github.com/yourname" /></div>
        </div>
        <div className="divider" />
        <div className="form-row">
          <div className="form-group"><label>Bachelor's degree</label><input value={form.bsc} onChange={e => set('bsc', e.target.value)} placeholder="BSc Computer Science, University of Leeds" /></div>
          <div className="form-group"><label>Master's degree</label><input value={form.msc} onChange={e => set('msc', e.target.value)} placeholder="MSc Computer Science, University of Bern" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Graduation date</label><input value={form.grad} onChange={e => set('grad', e.target.value)} placeholder="August 2026" /></div>
          <div className="form-group"><label>Thesis / main project</label><input value={form.thesis} onChange={e => set('thesis', e.target.value)} placeholder="Multimodal human-AI interaction system" /></div>
        </div>
        <div className="form-group"><label>Work permit / nationality</label>
          <select value={form.permit} onChange={e => set('permit', e.target.value)}>
            <option value="">Select…</option>
            <option value="EU citizen (free movement)">EU citizen — free movement in Switzerland</option>
            <option value="UK citizen (studied in Switzerland)">UK citizen — studied in Switzerland</option>
            <option value="Non-EU/EFTA (Swiss residence permit)">Non-EU/EFTA with Swiss residence permit</option>
            <option value="Swiss citizen">Swiss citizen</option>
          </select>
        </div>
        <div className="divider" />
        <div className="form-group"><label>Technical skills (click to toggle)</label>
          <div className="skills-grid">
            {SKILLS_LIST.map(s => (
              <div key={s} className={`skill-tag${form.skills.includes(s) ? ' selected' : ''}`} onClick={() => toggleSkill(s)}>
                {s}{form.skills.includes(s) && <i className="ti ti-check" />}
              </div>
            ))}
          </div>
        </div>
        <div className="form-group"><label>Other skills (comma separated)</label><input value={form.other_skills} onChange={e => set('other_skills', e.target.value)} placeholder="Figma, Jupyter, React, SQL" /></div>
        <div className="divider" />
        <div className="form-group"><label>Languages</label><input value={form.langs} onChange={e => set('langs', e.target.value)} placeholder="English (native), German (B1)" /></div>
        <div className="form-group"><label>Target role types</label>
          <div className="checkbox-group">
            {Object.entries(ROLE_MAP).map(([k, v]) => (
              <label key={k} className={`checkbox-pill${form.role_types.includes(v) ? ' checked' : ''}`}>
                <input type="checkbox" checked={form.role_types.includes(v)} onChange={() => toggleRole(v)} style={{ display: 'none' }} />
                <span>{ROLE_LABELS[k]}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-group"><label>Key strengths (1–3 sentences)</label><textarea rows={3} value={form.strengths} onChange={e => set('strengths', e.target.value)} /></div>
        <div className="form-group"><label>Work style preferences</label><input value={form.prefs} onChange={e => set('prefs', e.target.value)} /></div>
        <button className="btn btn-primary" type="submit"><i className="ti ti-device-floppy" />Save profile</button>
      </form>
    </div>
  )
}
