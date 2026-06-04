function renderRecruiters() {
  const grid = document.getElementById('recruiter-grid');
  if (!grid) return;
  grid.innerHTML = RECRUITERS.map(r => `
    <div class="recruiter-card">
      <div class="recruiter-name">${esc(r.name)}</div>
      <div class="recruiter-type">${esc(r.type)}</div>
      <a class="recruiter-url" href="${r.url}" target="_blank"><i class="ti ti-external-link" style="font-size:13px;"></i>${r.url.replace('https://','')}</a>
    </div>`).join('');
}

async function generateOutreach() {
  if (getProvider()==='anthropic' && !getApiKey()) { showPage('settings'); toast('Add your Anthropic API key first'); return; }

  const type    = document.getElementById('out-type').value;
  const name    = document.getElementById('out-name').value.trim();
  const company = document.getElementById('out-company').value.trim();
  const role    = document.getElementById('out-role').value.trim();
  const tone    = document.getElementById('out-tone').value;
  const btn     = document.getElementById('out-btn');
  const out     = document.getElementById('out-output');

  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Writing…';
  out.innerHTML = '<div class="ai-output loading"><div class="spinner"></div><span>Crafting your message…</span></div>';

  const prompt = `Write a ${type} message for a Swiss tech job search.

SENDER (job seeker):
${buildProfileSummary()}

MESSAGE DETAILS:
${name    ? 'Recipient name: '+name : 'Recipient: unnamed (use "Hi there" or appropriate opener)'}
${company ? 'Company/agency: '+company : ''}
${role    ? 'Role or opportunity: '+role : 'Open to junior/graduate tech roles in Switzerland'}
Tone: ${tone}

REQUIREMENTS:
- Keep it concise — LinkedIn DMs should be under 150 words, emails under 200 words
- Sound like a real human, not a template
- Mention the Swiss MSc naturally (it's a local credential, reassuring to Swiss employers)
- If a recruiter: clearly state graduation month, role types, and location flexibility
- Do NOT write "I hope this message finds you well"
- End with a clear, low-pressure call to action
- For LinkedIn DM: no subject line needed
- For email: include a subject line on the first line as "Subject: ..."

Output ONLY the message, nothing else.`;

  try {
    const text = await callAI([{role:'user', content:prompt}],
      'You write short, natural, effective professional outreach messages for job seekers. Messages should feel personal and confident, never desperate or template-like.');
    out.textContent = text;
    document.getElementById('out-copy-btn').style.display = '';
    toast('Message generated ✓');
  } catch(e) {
    out.innerHTML = `<div class="alert alert-warn">${e.message==='NO_KEY'?'API key not set.':'Error: '+esc(e.message)}</div>`;
  }
  btn.disabled = false; btn.innerHTML = '<i class="ti ti-sparkles"></i>Generate message';
}

function copyOutreach() {
  navigator.clipboard.writeText(document.getElementById('out-output').textContent).then(() => toast('Copied ✓'));
}
