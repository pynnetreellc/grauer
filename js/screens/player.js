// The workout player: runs a built session step by step.
//
// Flow: "ready" screen (tap Start, which also unlocks audio) -> "running" -> "done".
// Timed steps count down using the real clock (endAt), so the timer stays
// accurate even if the phone lags. Rep steps wait for you to rate the set.
import { html, render, icon, fmtTime, LEVELS } from '../ui.js';
import { Figure } from '../figure.js';
import { buildSession, resolveEx, estimateSeconds, PHASE_LABEL } from '../session.js';
import * as audio from '../audio.js';
import { addWorkout } from '../db.js';

const FEEL = ['', 'Rough', 'Meh', 'Solid', 'Strong', 'Beast mode'];

export async function mount(root, { app, arg, query }) {
  const content = app.content;
  const min = Number(query.get('min')) || app.profile.sessionMin || 30;
  let built;
  try { built = buildSession(content, arg, min); } catch { app.go('home'); return; }
  const steps = built.steps;

  const st = {
    i: 0, status: 'ready', paused: false,
    lowImpact: query.get('li') === '1', swaps: {},
    endAt: 0, remaining: 0, lastWhole: null, repCount: 0,
    startedWall: null, startedAt: 0, pausedAt: 0, pausedMs: 0,
    sets: [], feel: 0, saved: false,
  };
  let timer = null;
  let wakeLock = null;
  let fig = null;

  // ---- helpers -------------------------------------------------------------
  const step = () => steps[st.i];
  const exFor = (s) => resolveEx(content, s.ex, { lowImpact: st.lowImpact, swaps: st.swaps });
  const nextWork = (from) => steps.slice(from + 1).find((s) => s.kind === 'work') || null;
  const isTimed = (s) => !(s.kind === 'work' && s.mode === 'reps');
  const targetText = (s) => (s.mode === 'reps'
    ? `${s.reps} reps${s.perSide ? ' each side' : ''}`
    : `${s.sec} sec${s.side ? ` · ${s.side}` : ''}`);
  const cues = (ex, n) => html`<ul class="cue-list">${ex.cues.slice(0, n).map((c) => html`<li>${c}</li>`)}</ul>`;

  async function lockScreen() {
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* not supported */ }
  }
  const onVisible = () => { if (document.visibilityState === 'visible' && st.status === 'running') lockScreen(); };
  document.addEventListener('visibilitychange', onVisible);

  // ---- screens -------------------------------------------------------------
  function drawReady() {
    const groups = ['warmup', 'main', 'cooldown'].map((ph) => {
      const ss = steps.filter((s) => s.phase === ph);
      const moves = new Set(ss.filter((s) => s.kind === 'work').map((s) => s.ex)).size;
      return { ph, moves, mins: Math.round(estimateSeconds(content, ss) / 60) };
    });
    render(root, html`
      <div class="player">
        <div class="player-top">
          <button class="btn btn-icon btn-ghost" type="button" data-act="exit" aria-label="Close">${icon.close}</button>
          <div class="phase">Ready</div><span style="width:48px"></span>
        </div>
        <div class="fig-box" id="fig" style="max-width:420px;width:100%;margin:0 auto"></div>
        <div style="text-align:center">
          <h1 style="margin-bottom:4px">${built.template.name}</h1>
          <p class="muted">${min} min · ${built.rounds} round${built.rounds > 1 ? 's' : ''} · ${st.lowImpact ? 'Low-impact' : 'Standard'}</p>
        </div>
        <div class="card" style="margin:0">
          ${groups.map((g) => html`<div class="spread" style="padding:6px 0">
            <strong>${PHASE_LABEL[g.ph]}</strong><span class="muted">${g.moves} moves · ~${g.mins} min</span></div>`)}
        </div>
        <p class="muted small" style="text-align:center;margin:0">Volume up! Grauer counts you in and calls out every move.</p>
        <button class="btn btn-primary btn-block" type="button" data-act="start" style="min-height:60px;font-size:1.15rem">Start workout</button>
      </div>`);
    fig = new Figure(root.querySelector('#fig'), content.poses);
    fig.setExercise(exFor(steps[0]));
  }

  function drawRunning() {
    render(root, html`
      <div class="player">
        <div class="player-top">
          <button class="btn btn-icon btn-ghost" type="button" data-act="exit" aria-label="End workout">${icon.close}</button>
          <div class="phase" id="phase"></div><span style="width:48px"></span>
        </div>
        <div class="progress" aria-hidden="true"><i id="bar"></i></div>
        <div class="player-body">
          <div class="player-fig fig-box" id="fig"><span class="tag tag-level side-flag hidden" id="side"></span></div>
          <div class="player-info" id="info"></div>
        </div>
      </div>`);
    fig = new Figure(root.querySelector('#fig'), content.poses);
  }

  function controls() {
    return html`<div class="controls">
      <button class="btn btn-icon" type="button" data-act="prev" aria-label="Previous step">${icon.prev}</button>
      <button class="btn btn-icon btn-play" type="button" data-act="pause" aria-label="${st.paused ? 'Resume' : 'Pause'}">${st.paused ? icon.play : icon.pause}</button>
      <button class="btn btn-icon" type="button" data-act="next" aria-label="Skip to next step">${icon.next}</button>
    </div>`;
  }

  function tools(ex) {
    return html`<div class="tools">
      ${ex.easier ? html`<button class="chip" type="button" data-act="easier">Easier</button>` : ''}
      ${ex.harder ? html`<button class="chip" type="button" data-act="harder">Harder</button>` : ''}
      <button class="chip" type="button" data-act="li" aria-pressed="${st.lowImpact}">Low-impact</button>
    </div>`;
  }

  function infoHtml() {
    const s = step();
    const upcoming = nextWork(st.i);
    if (s.kind === 'rest') {
      const ex = exFor(upcoming || s);
      return html`
        <p class="target-sub" style="margin:0">${s.label}</p>
        <h2 class="ex-title">${s.label === 'Get ready' ? 'Get ready' : 'Rest'}</h2>
        <div class="big-number rest" id="clock">${fmtTime(st.remaining)}</div>
        <p class="next-up" style="margin:0">Next up: <strong>${ex.name}</strong>${upcoming ? ` · ${targetText(upcoming)}` : ''}</p>
        ${cues(ex, 2)}
        <div class="tools"><button class="chip" type="button" data-act="add15">+15 sec</button></div>
        ${controls()}`;
    }
    const ex = exFor(s);
    const nextEx = upcoming && exFor(upcoming);
    return html`
      <p class="target-sub" style="margin:0">${s.label}</p>
      <h2 class="ex-title">${ex.name}</h2>
      ${s.mode === 'reps' ? html`
        <div class="big-number">${s.reps}<span style="font-size:1.3rem;font-weight:700"> reps${s.perSide ? ' each side' : ''}</span></div>
        ${cues(ex, 3)}
        <div class="card" style="margin:0">
          <div class="spread"><span class="muted small">Reps you did</span>
            <div class="stepper">
              <button class="btn btn-icon" type="button" data-act="rep-minus" aria-label="One fewer rep">−</button>
              <output id="reps">${st.repCount}</output>
              <button class="btn btn-icon" type="button" data-act="rep-plus" aria-label="One more rep">+</button>
            </div></div>
          <p class="small" style="margin:10px 0 8px">How did that set feel?</p>
          <div class="feel-row">
            <button class="btn" type="button" data-act="feel" data-v="easy">Easy</button>
            <button class="btn btn-primary" type="button" data-act="feel" data-v="good">Good</button>
            <button class="btn" type="button" data-act="feel" data-v="hard">Hard</button>
          </div>
        </div>` : html`
        <div class="big-number" id="clock">${fmtTime(st.remaining)}</div>
        ${cues(ex, 3)}`}
      ${tools(ex)}
      ${controls()}
      <p class="next-up" style="margin:0;text-align:center">${nextEx ? html`Next: <strong>${nextEx.name}</strong>` : 'Last one. Finish strong!'}</p>`;
  }

  function showStep() {
    const s = step();
    root.querySelector('#phase').textContent = `${PHASE_LABEL[s.phase]} · ${st.i + 1}/${steps.length}`;
    root.querySelector('#bar').style.width = `${(st.i / steps.length) * 100}%`;
    const side = root.querySelector('#side');
    side.textContent = s.side ? `${s.side} side` : '';
    side.classList.toggle('hidden', !s.side);
    render(root.querySelector('#info'), infoHtml());
    fig.setExercise(s.kind === 'rest' ? exFor(nextWork(st.i) || s) : exFor(s));
  }

  function announce() {
    const s = step();
    const prev = steps[st.i - 1];
    const up = nextWork(st.i);
    let text = '';
    if (st.i === 0) text += "Let's go. Warm-up. ";
    if (s.phase === 'cooldown' && prev && prev.phase !== 'cooldown') text += 'Great work. Time to cool down. ';
    if (s.kind === 'rest') {
      const name = up ? exFor(up).name : '';
      if (s.label === 'Get ready') text += `Main workout. Get ready. First up: ${name}.`;
      else text += `${s.roundBreak ? 'Round done. ' : ''}Rest. Next up: ${name}.`;
    } else if (s.side === 'Right' && prev?.ex === s.ex) {
      text += 'Switch sides.';
    } else {
      const ex = exFor(s);
      text += `${ex.name}. ${s.mode === 'reps' ? `${s.reps} reps${s.perSide ? ' each side' : ''}` : `${s.sec} seconds${s.side ? `, ${s.side.toLowerCase()} side` : ''}`}.`;
    }
    audio.say(text);
  }

  function enterStep(i, { speak = true } = {}) {
    if (i >= steps.length) { finish(); return; }
    st.i = Math.max(0, i);
    const s = step();
    if (isTimed(s)) {
      st.remaining = s.sec;
      st.endAt = performance.now() + s.sec * 1000;
      st.lastWhole = null;
    }
    st.repCount = s.reps || 0;
    showStep();
    if (speak) announce();
  }

  function tick() {
    if (st.status !== 'running' || st.paused) return;
    const s = step();
    if (!isTimed(s)) return;
    const rem = Math.max(0, (st.endAt - performance.now()) / 1000);
    st.remaining = rem;
    const whole = Math.ceil(rem);
    if (whole !== st.lastWhole) {
      st.lastWhole = whole;
      const clock = root.querySelector('#clock');
      if (clock) clock.textContent = fmtTime(whole);
      if (whole >= 1 && whole <= 3 && s.sec >= 8) audio.tick();
    }
    if (rem <= 0) {
      const nxt = steps[st.i + 1];
      if (s.kind === 'work') audio.done();
      else if (nxt?.kind === 'work') audio.go();
      enterStep(st.i + 1);
    }
  }

  function togglePause() {
    if (st.status !== 'running') return;
    if (st.paused) {
      st.paused = false;
      st.pausedMs += performance.now() - st.pausedAt;
      st.endAt = performance.now() + st.remaining * 1000;
    } else {
      st.paused = true;
      st.pausedAt = performance.now();
      audio.hush();
    }
    const b = root.querySelector('[data-act="pause"]');
    if (b) { b.innerHTML = (st.paused ? icon.play : icon.pause).toString(); b.setAttribute('aria-label', st.paused ? 'Resume' : 'Pause'); }
  }

  function start() {
    audio.unlock();
    lockScreen();
    st.status = 'running';
    st.startedWall = new Date();
    st.startedAt = performance.now();
    fig?.destroy();
    drawRunning();
    enterStep(0);
    timer = setInterval(tick, 200);
  }

  function elapsedSec() {
    if (!st.startedAt) return 0;
    const pausedNow = st.paused ? performance.now() - st.pausedAt : 0;
    return Math.round((performance.now() - st.startedAt - st.pausedMs - pausedNow) / 1000);
  }

  async function save(completed) {
    if (st.saved || !st.startedWall) return;
    st.saved = true;
    await addWorkout({
      sessionId: arg, name: built.template.name, minutes: min,
      startedAt: st.startedWall.toISOString(), durationSec: st.durationSec ?? elapsedSec(),
      completed, lowImpact: st.lowImpact, rounds: built.rounds,
      stepsDone: completed ? steps.length : st.i, stepsTotal: steps.length,
      sets: st.sets, feel: st.feel || null, swaps: st.swaps, level: app.profile.level,
    });
  }

  function finish() {
    clearInterval(timer);
    st.durationSec = elapsedSec();
    st.status = 'done';
    wakeLock?.release?.();
    audio.done();
    audio.say('Workout complete. Nice work!');
    fig?.destroy();
    fig = null;
    drawDone();
  }

  function drawDone() {
    const reps = st.sets.reduce((t, s) => t + s.reps, 0);
    const level = LEVELS[app.profile.level] || LEVELS.juvenile;
    render(root, html`
      <div class="player" style="justify-content:center;text-align:center">
        <img src="img/avatars/${level.band}.svg" alt="" style="width:120px;height:120px;border-radius:28px;margin:0 auto">
        <h1 style="margin:8px 0 0">Session complete!</h1>
        <p class="muted">${built.template.name}</p>
        <div class="row" style="justify-content:center">
          <div class="card" style="margin:0;min-width:96px"><div class="big-number" style="font-size:2rem">${fmtTime(st.durationSec)}</div><span class="muted small">time</span></div>
          <div class="card" style="margin:0;min-width:96px"><div class="big-number" style="font-size:2rem">${st.sets.length}</div><span class="muted small">sets</span></div>
          <div class="card" style="margin:0;min-width:96px"><div class="big-number" style="font-size:2rem">${reps}</div><span class="muted small">reps</span></div>
        </div>
        <h3 style="margin-top:12px">How did it feel?</h3>
        <div class="row" style="justify-content:center">
          ${[1, 2, 3, 4, 5].map((n) => html`<button class="chip" type="button" data-act="rate" data-v="${n}" aria-pressed="${st.feel === n}">${FEEL[n]}</button>`)}
        </div>
        <button class="btn btn-primary btn-block" type="button" data-act="finish" style="min-height:56px;margin-top:10px">Save & finish</button>
      </div>`);
  }

  async function exit() {
    if (st.status === 'running') {
      if (!confirm('End this workout now? What you did so far will be saved.')) return;
      clearInterval(timer);
      st.durationSec = elapsedSec();
      st.status = 'ended';
      await save(false);
    }
    if (st.status === 'done') await save(true);
    app.go('home');
  }

  // ---- input ---------------------------------------------------------------
  root.onclick = async (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const s = step();
    switch (b.dataset.act) {
      case 'start': start(); break;
      case 'exit': exit(); break;
      case 'pause': togglePause(); break;
      case 'next': enterStep(st.i + 1); break;
      case 'prev': enterStep(st.i - 1); break;
      case 'add15':
        if (st.paused) st.remaining += 15; else st.endAt += 15000;
        st.lastWhole = null; tick();
        break;
      case 'rep-minus': st.repCount = Math.max(0, st.repCount - 1); root.querySelector('#reps').textContent = st.repCount; break;
      case 'rep-plus': st.repCount += 1; root.querySelector('#reps').textContent = st.repCount; break;
      case 'feel':
        st.sets.push({ ex: exFor(s).id, reps: st.repCount, target: s.reps, feel: b.dataset.v, label: s.label });
        audio.done();
        enterStep(st.i + 1);
        break;
      case 'easier':
      case 'harder': {
        const cur = exFor(s);
        const target = b.dataset.act === 'easier' ? cur.easier : cur.harder;
        if (target) { st.swaps[s.ex] = target; showStep(); audio.say(content.exercises.get(target).name); }
        break;
      }
      case 'li': st.lowImpact = !st.lowImpact; showStep(); break;
      case 'rate': st.feel = Number(b.dataset.v); drawDone(); break;
      case 'finish': await save(true); app.go('history'); break;
      default: break;
    }
  };
  const onKey = (e) => {
    if (st.status !== 'running') return;
    if (e.code === 'Space') { e.preventDefault(); togglePause(); }
    if (e.code === 'ArrowRight') enterStep(st.i + 1);
    if (e.code === 'ArrowLeft') enterStep(st.i - 1);
  };
  document.addEventListener('keydown', onKey);

  drawReady();

  // Runs when leaving the screen.
  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
    document.removeEventListener('keydown', onKey);
    wakeLock?.release?.();
    audio.hush();
    fig?.destroy();
    root.onclick = null;
    if (st.status === 'running') { st.durationSec = elapsedSec(); save(false); }
    if (st.status === 'done') save(true);
  };
}
