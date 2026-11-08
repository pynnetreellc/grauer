// Me tab: profile summary, sound/voice, backup/restore, reset.
import { html, render, LEVELS } from '../ui.js';
import { exportAll, importAll, wipe } from '../db.js';

const EMPHASIS = { balanced: 'Balanced', strength: 'Strength', conditioning: 'Conditioning', calisthenics: 'Calisthenics', mobility: 'Mobility & Yoga' };
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function mount(root, { app }) {
  const p = app.profile;
  const eq = [p.equipment.db && 'Dumbbells', p.equipment.kb && 'Kettlebell', p.equipment.bar && 'Pull-up bar'].filter(Boolean);
  let msg = '';

  function draw() {
    render(root, html`
      <h1>Me</h1>
      <div class="card">
        <div class="spread"><h3 style="margin:0">${p.name || 'Your profile'}</h3><span class="tag tag-level">${(LEVELS[p.level] || LEVELS.juvenile).name}</span></div>
        <p class="muted small" style="margin:8px 0 0">
          ${EMPHASIS[p.emphasis]} emphasis · ${p.weekdays.length} days (${p.weekdays.map((d) => DAY[d]).join(', ')}) · ${p.sessionMin} min<br>
          Equipment: ${eq.length ? eq.join(', ') : 'Bodyweight only'} · Low-Impact by default: ${p.lowImpact ? 'on' : 'off'}
        </p>
        <a class="btn" href="#/onboarding" style="margin-top:12px">Redo setup</a>
      </div>

      <div class="card">
        <h3>During workouts</h3>
        <label class="toggle"><span>Beeps (3-2-1 countdown)</span><input type="checkbox" data-pref="sound" ${app.prefs.sound ? 'checked' : ''}></label>
        <label class="toggle"><span>Voice cues<br><span class="muted small">Announces each move and what's next</span></span><input type="checkbox" data-pref="voice" ${app.prefs.voice ? 'checked' : ''}></label>
      </div>

      <div class="card">
        <h3>Backup</h3>
        <p class="muted small">Your data lives only on this device. Export a backup now and then, especially before switching phones.</p>
        <div class="row">
          <button class="btn" type="button" data-act="export">Export backup</button>
          <label class="btn" style="cursor:pointer">Import backup<input type="file" accept="application/json,.json" data-act="import" class="hidden"></label>
        </div>
        ${msg ? html`<p class="small" style="margin:10px 0 0">${msg}</p>` : ''}
      </div>

      <div class="card">
        <h3>Danger zone</h3>
        <button class="btn btn-danger" type="button" data-act="reset">Erase all data</button>
      </div>
      <p class="muted small" style="text-align:center">Grauer ${app.version} · Not medical advice. Listen to your body.</p>`);
  }

  root.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'export') {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `grauer-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      msg = 'Backup downloaded.';
      draw();
    }
    if (b.dataset.act === 'reset') {
      if (!confirm('Erase your profile and all workout history from this device? This cannot be undone.')) return;
      await wipe();
      app.profile = null;
      app.go('onboarding');
    }
  };

  root.onchange = async (e) => {
    const t = e.target;
    if (t.dataset.pref) { await app.savePrefs({ [t.dataset.pref]: t.checked }); return; }
    if (t.dataset.act === 'import' && t.files[0]) {
      try {
        const data = JSON.parse(await t.files[0].text());
        if (!confirm('Replace everything on this device with this backup?')) return;
        await importAll(data);
        location.reload();
      } catch (err) {
        msg = `Import failed: ${err.message}`;
        draw();
      }
    }
  };

  draw();
  return () => { root.onclick = root.onchange = null; };
}
