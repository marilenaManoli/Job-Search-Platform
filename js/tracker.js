function renderTracker() {
  const sf = document.getElementById('filter-status')?.value || '';
  const cf = document.getElementById('filter-city')?.value   || '';
  const tf = document.getElementById('filter-type')?.value   || '';
  let apps = state.apps;
  if (sf) apps = apps.filter(a => a.status===sf);
  if (cf) apps = apps.filter(a => a.city===cf);
  if (tf) apps = apps.filter(a => a.type===tf);

  const tbody   = document.getElementById('app-tbody');
  const empty   = document.getElementById('tracker-empty');
  const counter = document.getElementById('tracker-count');
  if (counter) counter.textContent = apps.length + ' role' + (apps.length!==1?'s':'');

  if (!apps.length) {
    if (tbody) tbody.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = apps.map(a => `
    <tr>
      <td>
        <div class="company-cell"><a href="${esc(a.url||'#')}" target="_blank" style="color:inherit; text-decoration:${a.url?'underline':'none'};">${esc(a.company)}</a></div>
        <div class="role-cell">${esc(a.role)}</div>
      </td>
      <td style="font-size:12px;">${esc(a.city)}</td>
      <td><span class="badge b-${a.type}">${TYPE_LABELS[a.type]||a.type}</span></td>
      <td>
        <select class="status-sel" onchange="changeStatus(${a.id},this.value)">
          ${Object.entries(STATUS_LABELS).map(([v,l])=>`<option value="${v}" ${a.status===v?'selected':''}>${l}</option>`).join('')}
        </select>
      </td>
      <td style="font-size:12px; color:var(--text-3);">${a.date||'—'}</td>
      <td style="font-size:12px; color:${isDeadlineSoon(a.deadline)?'var(--amber)':'var(--text-3)'};">${a.deadline||'—'}</td>
      <td class="notes-cell" title="${esc(a.notes||'')}">${esc(a.notes||'—')}</td>
      <td>
        <div class="action-cell">
          <button class="btn btn-sm btn-ghost" onclick="openLetterFor(${a.id})" title="Write cover letter"><i class="ti ti-file-text"></i></button>
          <button class="btn btn-sm btn-ghost" title="Delete" onclick="deleteApp(${a.id})" style="color:var(--red);"><i class="ti ti-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function isDeadlineSoon(d) {
  if (!d) return false;
  const diff = (new Date(d) - new Date()) / (1000*60*60*24);
  return diff >= 0 && diff <= 7;
}

function addApp() {
  const company = document.getElementById('add-company').value.trim();
  const role    = document.getElementById('add-role').value.trim();
  if (!company || !role) { toast('Please enter company and role'); return; }
  state.apps.push({
    id:       state.nextId++,
    company, role,
    city:     document.getElementById('add-city').value,
    type:     document.getElementById('add-type').value,
    status:   document.getElementById('add-status').value,
    url:      document.getElementById('add-url').value.trim(),
    date:     document.getElementById('add-date').value,
    deadline: document.getElementById('add-deadline').value,
    notes:    document.getElementById('add-notes').value.trim()
  });
  ['add-company','add-role','add-url','add-notes'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  save(); renderTracker(); toast('Application added ✓');
}

function deleteApp(id) {
  if (!confirm('Remove this application?')) return;
  state.apps = state.apps.filter(a => a.id!==id);
  save(); renderTracker(); toast('Removed');
}

function changeStatus(id, val) {
  state.apps = state.apps.map(a => a.id===id ? {...a, status:val} : a);
  save();
  if (val==='offer') toast('🎉 Congratulations on the offer!');
}

function openLetterFor(id) {
  const app = state.apps.find(a => a.id===id);
  if (!app) return;
  document.getElementById('cl-company').value = app.company;
  document.getElementById('cl-role').value    = app.role;
  showPage('letters');
  toast('Job details pre-filled — add the job description and generate your letter');
}
