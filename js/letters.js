async function generateLetter() {
  if (getProvider()==='anthropic' && !getApiKey()) { showPage('settings'); toast('Add your Anthropic API key first'); return; }

  const company = document.getElementById('cl-company').value.trim();
  const role    = document.getElementById('cl-role').value.trim();
  if (!company || !role) { toast('Please enter company and role title'); return; }

  const jd    = document.getElementById('cl-jd').value.trim();
  const why   = document.getElementById('cl-why').value.trim();
  const tone  = document.getElementById('cl-tone').value;
  const len   = document.getElementById('cl-len').value;
  const extra = document.getElementById('cl-extra').value.trim();
  const btn   = document.getElementById('cl-btn');
  const out   = document.getElementById('cl-output');

  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Writing…';
  out.innerHTML = '<div class="ai-output loading"><div class="spinner"></div><span>Tailoring your cover letter…</span></div>';

  const prompt = `Write a cover letter for this job application.

CANDIDATE:
${buildProfileSummary()}

TARGET JOB:
Company: ${company}
Role: ${role}
${jd  ? 'Job description:\n' + jd : ''}
${why ? 'Why this company/role: ' + why : ''}

REQUIREMENTS:
- Tone: ${tone}
- Length: ${len}
- ${extra ? 'Special instructions: '+extra : 'Standard professional cover letter'}
- Write for a Swiss/European professional context
- Do NOT use "Dear Sir/Madam" — use "Dear Hiring Team" or "Dear [Company] Team" if no name given
- Do NOT use clichés like "I am writing to apply" as the opening
- Highlight the Swiss MSc connection as it gives local credibility
- Start with something compelling about why the candidate and company are a match
- End with a confident but not arrogant close
- Include a placeholder [City, Date] at top and [Phone] where relevant

Output ONLY the letter text, nothing else — no explanation, no "Here is your letter", just the letter.`;

  try {
    const text = await callAI([{role:'user', content:prompt}],
      'You are an expert career coach specialising in Swiss tech job applications. Write compelling, personalised cover letters that feel human, not AI-generated. Never use generic filler. Every letter should feel written specifically for that company and role.');
    out.textContent = text;
    document.getElementById('copy-btn').style.display = '';
    document.getElementById('dl-btn').style.display   = '';
    toast('Cover letter generated ✓');
  } catch(e) {
    out.innerHTML = `<div class="alert alert-warn">${e.message==='NO_KEY'?'API key not set.':'Error: '+esc(e.message)}</div>`;
  }
  btn.disabled = false; btn.innerHTML = '<i class="ti ti-sparkles"></i>Generate cover letter';
}

function copyLetter() {
  navigator.clipboard.writeText(document.getElementById('cl-output').textContent).then(() => toast('Copied to clipboard ✓'));
}

function downloadLetter() {
  const text    = document.getElementById('cl-output').textContent;
  const company = document.getElementById('cl-company').value || 'company';
  const role    = document.getElementById('cl-role').value    || 'role';
  const blob = new Blob([text], {type:'text/plain'});
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `cover_letter_${company.replace(/\s+/g,'_')}_${role.replace(/\s+/g,'_')}.txt`;
  a.click();
  toast('Downloaded ✓');
}
