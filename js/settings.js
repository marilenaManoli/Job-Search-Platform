function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'swiss_job_search_backup_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  toast('Data exported ✓');
}

function importData(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      Object.assign(state, d);
      save(); renderDashboard(); toast('Data imported ✓');
    } catch { toast('Invalid file'); }
  };
  reader.readAsText(file);
}

function clearAll() {
  if (!confirm('Delete ALL data? This cannot be undone.')) return;
  localStorage.removeItem('sjsh_state');
  location.reload();
}
