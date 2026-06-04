function renderDashboard() {
  const total      = state.apps.length;
  const active     = state.apps.filter(a => a.status==='applied' || a.status==='interview').length;
  const interviews = state.apps.filter(a => a.status==='interview').length;
  const doneGoals  = state.goals.filter(g => g.done).length;
  const totalGoals = state.goals.length;

  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Tracked roles</div><div class="stat-value">${total}</div><div class="stat-sub">total saved</div></div>
    <div class="stat-card"><div class="stat-label">Active pipeline</div><div class="stat-value">${active}</div><div class="stat-sub">applied / in progress</div></div>
    <div class="stat-card"><div class="stat-label">Interviews</div><div class="stat-value">${interviews}</div><div class="stat-sub">currently active</div></div>
    <div class="stat-card"><div class="stat-label">Weekly goals</div><div class="stat-value">${doneGoals}/${totalGoals}</div><div class="stat-sub">completed this week</div></div>
  `;

  const recent = [...state.apps].slice(-5).reverse();
  const tbody  = document.querySelector('#dash-apps tbody');
  if (!recent.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-3); padding:20px;">No applications yet.</td></tr>';
  } else {
    tbody.innerHTML = recent.map(a => `
      <tr>
        <td><div class="company-cell">${esc(a.company)}</div><div class="role-cell">${esc(a.role)}</div></td>
        <td style="font-size:12px;">${esc(a.city)}</td>
        <td><span class="badge b-${a.type}">${a.type}</span></td>
        <td><span class="badge b-${a.status}">${STATUS_LABELS[a.status]||a.status}</span></td>
      </tr>`).join('');
  }

  const goalsDiv = document.getElementById('dash-goals');
  const pending  = state.goals.filter(g => !g.done).slice(0, 4);
  if (!pending.length) {
    goalsDiv.innerHTML = '<div style="font-size:13px; color:var(--text-3); padding:12px 0;">All goals done this week! 🎉 Add new ones in the Goals tab.</div>';
  } else {
    goalsDiv.innerHTML = pending.map(g => `
      <div class="goal-item">
        <input type="checkbox" class="goal-check" onchange="toggleGoalDash(${g.id},this.checked)">
        <span class="goal-text">${esc(g.text)}</span>
        <span class="goal-tag-pill">${esc(g.tag)}</span>
      </div>`).join('');
  }
}

function toggleGoalDash(id, val) {
  state.goals = state.goals.map(g => g.id===id ? {...g, done:val} : g);
  save(); renderDashboard();
}
