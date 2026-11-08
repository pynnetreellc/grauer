// Today tab: avatar + level, track card (pregnancy/postpartum), pick a session, start.
import { html, render, LEVELS } from '../ui.js';
import { buildSession, estimateSeconds } from '../session.js';
import { trackInfo, POSTPARTUM_PHASES, PRENATAL_STOP_SIGNS, POSTPARTUM_WATCH } from '../tracks.js';

const TYPE_TAG = { Strength: 'tag-level', HIIT: 'tag-hot' };

function isStandalone() {
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

export async function mount(root, { app }) {
  const p = app.profile;
  const level = LEVELS[p.level] || LEVELS.juvenile;
  const state = { min: p.sessionMin || 30, lowImpact: !!p.lowImpact };
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const sessionCard = (s, { locked = '' } = {}) => {
    const built = buildSession(app.content, s.id, state.min);
    const mins = Math.round(estimateSeconds(app.content, built.steps) / 60);
    return html`
      <div class="card session-card ${locked ? 'locked' : ''}" ${locked ? '' : html`role="button" tabindex="0" data-start="${s.id}"`}>
        <div class="spread"><h3 style="margin:0">${s.name}</h3><span class="tag ${TYPE_TAG[s.type] || ''}">${s.type}</span></div>
        <p class="muted small" style="margin:6px 0 0">${s.description}</p>
        ${locked
          ? html`<p class="small" style="margin:8px 0 0"><strong>Locked:</strong> <span class="muted">${locked}</span></p>`
          : html`<div class="row"><span class="tag">~${mins} min</span><span class="tag">${built.rounds} round${built.rounds > 1 ? 's' : ''}</span>
              <span class="btn btn-primary" style="margin-left:auto;min-height:40px">Start</span></div>`}
      </div>`;
  };

  function trackCard(t) {
    const draftNote = html`<p class="small muted" style="margin:10px 0 0"><strong>Draft content:</strong> still being reviewed by a pelvic-health physical therapist. Always follow your own provider's advice.</p>`;
    if (t.kind === 'prenatal') {
      return html`<div class="card track-card">
        <div class="spread"><h3 style="margin:0">Pregnancy track</h3><span class="tag tag-level">Week ${t.weeks} · Trimester ${t.trimester}</span></div>
        <p class="muted small" style="margin:8px 0 0">Low-Impact is always on. No lying flat on your back, no jumping, and keep to the talk test: you should be able to chat while you move.</p>
        ${t.overdue ? html`<p class="small" style="margin:8px 0 0"><strong>Had your baby? Congratulations!</strong> Switch to the postpartum track in <a href="#/onboarding">setup</a>.</p>` : ''}
        <details style="margin-top:10px"><summary class="small"><strong>Stop and call your provider if you notice…</strong></summary>
          <ul class="cue-list small">${PRENATAL_STOP_SIGNS.map((s) => html`<li>${s}</li>`)}</ul></details>
        ${draftNote}
      </div>`;
    }
    const pp = p.postpartum;
    return html`<div class="card track-card">
      <div class="spread"><h3 style="margin:0">Postpartum track</h3><span class="tag tag-level">Week ${t.weeks} · Phase ${t.phase} of 3</span></div>
      <ol class="phase-list">${POSTPARTUM_PHASES.map((ph) => html`<li class="${ph.n === t.phase ? 'on' : ph.n < t.phase ? 'done' : ''}"><strong>${ph.name}</strong> <span class="muted">${ph.text}</span></li>`)}</ol>
      <label class="toggle"><span>My doctor or midwife has cleared me for exercise</span><input type="checkbox" data-pp="cleared" ${pp.cleared ? 'checked' : ''}></label>
      ${t.cleared && t.weeks >= 12 ? html`<label class="toggle"><span>No leaking, heaviness or pain with daily life and a 30-minute brisk walk<br><span class="muted small">Unlocks Phase 3. A pelvic-health PT check is ideal first.</span></span><input type="checkbox" data-pp="symptomFree" ${pp.symptomFree ? 'checked' : ''}></label>` : ''}
      ${t.csection ? html`<p class="small muted" style="margin:8px 0 0">After a C-section, also wait until your scar has healed and you're cleared before doing direct core work or lifting anything heavier than your baby.</p>` : ''}
      <details style="margin-top:10px"><summary class="small"><strong>Ease back and check in with your provider if you notice…</strong></summary>
        <ul class="cue-list small">${POSTPARTUM_WATCH.map((s) => html`<li>${s}</li>`)}</ul></details>
      ${draftNote}
    </div>`;
  }

  function sessionsFor(t) {
    const list = app.content.sessionList;
    if (t.kind === 'prenatal') {
      return html`<h2>Pregnancy sessions</h2>${list.filter((s) => s.tracks.includes('prenatal')).map((s) => sessionCard(s))}`;
    }
    if (t.kind === 'postpartum') {
      const mine = list.filter((s) => s.tracks.includes('postpartum'))
        .map((s) => sessionCard(s, { locked: (s.phase || 1) > t.phase ? 'Unlocks once your provider clears you for exercise.' : '' }));
      const standard = list.filter((s) => s.tracks.includes('standard'));
      return html`<h2>Postpartum sessions</h2>${mine}
        ${t.showStandard ? html`<h2>Back to the main program</h2><p class="muted small">Start with Low-Impact on and add jumping gradually.</p>${standard.map((s) => sessionCard(s))}` : ''}`;
    }
    return html`<h2>Choose today's session</h2>
      <p class="muted small">Your full weekly plan arrives in the next update. For now, pick any of these.</p>
      ${list.filter((s) => s.tracks.includes('standard')).map((s) => sessionCard(s))}`;
  }

  function draw() {
    const t = trackInfo(p);
    if (t.lowImpactLocked) state.lowImpact = true;
    render(root, html`
      <div class="hero">
        <img class="avatar" src="img/avatars/${level.band}.svg" alt="${level.name} avatar">
        <div>
          <p class="muted" style="margin:0">${hello}${p.name ? `, ${p.name}` : ''}</p>
          <h1 style="margin:2px 0"><span class="level-name">${level.name}</span></h1>
          <p class="muted small" style="margin:0">Level ${level.n} of 4 · ${level.plain} · Week ${p.week || 1}</p>
        </div>
      </div>

      ${!isStandalone() ? html`<div class="card install-tip">
        <strong>Install Grauer</strong>
        <p class="muted small" style="margin:6px 0 0">${isIOS
          ? html`In Safari, tap <b>Share</b> then <b>Add to Home Screen</b>. It runs full-screen, works offline, and your data is kept safe.`
          : html`Use your browser menu and tap <b>Install app</b> or <b>Add to Home screen</b> so it works offline.`}</p>
      </div>` : ''}

      ${t.kind !== 'standard' ? trackCard(t) : ''}

      <div class="card">
        <div class="spread"><h3 style="margin:0">Session length</h3><span class="muted small">incl. warm-up & stretch</span></div>
        <div class="row" style="margin-top:10px">
          ${[20, 30, 45, 60].map((m) => html`<button class="chip" type="button" data-min="${m}" aria-pressed="${state.min === m}">${m} min</button>`)}
        </div>
        <label class="toggle" style="margin-top:8px"><span>Low-Impact mode<br><span class="muted small">${t.lowImpactLocked ? 'Always on for your track' : 'Swaps jumping moves for quiet versions'}</span></span>
          <input type="checkbox" data-li ${state.lowImpact ? 'checked' : ''} ${t.lowImpactLocked ? 'disabled' : ''}></label>
      </div>

      ${sessionsFor(t)}`);
  }

  root.onclick = (e) => {
    const m = e.target.closest('[data-min]');
    if (m) { state.min = Number(m.dataset.min); draw(); return; }
    const s = e.target.closest('[data-start]');
    if (s) app.go(`player/${s.dataset.start}?min=${state.min}&li=${state.lowImpact ? 1 : 0}`);
  };
  root.onkeydown = (e) => {
    const s = e.target.closest('[data-start]');
    if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); s.click(); }
  };
  root.onchange = async (e) => {
    if (e.target.matches('[data-li]')) state.lowImpact = e.target.checked;
    const key = e.target.dataset.pp;
    if (key) {
      const next = { ...p, postpartum: { ...p.postpartum, [key]: e.target.checked } };
      if (key === 'cleared' && !e.target.checked) next.postpartum.symptomFree = false;
      await app.saveProfile(next);
      Object.assign(p, next);
      draw();
    }
  };

  draw();
  return () => { root.onclick = root.onchange = root.onkeydown = null; };
}
