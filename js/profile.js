const ROLE_MAP = {swe:'junior',growth:'growth',data:'data',ai:'ai',pm:'pm',ux:'ux',research:'research',intern:'intern',consult:'consult'};

function buildSkillsGrid() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = SKILLS_LIST.map(s => `
    <div class="skill-tag ${state.profile.skills.includes(s)?'selected':''}" onclick="toggleSkill(this,'${s}')">
      ${s}${state.profile.skills.includes(s)?'<i class="ti ti-check"></i>':''}
    </div>`).join('');
}

function toggleSkill(el, skill) {
  const idx = state.profile.skills.indexOf(skill);
  if (idx >= 0) { state.profile.skills.splice(idx,1); el.classList.remove('selected'); el.innerHTML = skill; }
  else          { state.profile.skills.push(skill);   el.classList.add('selected');    el.innerHTML = skill+'<i class="ti ti-check"></i>'; }
}

function togglePill(cb, pillId) {
  document.getElementById(pillId).classList.toggle('checked', cb.checked);
}

function loadProfileForm() {
  const p = state.profile;
  ['name','email','linkedin','github','bsc','msc','grad','thesis','langs','otherSkills','strengths','prefs'].forEach(f => {
    const el = document.getElementById('p-'+f); if (el) el.value = p[f]||'';
  });
  if (p.permit) document.getElementById('p-permit').value = p.permit;
  buildSkillsGrid();
  const types = p.roleTypes || [];
  Object.entries(ROLE_MAP).forEach(([k,v]) => {
    const cb   = document.getElementById('rt-'+k);
    const pill = document.getElementById('pill-'+k);
    if (cb && pill) { cb.checked = types.includes(v); pill.classList.toggle('checked', cb.checked); }
  });
}

function saveProfile() {
  const p = state.profile;
  ['name','email','linkedin','github','bsc','msc','grad','thesis','langs','otherSkills','strengths','prefs'].forEach(f => {
    const el = document.getElementById('p-'+f); if (el) p[f] = el.value.trim();
  });
  p.permit    = document.getElementById('p-permit').value;
  p.roleTypes = Object.entries(ROLE_MAP).filter(([k]) => document.getElementById('rt-'+k)?.checked).map(([,v]) => v);
  save(); toast('Profile saved ✓'); updateApiStatus();
}
