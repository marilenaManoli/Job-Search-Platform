const SECTION_META = {
  'Role Fit':               { icon:'ti-target',     color:'var(--accent)' },
  'Companies to Target':    { icon:'ti-building',    color:'var(--blue)' },
  'Strengths to Highlight': { icon:'ti-star',        color:'var(--amber)' },
  'Skill Gaps':             { icon:'ti-trending-up', color:'var(--purple)' },
  'Quick Wins This Week':   { icon:'ti-bolt',        color:'var(--accent)' },
};

function initSuggestionsPage() {
  // user triggers manually
}

async function generateSuggestions() {
  if (getProvider()==='anthropic' && !getApiKey()) { showPage('settings'); toast('Add your Anthropic API key first'); return; }

  const btn     = document.getElementById('sug-btn');
  const results = document.getElementById('sug-results');

  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Analysing…';
  results.innerHTML = `<div class="ai-output loading"><div class="spinner"></div><span>Analysing your profile and search progress…</span></div>`;

  const prompt = `Analyse this job seeker's profile and provide personalised, actionable suggestions to sharpen their Swiss tech job search.

${buildProfileSummary()}

Current search progress:
${buildTrackerSummary()}

Respond in exactly these 5 sections. Each section must start on a new line with ## followed by the exact section name below.

## Role Fit
Which specific role types match this candidate's background best and why. Be specific about what makes them a strong or weak fit — reference their actual thesis, skills, and degree.

## Companies to Target
List 8–10 real Swiss companies in Zürich or Basel they should apply to, with a one-line reason for each. Include a mix of startups, scale-ups, and established companies. Consider their English-friendly requirement.

## Strengths to Highlight
What to actively emphasise in cover letters and interviews given their specific background. Reference their actual skills and thesis topic.

## Skill Gaps
2–4 specific gaps that are holding them back for their target roles, with a concrete suggestion for each (a course, project, or quick win).

## Quick Wins This Week
5 specific, actionable tasks for the next 7 days — name real companies, real platforms, or real actions. No generic advice.

Be direct and specific. Reference the candidate's actual profile details throughout.`;

  try {
    const text = await callAI(
      [{role:'user', content:prompt}],
      'You are a Swiss tech career advisor. Give direct, specific, actionable advice. Always reference the candidate\'s actual profile — never give generic job search tips.'
    );
    renderSuggestions(text);
    document.getElementById('sug-last').textContent = 'Last updated: ' + new Date().toLocaleString('en-CH', {dateStyle:'short', timeStyle:'short'});
    toast('Suggestions ready ✓');
  } catch(e) {
    results.innerHTML = `<div class="alert alert-warn">${e.message==='NO_KEY'?'API key not set.':'Error: '+esc(e.message)}</div>`;
  }
  btn.disabled = false; btn.innerHTML = '<i class="ti ti-sparkles"></i>Analyse my profile';
}

function renderSuggestions(text) {
  const el       = document.getElementById('sug-results');
  const sections = text.split(/(?:^|\n)##\s+/).filter(s => s.trim());

  if (!sections.length) {
    el.innerHTML = `<div class="card"><div class="stream-box" style="white-space:pre-wrap;">${esc(text)}</div></div>`;
    return;
  }

  const cards = sections.map(section => {
    const newline = section.indexOf('\n');
    const title   = newline===-1 ? section.trim() : section.slice(0, newline).trim();
    const body    = newline===-1 ? '' : section.slice(newline+1).trim();
    const meta    = SECTION_META[title] || { icon:'ti-bulb', color:'var(--accent)' };
    const full    = title==='Quick Wins This Week';
    return `<div class="card" style="${full?'grid-column:1/-1;':''}">
      <div style="display:flex; align-items:center; gap:9px; margin-bottom:12px;">
        <i class="ti ${meta.icon}" style="font-size:18px; color:${meta.color};"></i>
        <span style="font-size:14px; font-weight:500;">${esc(title)}</span>
      </div>
      <div style="font-size:13px; line-height:1.8; white-space:pre-wrap; color:var(--text);">${esc(body)}</div>
    </div>`;
  }).join('');

  el.innerHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:14px;">${cards}</div>`;
}
