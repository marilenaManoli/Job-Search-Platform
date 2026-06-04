const CAT_KEYWORDS = {
  all:      'junior software engineer OR data engineer OR AI engineer OR internship',
  swe:      'junior software engineer developer',
  growth:   'growth engineer product growth experimentation',
  data:     'data engineer analyst machine learning',
  ai:       'AI engineer machine learning NLP',
  research: 'research engineer scientist',
  intern:   'software technology internship',
  product:  'product manager UX researcher digital'
};

const CAT_DESCRIPTIONS = {
  all:      'junior software engineer, data engineer, AI/ML, research assistant, or internship roles',
  swe:      'junior software engineer or junior developer roles',
  growth:   'growth engineer, product growth, growth hacking, B2B SaaS growth, experimentation, product-led growth, or growth analytics roles',
  data:     'data engineer, data analyst, or ML engineer roles',
  ai:       'AI engineer, human-centered AI, AI product, or AI UX roles',
  research: 'research assistant, research engineer, or academic software roles',
  intern:   'any technology internships',
  product:  'AI product manager, UX researcher, technical product roles'
};

const CITY_LOCATION = { both:'Switzerland', zurich:'Zurich', basel:'Basel', remote:'Switzerland remote' };
const CITY_DESC     = { both:'Zürich or Basel', zurich:'Zürich', basel:'Basel', remote:'remote or anywhere in Switzerland' };

function renderSearchLinks() {
  const el = document.getElementById('search-links');
  if (!el) return;
  const cat  = document.getElementById('scan-cat')?.value  || 'all';
  const city = document.getElementById('scan-city')?.value || 'both';
  const kw   = document.getElementById('scan-kw')?.value.trim() || '';
  const base     = CAT_KEYWORDS[cat] || CAT_KEYWORDS.all;
  const query    = kw ? `${base} ${kw}` : base;
  const location = CITY_LOCATION[city] || 'Switzerland';
  const q   = encodeURIComponent(query);
  const loc = encodeURIComponent(location);
  const bq  = encodeURIComponent(base);

  const links = [
    { name:'Jobs.ch',       url:`https://www.jobs.ch/en/vacancies/?term=${q}&location=${loc}`,                        color:'var(--accent)' },
    { name:'LinkedIn',      url:`https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}%2C+Switzerland`, color:'var(--blue)' },
    { name:'SwissDevJobs',  url:`https://swissdevjobs.ch/?search=${bq}`,                                               color:'var(--purple)' },
    { name:'Indeed CH',     url:`https://ch.indeed.com/jobs?q=${q}&l=${loc}`,                                          color:'var(--amber)' },
    { name:'Google Jobs',   url:`https://www.google.com/search?q=${q}+jobs+${loc}&ibp=htl;jobs`,                       color:'var(--red)' },
    { name:'Glassdoor',     url:`https://www.glassdoor.com/Job/switzerland-jobs-SRCH_IL.0,11_IN209.htm?keyword=${q}`,  color:'var(--text-2)' },
    { name:'English Forum', url:`https://www.englishforum.ch/jobs/search/?q=${bq}`,                                    color:'var(--accent)' },
    { name:'DataCareer.ch', url:`https://datacareer.ch/jobs?search=${q}`,                                              color:'var(--blue)' },
  ];

  el.innerHTML = links.map(l =>
    `<a href="${l.url}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:var(--rad-sm);border:1px solid ${l.color}30;background:${l.color}10;color:${l.color};font-size:12px;font-weight:500;text-decoration:none;white-space:nowrap;">
      <i class="ti ti-external-link" style="font-size:13px;"></i>${esc(l.name)}
    </a>`
  ).join('');
}

