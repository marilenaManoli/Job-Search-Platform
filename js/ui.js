const STATUS_LABELS = { saved:'Saved', applied:'Applied', interview:'Interviewing', offer:'Offer 🎉', rejected:'Rejected' };
const TYPE_LABELS   = { junior:'Junior', intern:'Internship', research:'Research' };

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function toast(msg) {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.classList.add('show'), 20);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3000);
}

function updateApiStatus() {
  const key      = getApiKey();
  const provider = getProvider();
  const dot = document.getElementById('api-dot');
  const lbl = document.getElementById('api-label');
  const ready = provider === 'ollama' || !!key;
  if (dot) dot.className = 'api-dot' + (ready ? ' ok' : '');
  if (lbl) lbl.textContent = provider === 'ollama'
    ? 'AI: Ollama (' + getOllamaModel() + ')'
    : (key ? 'AI: Claude (ready)' : 'AI: no key');
  const keyInput = document.getElementById('api-key-input');
  if (keyInput && key) keyInput.placeholder = '••••••••' + key.slice(-6);
}

function checkApiWarnings(name) {
  const aiPages = ['finder','letters','outreach','suggestions'];
  if (!aiPages.includes(name)) return;
  const ready = getProvider() === 'ollama' || !!getApiKey();
  const el = document.getElementById(name+'-no-api');
  if (el) el.style.display = ready ? 'none' : 'block';
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  const btn = document.querySelector(`[onclick="showPage('${name}')"]`);
  if (btn) btn.classList.add('active');

  if (name === 'dashboard')   renderDashboard();
  if (name === 'tracker')     renderTracker();
  if (name === 'goals')       renderGoals();
  if (name === 'profile')     loadProfileForm();
  if (name === 'outreach')    renderRecruiters();
  if (name === 'suggestions') initSuggestionsPage();
  if (name === 'settings')    syncProviderUI();
  if (name === 'finder')      { renderSearchLinks(); updateScanBtn(); }

  checkApiWarnings(name);
}
