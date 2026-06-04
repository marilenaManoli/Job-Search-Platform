import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'

const NAV = [
  { section: 'Overview',     items: [{ to: '/',            icon: 'ti-layout-dashboard', label: 'Dashboard' }, { to: '/profile', icon: 'ti-user-circle', label: 'My Profile' }] },
  { section: 'Applications', items: [{ to: '/tracker',     icon: 'ti-briefcase',        label: 'Tracker' },   { to: '/finder',  icon: 'ti-search',      label: 'Find Jobs (AI)' }] },
  { section: 'AI Tools',     items: [{ to: '/letters',     icon: 'ti-file-text',        label: 'Cover Letters' }, { to: '/outreach', icon: 'ti-send', label: 'Outreach' }, { to: '/suggestions', icon: 'ti-bulb', label: 'Suggestions' }, { to: '/goals', icon: 'ti-checklist', label: 'Weekly Goals' }] },
  { section: 'Config',       items: [{ to: '/settings',    icon: 'ti-settings',         label: 'Settings' }] },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  const ready = profile?.provider === 'ollama' || !!profile?.anthropic_api_key
  const label = profile?.provider === 'ollama'
    ? `AI: Ollama (${profile.ollama_model})`
    : (profile?.anthropic_api_key ? 'AI: Claude (ready)' : 'AI: no key')

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="sidebar">
      <div className="sidebar-head">
        <h2>🇨🇭 Job Hub</h2>
        <p>Swiss Search Tracker</p>
      </div>

      {NAV.map(({ section, items }) => (
        <div className="nav-section" key={section}>
          <div className="nav-label">{section}</div>
          {items.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className={`ti ${icon}`} /><span>{label}</span>
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="api-status">
          <div className={`api-dot${ready ? ' ok' : ''}`} />
          <span>{label}</span>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ marginTop: 4 }}>
          <i className="ti ti-logout" /><span>Log out</span>
        </button>
      </div>
    </nav>
  )
}