async function scanJobs() {
  const usingOllama = getProvider() === 'ollama';
  if (!usingOllama && !getApiKey()) { showPage('settings'); toast('Please add your Anthropic API key first'); return; }

  const cat  = document.getElementById('scan-cat').value;
  const city = document.getElementById('scan-city').value;
  const kw   = document.getElementById('scan-kw').value.trim();
  const btn     = document.getElementById('scan-btn');
  const results = document.getElementById('scan-results');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Scanning…';
  results.innerHTML = `<div class="ai-output loading"><div class="spinner"></div><span>${usingOllama ? 'Generating search strategy with local model…' : 'Searching Jobs.ch, SwissDevJobs, LinkedIn and more…'}</span></div>`;

  const profile  = buildProfileSummary();
  const catDesc  = CAT_DESCRIPTIONS[cat] || CAT_DESCRIPTIONS.all;
  const cityDesc = CITY_DESC[city] || 'Zürich or Basel';
  const isOllama = usingOllama;

  const webPrompt = `You are a job search assistant. Search the web RIGHT NOW for current job openings in Switzerland.

Find real, current job listings for: ${catDesc}
Location: ${cityDesc}
Requirements: English-friendly, suitable for a recent CS MSc graduate${kw ? ', matching keywords: '+kw : ''}

Search these sources: jobs.ch, swissdevjobs.ch, linkedin.com/jobs, glassdoor.com, datacareer.ch, englishforum.ch/jobs, swisslinks.com

For each job found, provide:
- Job title
- Company name
- Location (city, remote/hybrid info)
- Brief description (1-2 sentences)
- Why it suits this candidate
- URL or where to find it

Format each as a clear block. Aim to find 6-10 real current openings. Focus on roles posted in the last 30 days if possible.

Candidate being matched:
${profile}`;

  const strategyPrompt = `You are a Swiss tech job search assistant. The candidate below is looking for ${catDesc} in ${cityDesc}.

${profile}

Since you cannot search the web, give a targeted search strategy instead:

1. **Exact search terms to use** — 6–8 specific queries to type into jobs.ch, LinkedIn, and Google Jobs (mix English and German terms where relevant)
2. **Companies to check directly** — 10 specific Swiss companies in ${cityDesc} that hire for these roles and have English-friendly cultures. Give their careers page path.
3. **Best timing** — when new listings typically appear on Swiss job boards and when to apply
4. **Red flags to avoid** — common filters or wording that would exclude this candidate
5. **One niche tip** — a less obvious source or tactic specific to this role type in Switzerland

Be specific and practical. Reference the candidate's actual skills and thesis.`;

  try {
    let text;
    if (isOllama) {
      btn.innerHTML = '<div class="spinner"></div> Generating strategy…';
      results.innerHTML = `<div class="ai-output loading"><div class="spinner"></div><span>Building a search strategy with your local model…</span></div>`;
      text = await callOllama([{role:'user', content:strategyPrompt}],
        'You are a practical Swiss job search advisor. Give specific, actionable advice for the Swiss tech job market.');
      results.innerHTML = `
        <div class="alert alert-info" style="margin-bottom:12px;">
          <i class="ti ti-bulb" style="vertical-align:-2px; margin-right:6px;"></i>
          Running on Ollama — live web search unavailable. Use the quick links above to search job boards directly, then apply this strategy.
        </div>
        <div class="card"><div class="stream-box" style="white-space:pre-wrap; line-height:1.8;">${esc(text)}</div></div>
        <div style="font-size:12px; color:var(--text-3); margin-top:10px;"><i class="ti ti-bulb" style="vertical-align:-2px;"></i> Switch to Anthropic in Settings to enable live web search.</div>`;
      toast('Search strategy ready ✓');
    } else {
      text = await callClaude([{role:'user', content:webPrompt}],
        'You are a helpful Swiss job search assistant. Always search the web for the most current job listings. Present results clearly and practically.',
        true
      );
      renderScanResults(text);
      toast('Scan complete — found new openings!');
    }
    state.scanResults = text;
    const last = new Date().toLocaleString('en-CH', {dateStyle:'short', timeStyle:'short'});
    document.getElementById('scan-last').textContent = (isOllama ? 'Last strategy: ' : 'Last scan: ') + last;
  } catch(e) {
    results.innerHTML = `<div class="alert alert-warn"><i class="ti ti-alert-triangle" style="vertical-align:-2px; margin-right:6px;"></i>${e.message==='NO_KEY' ? 'API key not set. Go to Settings.' : 'Error: '+esc(e.message)}</div>`;
  }

  btn.disabled = false;
  btn.innerHTML = isOllama
    ? '<i class="ti ti-map"></i>Get search strategy'
    : '<i class="ti ti-search"></i>Scan for jobs now';
  save();
}

function renderScanResults(text) {
  const el = document.getElementById('scan-results');
  el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <span style="font-size:13px; font-weight:500;">Search results</span>
      <button class="btn btn-sm" onclick="showPage('tracker')"><i class="ti ti-plus"></i>Go to tracker to add roles</button>
    </div>
    <div class="card"><div class="stream-box" style="white-space:pre-wrap; line-height:1.8;">${esc(text)}</div></div>
    <div style="font-size:12px; color:var(--text-3); margin-top:10px;"><i class="ti ti-bulb" style="vertical-align:-2px;"></i> Tip: Copy any role to the tracker, then use the cover letter tool to write a tailored application.</div>`;
}
