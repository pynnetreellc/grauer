// History tab: every finished (or ended-early) session saved on this device.
import { html, render, fmtDate, fmtTime } from '../ui.js';
import { allWorkouts } from '../db.js';

const FEEL = ['', 'Rough', 'Meh', 'Solid', 'Strong', 'Beast mode'];

export async function mount(root) {
  const list = (await allWorkouts()).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const total = list.filter((w) => w.completed).length;
  const minutes = Math.round(list.reduce((t, w) => t + (w.durationSec || 0), 0) / 60);

  render(root, html`
    <h1>History</h1>
    <div class="row" style="margin-bottom:14px">
      <div class="card" style="flex:1;margin:0"><div class="big-number" style="font-size:2.2rem">${total}</div><span class="muted small">sessions completed</span></div>
      <div class="card" style="flex:1;margin:0"><div class="big-number" style="font-size:2.2rem">${minutes}</div><span class="muted small">minutes trained</span></div>
    </div>
    ${list.length ? list.map((w) => html`
      <div class="card">
        <div class="spread"><strong>${w.name}</strong><span class="muted small">${fmtDate(w.startedAt)}</span></div>
        <div class="row" style="margin-top:8px">
          <span class="tag">${fmtTime(w.durationSec)}</span>
          ${w.completed ? html`<span class="tag tag-level">Completed</span>` : html`<span class="tag">Ended early</span>`}
          ${w.lowImpact ? html`<span class="tag">Low-impact</span>` : ''}
          ${w.feel ? html`<span class="tag">Felt: ${FEEL[w.feel]}</span>` : ''}
        </div>
        ${w.sets?.length ? html`<p class="muted small" style="margin:8px 0 0">${w.sets.length} sets logged · ${w.sets.reduce((t, s) => t + (s.reps || 0), 0)} total reps</p>` : ''}
      </div>`) : html`<div class="card"><p class="muted" style="margin:0">No sessions yet. Your first one is waiting on the Today tab.</p></div>`}`);
}
