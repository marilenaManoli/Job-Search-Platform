function renderGoals() {
  const done  = state.goals.filter(g => g.done).length;
  const total = state.goals.length;
  const pct   = total ? Math.round(done/total*100) : 0;
  const bar   = document.getElementById('goals-progress-bar');
  const lbl   = document.getElementById('goals-progress-label');
  if (bar) bar.style.width  = pct+'%';
  if (lbl) lbl.textContent  = `${done} of ${total} done (${pct}%)`;

  const list = document.getElementById('goals-list');
  if (!list) return;
  if (!state.goals.length) {
    list.innerHTML = '<div class="empty"><i class="ti ti-checklist"></i><p>No goals yet. Add your first one above.</p></div>';
    return;
  }
  list.innerHTML = state.goals.map(g => `
    <div class="goal-item">
      <input type="checkbox" class="goal-check" ${g.done?'checked':''} onchange="toggleGoal(${g.id},this.checked)">
      <span class="goal-text ${g.done?'done':''}">${esc(g.text)}</span>
      <span class="goal-tag-pill">${esc(g.tag)}</span>
      <button class="btn btn-sm btn-ghost" onclick="deleteGoal(${g.id})" style="color:var(--text-3);"><i class="ti ti-x"></i></button>
    </div>`).join('');
}

function addGoal() {
  const text = document.getElementById('goal-input').value.trim();
  if (!text) return;
  const tag = document.getElementById('goal-tag').value;
  state.goals.push({ id:state.nextId++, text, tag, done:false });
  document.getElementById('goal-input').value = '';
  save(); renderGoals();
}

function toggleGoal(id, val) {
  state.goals = state.goals.map(g => g.id===id ? {...g, done:val} : g);
  save(); renderGoals();
}

function deleteGoal(id) {
  state.goals = state.goals.filter(g => g.id!==id);
  save(); renderGoals();
}

function resetWeek() {
  if (!confirm('Start a new week? This will uncheck all goals but keep them in the list.')) return;
  state.goals = state.goals.map(g => ({...g, done:false}));
  save(); renderGoals(); toast('New week started — go get it! 🚀');
}
