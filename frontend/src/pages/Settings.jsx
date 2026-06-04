import { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'

export default function Settings() {
  const { profile, update } = useProfile()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [testResult, setTestResult] = useState('')

  useEffect(() => { if (profile) setForm({ anthropic_api_key: profile.anthropic_api_key, provider: profile.provider, ollama_url: profile.ollama_url, ollama_model: profile.ollama_model }) }, [profile])

  if (!form) return <div className="page"><Spinner text="Loading…" /></div>
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    await update(form); toast('Settings saved ✓')
  }

  const testOllama = async () => {
    setTestResult('Testing…')
    try {
      const res = await fetch(`${form.ollama_url}/v1/chat/completions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: form.ollama_model, messages: [{ role: 'user', content: 'Reply with ok only.' }], max_tokens: 5 })
      })
      setTestResult(res.ok ? '✓ Connected' : 'Error: ' + res.status)
    } catch (e) { setTestResult('Failed — is Ollama running?') }
  }

  return (
    <div className="page">
      <div className="page-header"><h1>Settings</h1><p>AI provider and account configuration.</p></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>AI Provider</div>
        <div className="form-group">
          <label>Active provider</label>
          <select value={form.provider} onChange={e => set('provider', e.target.value)} style={{ maxWidth: 260 }}>
            <option value="anthropic">Anthropic — Claude API (paid)</option>
            <option value="ollama">Ollama — local model (free)</option>
          </select>
        </div>
      </div>

      {form.provider === 'anthropic' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Anthropic API key</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Get yours at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>console.anthropic.com</a>. Stored in the database, not your browser.</div>
          <div className="form-group"><input type="password" value={form.anthropic_api_key} onChange={e => set('anthropic_api_key', e.target.value)} placeholder="sk-ant-api-…" /></div>
        </div>
      )}

      {form.provider === 'ollama' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Ollama — local model <span className="badge b-offer" style={{ fontSize: 10, verticalAlign: 'middle' }}>Free</span></div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Requires <a href="https://ollama.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Ollama</a> running. Live web search (Find Jobs) still requires Anthropic.</div>
          <div className="form-row">
            <div className="form-group"><label>Ollama URL</label><input value={form.ollama_url} onChange={e => set('ollama_url', e.target.value)} placeholder="http://localhost:11434" /></div>
            <div className="form-group"><label>Model name</label><input value={form.ollama_model} onChange={e => set('ollama_model', e.target.value)} placeholder="llama3" /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn" onClick={testOllama}><i className="ti ti-plug" />Test connection</button>
            {testResult && <span style={{ fontSize: 12, color: testResult.startsWith('✓') ? 'var(--accent)' : 'var(--red)' }}>{testResult}</span>}
          </div>
          <div className="alert alert-info" style={{ marginTop: 10, fontSize: 12 }}>
            <i className="ti ti-terminal" style={{ verticalAlign: -2, marginRight: 5 }} />
            Start Ollama with: <code style={{ fontFamily: 'var(--mono)', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 3 }}>OLLAMA_ORIGINS=* ollama serve</code>
          </div>
        </div>
      )}

      <button className="btn btn-primary" onClick={save}><i className="ti ti-device-floppy" />Save settings</button>
    </div>
  )
}
