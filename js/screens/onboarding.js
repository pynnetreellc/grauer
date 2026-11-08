// First-run setup (SPEC section 2). Also used for "Redo setup" from the Me tab.
import { html, render } from '../ui.js';

const HEALTH_Q = [
  'Has a doctor ever told you that you have a heart condition or high blood pressure?',
  'Do you get chest pain at rest, during daily activities, or when you exercise?',
  'Have you lost your balance from dizziness, or passed out, in the last 12 months?',
  'Do you have a bone, joint or muscle problem that could get worse with exercise?',
  'Are you taking medication for a long-term condition?',
  'Have you had surgery or a serious injury in the last 6 months?',
];

const TRACKS = [
  ['standard', 'Neither', 'Skip this one'],
  ['prenatal', "I'm pregnant", 'A prenatal track: no jumping, no lying flat on your back, plus breath and pelvic floor work'],
  ['postpartum', 'I had a baby in the last 12 months', 'A phased comeback: reconnect, rebuild, then back to impact'],
];

const EXPERIENCE = [
  ['new', 'New to training', 'Little or no regular exercise lately'],
  ['some', 'Some experience', 'Active on and off, or coming back after a break'],
  ['regular', 'I train regularly', 'Working out most weeks already'],
];

const EMPHASIS = [
  ['balanced', 'Balanced', 'An even mix of strength, HIIT, cardio and yoga'],
  ['strength', 'Strength', 'More upper/lower days and stronger progressions'],
  ['conditioning', 'Conditioning', 'More HIIT and cardio to build your engine'],
  ['calisthenics', 'Calisthenics', 'Bodyweight skills: handstand, pistol, L-sit, crow'],
  ['mobility', 'Mobility & Yoga', 'More yoga and flexibility, strength kept steady'],
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_PRESETS = { 3: [1, 3, 5], 4: [1, 2, 4, 6], 5: [1, 2, 3, 5, 6], 6: [1, 2, 3, 4, 5, 6] };

export const DEFAULT_PROFILE = {
  name: '', units: 'imperial', bodyweight: '', age: '',
  experience: 'new', emphasis: 'balanced',
  weekdays: [1, 3, 5], sessionMin: 30,
  equipment: { db: false, kb: false, bar: false, weights: '' },
  cardio: { run: true, bike: false, pool: false, poolLength: '25 yd' },
  body: { knees: false, wrists: false, shoulders: false, back: false, noJump: false },
  health: { answers: HEALTH_Q.map(() => false), accepted: false },
  track: 'standard',
  prenatal: { dueDate: '' },
  postpartum: { birthDate: '', delivery: 'vaginal', cleared: false, symptomFree: false },
  level: 'juvenile', week: 1,
};

// read/write nested values like "equipment.db"
const getPath = (o, path) => path.split('.').reduce((v, k) => v?.[k], o);
function setPath(o, path, val) {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((v, k) => v[k], o)[last] = val;
}

const choice = (key, current, [value, title, sub]) => html`
  <button class="choice" type="button" data-set="${key}" data-value="${value}" aria-pressed="${current === value}">
    <strong>${title}</strong><span>${sub}</span>
  </button>`;

const toggle = (path, d, label, sub = '') => html`
  <label class="toggle"><span>${label}${sub ? html`<br><span class="muted small">${sub}</span>` : ''}</span>
    <input type="checkbox" data-bind="${path}" ${getPath(d, path) ? 'checked' : ''}></label>`;

// ---- the steps ------------------------------------------------------------
const STEPS = [
  {
    id: 'welcome',
    view: () => html`
      <img class="ob-logo" src="img/icon.svg" alt="Grauer gorilla logo">
      <h1 style="text-align:center">Welcome to Grauer</h1>
      <p class="muted" style="text-align:center">Warm-up, strength, HIIT, cardio, yoga and stretching in one plan that grows with you, from Juvenile all the way to Grauer's Gorilla, the biggest gorilla on Earth.</p>
      <p class="muted" style="text-align:center">A few quick questions (about 3 minutes) and you're in.</p>`,
    next: "Let's go",
  },
  {
    id: 'health',
    view: (d) => html`
      <h2>Quick health check</h2>
      <p class="muted">Answer honestly. This only stays on your device.</p>
      <div class="card">${HEALTH_Q.map((q, i) => toggle(`health.answers.${i}`, d, q))}</div>
      ${d.health.answers.some(Boolean) ? html`<div class="card install-tip"><strong>Check with a doctor first.</strong>
        <p class="muted small" style="margin:6px 0 0">You answered yes to at least one question. Please get the OK from a doctor or physical therapist before starting. We'll turn on Low-Impact mode for you.</p></div>` : ''}
      <div class="card">${toggle('health.accepted', d, 'I understand Grauer is not medical advice, and I exercise at my own risk. I\'ll stop if anything hurts.')}</div>`,
    valid: (d) => d.health.accepted,
  },
  {
    id: 'baby',
    view: (d) => {
      const today = new Date().toISOString().slice(0, 10);
      return html`
      <h2>Pregnancy & postpartum</h2>
      <p class="muted">Grauer has dedicated tracks for pregnancy and for after birth. Does either apply to you right now?</p>
      ${TRACKS.map((c) => choice('track', d.track, c))}
      ${d.track === 'prenatal' ? html`
        <label class="field"><span>Due date</span>
          <input class="input" type="date" data-bind="prenatal.dueDate" value="${d.prenatal.dueDate}" min="${today}"></label>` : ''}
      ${d.track === 'postpartum' ? html`
        <label class="field"><span>Baby's birth date</span>
          <input class="input" type="date" data-bind="postpartum.birthDate" value="${d.postpartum.birthDate}" max="${today}"></label>
        <div class="field"><span>Delivery</span><div class="row">
          <button class="chip" type="button" data-set="postpartum.delivery" data-value="vaginal" aria-pressed="${d.postpartum.delivery === 'vaginal'}">Vaginal</button>
          <button class="chip" type="button" data-set="postpartum.delivery" data-value="csection" aria-pressed="${d.postpartum.delivery === 'csection'}">C-section</button>
        </div></div>
        <div class="card">${toggle('postpartum.cleared', d, 'My doctor or midwife has cleared me for exercise', 'Usually at the 6-week check. You can change this later.')}</div>` : ''}
      ${d.track !== 'standard' ? html`<div class="card install-tip"><strong>Check with your provider first.</strong>
        <p class="muted small" style="margin:6px 0 0">Get the OK from your doctor or midwife before starting. These tracks are draft content and are still being reviewed by a pelvic-health physical therapist. Low-Impact mode will be on.</p></div>` : ''}`;
    },
    valid: (d) => d.track === 'standard'
      || (d.track === 'prenatal' && !!d.prenatal.dueDate)
      || (d.track === 'postpartum' && !!d.postpartum.birthDate),
  },
  {
    id: 'about',
    view: (d) => html`
      <h2>About you</h2>
      <label class="field"><span>First name (optional)</span><input class="input" data-bind="name" value="${d.name}" autocomplete="given-name" maxlength="30"></label>
      <div class="field"><span>Units</span><div class="row">
        <button class="chip" type="button" data-set="units" data-value="imperial" aria-pressed="${d.units === 'imperial'}">lb / miles</button>
        <button class="chip" type="button" data-set="units" data-value="metric" aria-pressed="${d.units === 'metric'}">kg / km</button></div></div>
      <div class="row">
        <label class="field" style="flex:1"><span>Bodyweight (optional)</span><input class="input" data-bind="bodyweight" inputmode="decimal" value="${d.bodyweight}" placeholder="${d.units === 'metric' ? 'kg' : 'lb'}"></label>
        <label class="field" style="flex:1"><span>Age (optional)</span><input class="input" data-bind="age" inputmode="numeric" value="${d.age}"></label>
      </div>`,
  },
  {
    id: 'experience',
    view: (d) => html`<h2>Training experience</h2><p class="muted">Just a starting guess. The fit test will fine-tune your level later.</p>
      ${EXPERIENCE.map((c) => choice('experience', d.experience, c))}`,
  },
  {
    id: 'emphasis',
    view: (d) => html`<h2>Pick your emphasis</h2><p class="muted">Every plan mixes all styles. This shifts the balance. You can change it anytime.</p>
      ${EMPHASIS.map((c) => choice('emphasis', d.emphasis, c))}`,
  },
  {
    id: 'schedule',
    view: (d) => html`
      <h2>Your week</h2>
      <div class="field"><span>Days per week</span><div class="row">
        ${[3, 4, 5, 6].map((n) => html`<button class="chip" type="button" data-days="${n}" aria-pressed="${d.weekdays.length === n}">${n}</button>`)}
      </div></div>
      <div class="field"><span>Which days?</span><div class="row">
        ${DAY_NAMES.map((name, i) => html`<button class="chip" type="button" data-weekday="${i}" aria-pressed="${d.weekdays.includes(i)}">${name}</button>`)}
      </div><p class="muted small" style="margin-top:6px">${d.weekdays.length} chosen (pick 3 to 6).</p></div>
      <div class="field"><span>Session length</span><div class="row">
        ${[20, 30, 45, 60].map((m) => html`<button class="chip" type="button" data-set="sessionMin" data-value="${m}" data-num="1" aria-pressed="${d.sessionMin === m}">${m} min</button>`)}
      </div><p class="muted small" style="margin-top:6px">Includes warm-up and cool-down stretching.</p></div>`,
    valid: (d) => d.weekdays.length >= 3 && d.weekdays.length <= 6,
  },
  {
    id: 'equipment',
    view: (d) => html`
      <h2>Equipment</h2>
      <p class="muted">Bodyweight is always enough. Tick anything you have and Grauer will add optional loaded or harder versions.</p>
      <div class="card">
        ${toggle('equipment.db', d, 'Dumbbells')}
        ${toggle('equipment.kb', d, 'Kettlebell')}
        ${toggle('equipment.bar', d, 'Pull-up bar', 'Doorway or mounted')}
      </div>
      ${d.equipment.db || d.equipment.kb ? html`<label class="field"><span>Weights you own (optional)</span>
        <input class="input" data-bind="equipment.weights" value="${d.equipment.weights}" placeholder="e.g. pair of 15s and 25s, one 35 lb KB"></label>` : ''}
      <p class="muted small">A yoga mat (or soft floor) is handy for floor and yoga work.</p>`,
  },
  {
    id: 'cardio',
    view: (d) => html`
      <h2>Cardio options</h2>
      <p class="muted">HIIT and Tabata need nothing. Which of these can you do too?</p>
      <div class="card">
        ${toggle('cardio.run', d, 'Run / walk')}
        ${toggle('cardio.bike', d, 'Bike', 'Indoor or outdoor')}
        ${toggle('cardio.pool', d, 'Pool swimming')}
      </div>
      ${d.cardio.pool ? html`<div class="field"><span>Pool length</span><div class="row">
        ${['25 yd', '25 m', '50 m'].map((v) => html`<button class="chip" type="button" data-set="cardio.poolLength" data-value="${v}" aria-pressed="${d.cardio.poolLength === v}">${v}</button>`)}
      </div></div>` : ''}`,
  },
  {
    id: 'body',
    view: (d) => html`
      <h2>Anything to look out for?</h2>
      <p class="muted">Grauer will steer around these and swap in friendlier moves.</p>
      <div class="card">
        ${toggle('body.knees', d, 'Knees')}
        ${toggle('body.wrists', d, 'Wrists')}
        ${toggle('body.shoulders', d, 'Shoulders')}
        ${toggle('body.back', d, 'Lower back')}
        ${toggle('body.noJump', d, 'No jumping', 'e.g. apartment living, or just not today')}
      </div>`,
  },
  {
    id: 'finish',
    view: () => html`
      <img class="ob-logo" src="img/avatars/juvenile.svg" alt="Juvenile gorilla avatar with a green sweatband">
      <h2 style="text-align:center">You start as a Juvenile</h2>
      <p class="muted" style="text-align:center">Level 1 of 4: Juvenile, Blackback, Silverback, Grauer's Gorilla.</p>
      <div class="card"><strong>The Grauer fit test is coming soon.</strong>
        <p class="muted small" style="margin:6px 0 0">It will measure push-ups, squats, burpees, plank and more, and place you at the right level. For now everyone starts at Level 1. The early weeks are about form, and they'll feel good.</p></div>`,
    next: 'Start training',
  },
];

export async function mount(root, { app }) {
  const draft = structuredClone({ ...DEFAULT_PROFILE, ...(app.profile || {}) });
  let i = app.profile ? 1 : 0; // skip the welcome screen when redoing setup

  function draw() {
    const s = STEPS[i];
    const ok = !s.valid || s.valid(draft);
    render(root, html`
      <div class="ob-progress" aria-hidden="true">${STEPS.map((_, k) => html`<i class="${k <= i ? 'on' : ''}"></i>`)}</div>
      ${s.view(draft)}
      <div class="ob-nav">
        ${i > 0 ? html`<button class="btn" type="button" data-nav="back">Back</button>` : ''}
        <button class="btn btn-primary" type="button" data-nav="next" ${ok ? '' : 'disabled'}>${s.next || 'Next'}</button>
      </div>`);
  }

  async function finish() {
    const p = { ...draft, createdAt: draft.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    p.daysPerWeek = p.weekdays.length;
    p.health.anyYes = p.health.answers.some(Boolean);
    p.lowImpact = p.health.anyYes || p.body.noJump || p.body.knees || p.track !== 'standard';
    await app.saveProfile(p);
    // Ask the browser to keep our data even when storage runs low.
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
    app.go('home');
  }

  root.onclick = (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.nav === 'back') { i = Math.max(0, i - 1); draw(); window.scrollTo(0, 0); return; }
    if (t.dataset.nav === 'next') {
      if (i === STEPS.length - 1) { finish(); return; }
      i++; draw(); window.scrollTo(0, 0); return;
    }
    if (t.dataset.set) {
      setPath(draft, t.dataset.set, t.dataset.num ? Number(t.dataset.value) : t.dataset.value);
      draw();
    }
    if (t.dataset.days) { draft.weekdays = [...DAY_PRESETS[t.dataset.days]]; draw(); }
    if (t.dataset.weekday) {
      const d = Number(t.dataset.weekday);
      draft.weekdays = draft.weekdays.includes(d) ? draft.weekdays.filter((x) => x !== d) : [...draft.weekdays, d].sort();
      draw();
    }
  };

  // Text boxes update the draft quietly (no redraw, so the keyboard stays open).
  root.oninput = (e) => {
    const b = e.target.dataset.bind;
    if (b && e.target.type !== 'checkbox') setPath(draft, b, e.target.value.trim());
  };
  root.onchange = (e) => {
    const b = e.target.dataset.bind;
    if (b && e.target.type === 'checkbox') { setPath(draft, b, e.target.checked); draw(); }
    if (b && e.target.type === 'date') { setPath(draft, b, e.target.value); draw(); } // may unlock Next
  };

  draw();
  return () => { root.onclick = root.oninput = root.onchange = null; };
}
