// ── Provider helpers ──────────────────────────────────────────────────────────
function getProvider()    { return localStorage.getItem('sjsh_provider')    || 'anthropic'; }
function getOllamaUrl()   { return localStorage.getItem('sjsh_ollama_url')  || 'http://localhost:11434'; }
function getOllamaModel() { return localStorage.getItem('sjsh_ollama_model')|| 'llama3'; }

function saveProvider() {
  const val = document.getElementById('provider-sel')?.value || 'anthropic';
  localStorage.setItem('sjsh_provider', val);
  syncProviderUI();
  updateApiStatus();
  updateScanBtn();
  toast(val === 'ollama' ? 'Switched to Ollama (local, free)' : 'Switched to Anthropic (Claude)');
}

function saveOllamaSettings() {
  const url   = document.getElementById('ollama-url')?.value.trim()   || 'http://localhost:11434';
  const model = document.getElementById('ollama-model')?.value.trim() || 'llama3';
  localStorage.setItem('sjsh_ollama_url',   url);
  localStorage.setItem('sjsh_ollama_model', model);
  toast('Ollama settings saved ✓');
  updateApiStatus();
}

async function testOllama() {
  const el = document.getElementById('ollama-test-result');
  el.textContent = 'Testing…'; el.style.color = 'var(--text-3)';
  const url   = document.getElementById('ollama-url')?.value.trim()   || getOllamaUrl();
  const model = document.getElementById('ollama-model')?.value.trim() || getOllamaModel();
  try {
    const res = await fetch(`${url}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages:[{role:'user',content:'Reply with the word ok only.'}], max_tokens:5 })
    });
    if (res.ok) {
      el.textContent = '✓ Connected'; el.style.color = 'var(--accent)';
    } else {
      const d = await res.json().catch(()=>({}));
      el.textContent = 'Error: ' + (d.error?.message || res.status); el.style.color = 'var(--red)';
    }
  } catch(e) {
    el.textContent = 'Failed — is Ollama running? (' + e.message + ')'; el.style.color = 'var(--red)';
  }
}

function syncProviderUI() {
  const provider = getProvider();
  const sel = document.getElementById('provider-sel');
  if (sel) sel.value = provider;
  const cA = document.getElementById('card-anthropic');
  const cO = document.getElementById('card-ollama');
  if (cA) cA.style.display = provider === 'anthropic' ? '' : 'none';
  if (cO) cO.style.display = provider === 'ollama'    ? '' : 'none';
  const urlEl   = document.getElementById('ollama-url');
  const modelEl = document.getElementById('ollama-model');
  if (urlEl)   urlEl.value   = getOllamaUrl();
  if (modelEl) modelEl.value = getOllamaModel();
}

function updateScanBtn() {
  const btn = document.getElementById('scan-btn');
  if (!btn) return;
  btn.innerHTML = getProvider() === 'ollama'
    ? '<i class="ti ti-map"></i>Get search strategy'
    : '<i class="ti ti-search"></i>Scan for jobs now';
}

// ── API calls ─────────────────────────────────────────────────────────────────
async function callClaude(messages, system, useWebSearch) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_KEY');
  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system,
    messages
  };
  if (useWebSearch) {
    body.tools = [{ type:'web_search_20250305', name:'web_search' }];
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'API error ' + res.status);
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

async function callOllama(messages, system) {
  const url   = getOllamaUrl();
  const model = getOllamaModel();
  const allMessages = system ? [{role:'system', content:system}, ...messages] : messages;
  const res = await fetch(`${url}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: allMessages, stream: false })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Ollama error ' + res.status);
  return data.choices?.[0]?.message?.content || '';
}

async function callAI(messages, system, useWebSearch) {
  if (useWebSearch || getProvider() === 'anthropic') {
    return callClaude(messages, system, useWebSearch);
  }
  return callOllama(messages, system);
}

// ── Profile summary (shared by all AI features) ───────────────────────────────
function buildProfileSummary() {
  const p = state.profile;
  const roles = p.roleTypes.length ? p.roleTypes.join(', ') : 'junior software engineer, data/AI roles, internships';
  return `Candidate profile:
- Name: ${p.name || 'CS graduate student'}
- Education: ${p.bsc || 'BSc Computer Science (Leeds)'} + ${p.msc || 'MSc Computer Science (University of Bern)'}
- Graduation: ${p.grad || 'August 2026'}
- Thesis/project: ${p.thesis || 'Multimodal human-AI interaction system'}
- Work permit: ${p.permit || 'studying in Switzerland'}
- Technical skills: ${[...p.skills, p.otherSkills].filter(Boolean).join(', ') || 'Python, Java, JavaScript, ML basics'}
- Languages: ${p.langs || 'English (fluent)'}
- Target roles: ${roles}
- Key strengths: ${p.strengths || 'strong CS foundations, human-centered thinking, AI/UX intersection, clear technical communication'}
- Work preferences: ${p.prefs || 'hybrid, collaborative, meaning-driven'}
- LinkedIn: ${p.linkedin || 'available'}
- GitHub: ${p.github || 'available'}`.trim();
}

function buildTrackerSummary() {
  const total = state.apps.length;
  const byStatus = {};
  state.apps.forEach(a => { byStatus[a.status] = (byStatus[a.status]||0)+1; });
  const goalsDone = state.goals.filter(g=>g.done).length;
  return `- Total tracked: ${total} roles
- By status: ${Object.entries(byStatus).map(([k,v])=>`${k}: ${v}`).join(', ') || 'none yet'}
- Weekly goals completed: ${goalsDone}/${state.goals.length}
- Role types being tracked: ${[...new Set(state.apps.map(a=>a.type))].join(', ') || 'none yet'}`;
}
