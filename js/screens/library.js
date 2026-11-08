// Library tab: browse every exercise, and a detail page with the animated demo.
import { html, render, icon } from '../ui.js';
import { Figure } from '../figure.js';
import { CATEGORY_LABEL, EQUIPMENT_LABEL } from '../content.js';

const FILTERS = ['all', 'warmup', 'strength', 'hiit', 'yoga', 'stretch', 'prenatal', 'equipment'];
const filterLabel = (f) => (f === 'all' ? 'All' : f === 'equipment' ? 'With equipment' : CATEGORY_LABEL[f]);
const equipTags = (e) => (e.equipment || []).map((k) => html` <span class="tag">${EQUIPMENT_LABEL[k]}</span>`);
let lastFilter = 'all';
let lastQuery = '';

export async function mount(root, { app }) {
  const figures = [];

  function draw() {
    figures.splice(0).forEach((f) => f.destroy());
    const q = lastQuery.toLowerCase();
    const list = app.content.exerciseList.filter((e) =>
      (lastFilter === 'all' || e.category === lastFilter || (lastFilter === 'equipment' && e.equipment?.length)) &&
      (!q || e.name.toLowerCase().includes(q) || (e.muscles || []).some((m) => m.includes(q))));
    render(root.querySelector('#results'), html`
      ${list.length ? '' : html`<p class="muted">No exercises match.</p>`}
      <div class="grid">${list.map((e) => html`
        <a class="card ex-card" href="#/exercise/${e.id}">
          <div class="fig-box" data-fig="${e.id}"></div>
          <strong>${e.name}</strong>
          <span class="muted small">${CATEGORY_LABEL[e.category]}</span>
          ${e.impact === 'high' ? html` <span class="tag tag-hot">Jumping</span>` : ''}${equipTags(e)}
        </a>`)}</div>`);
    // Still frames in the grid keep things smooth; the detail page animates.
    root.querySelectorAll('[data-fig]').forEach((box) => {
      const f = new Figure(box, app.content.poses, { animate: false });
      f.setExercise(app.content.exercises.get(box.dataset.fig));
      figures.push(f);
    });
  }

  render(root, html`
    <h1>Exercise library</h1>
    <p class="muted">${app.content.exerciseList.length} moves. Tap one to see the demo and form cues.</p>
    <input class="input search" type="search" placeholder="Search by name or muscle" value="${lastQuery}" data-q aria-label="Search exercises">
    <div class="row" style="margin-bottom:14px">
      ${FILTERS.map((f) => html`<button class="chip" type="button" data-filter="${f}" aria-pressed="${lastFilter === f}">${filterLabel(f)}</button>`)}
    </div>
    <div id="results"></div>`);

  root.onclick = (e) => {
    const f = e.target.closest('[data-filter]');
    if (!f) return;
    lastFilter = f.dataset.filter;
    root.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.filter === lastFilter));
    draw();
  };
  root.oninput = (e) => { if (e.target.matches('[data-q]')) { lastQuery = e.target.value; draw(); } };

  draw();
  return () => { figures.forEach((f) => f.destroy()); root.onclick = root.oninput = null; };
}

export async function mountDetail(root, { app, arg }) {
  const ex = app.content.exercises.get(arg);
  if (!ex) { app.go('library'); return; }
  const link = (id, label) => {
    const other = app.content.exercises.get(id);
    return other ? html`<a class="chip" style="display:inline-flex;align-items:center;text-decoration:none" href="#/exercise/${id}">${label}: ${other.name}</a>` : '';
  };

  render(root, html`
    <a class="btn btn-ghost" href="#/library" style="padding-left:6px">${icon.back} Library</a>
    <h1 style="margin-top:8px">${ex.name}</h1>
    <div class="row" style="margin-bottom:12px">
      <span class="tag">${CATEGORY_LABEL[ex.category]}</span>
      ${ex.perSide ? html`<span class="tag">Each side</span>` : ''}
      ${ex.impact === 'high' ? html`<span class="tag tag-hot">Jumping</span>` : html`<span class="tag">Low impact</span>`}
      ${equipTags(ex)}
    </div>
    <div class="fig-box" id="demo" style="max-width:520px"></div>
    <div class="card" style="margin-top:14px">
      <h3>Form cues</h3>
      <ul class="cue-list">${ex.cues.map((c) => html`<li>${c}</li>`)}</ul>
      ${ex.mistake ? html`<p class="small"><strong>Watch out:</strong> <span class="muted">${ex.mistake}</span></p>` : ''}
      ${ex.muscles ? html`<p class="small" style="margin:0"><strong>Works:</strong> <span class="muted">${ex.muscles.join(', ')}</span></p>` : ''}
    </div>
    ${ex.easier || ex.harder || ex.lowImpactAlt ? html`<div class="row">
      ${ex.easier ? link(ex.easier, 'Easier') : ''}
      ${ex.harder ? link(ex.harder, 'Harder') : ''}
      ${ex.lowImpactAlt ? link(ex.lowImpactAlt, 'Low-impact') : ''}
    </div>` : ''}`);

  const fig = new Figure(root.querySelector('#demo'), app.content.poses);
  fig.setExercise(ex);
  return () => fig.destroy();
}
