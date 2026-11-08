// Turns a session template (content/sessions.json) into a flat list of steps
// the player can walk through: warm-up -> main block -> cool-down.
//
// A step looks like:
//   { phase: 'warmup'|'main'|'cooldown', kind: 'work'|'rest',
//     ex: 'air-squat', mode: 'time'|'reps', sec: 30, reps: 10,
//     side: 'Left'|'Right'|null, label: 'Round 2 of 3' }

// Seconds for warm-up / cool-down at each session length (SPEC section 5).
export const BUDGET = {
  20: { warmup: 180, cooldown: 180 },
  30: { warmup: 300, cooldown: 300 },
  45: { warmup: 420, cooldown: 480 },
  60: { warmup: 480, cooldown: 600 },
};
const TEMPLATE_BLOCK = 300; // templates are written for 5-minute warm-ups/cool-downs
const SEC_PER_REP = 3;

const roundTo5 = (n) => Math.max(15, Math.round(n / 5) * 5);

// Low-Impact mode swaps jumping moves for their quiet version.
export function resolveEx(content, id, { lowImpact = false, swaps = {} } = {}) {
  let ex = content.exercises.get(swaps[id] || id);
  if (lowImpact && ex?.impact === 'high' && ex.lowImpactAlt) ex = content.exercises.get(ex.lowImpactAlt);
  return ex;
}

// Timed per-side holds become two steps ("Left" then "Right").
function timedSteps(phase, exId, sec, ex, label) {
  if (ex?.perSide) {
    const half = roundTo5(sec / 2);
    return [
      { phase, kind: 'work', ex: exId, mode: 'time', sec: half, side: 'Left', label },
      { phase, kind: 'work', ex: exId, mode: 'time', sec: half, side: 'Right', label },
    ];
  }
  return [{ phase, kind: 'work', ex: exId, mode: 'time', sec, side: null, label }];
}

function blockSteps(content, phase, items, budget) {
  const factor = budget / TEMPLATE_BLOCK;
  const out = [];
  items.forEach((it, i) => {
    const ex = content.exercises.get(it.ex);
    out.push(...timedSteps(phase, it.ex, roundTo5(it.sec * factor), ex, `${i + 1} of ${items.length}`));
  });
  return out;
}

function itemSeconds(content, it, main) {
  const ex = content.exercises.get(it.ex);
  if (main.format === 'intervals') return main.work;
  if (it.sec) return it.sec;
  return (it.reps || 10) * SEC_PER_REP * (ex?.perSide ? 2 : 1) + 10; // +10s to get set up
}

export function buildSession(content, sessionId, minutes = 30) {
  const tpl = content.sessions.get(sessionId);
  if (!tpl) throw new Error(`Unknown session ${sessionId}`);
  const budget = BUDGET[minutes] || BUDGET[30];
  const main = tpl.main;
  const steps = [];

  // 1) Warm-up (scaled to the chosen length)
  steps.push(...blockSteps(content, 'warmup', tpl.warmup, budget.warmup));

  // 2) Main block: fit as many rounds as the remaining time allows
  const mainBudget = minutes * 60 - budget.warmup - budget.cooldown;
  const between = main.format === 'intervals' ? main.rest : (main.rest || 0);
  const roundSec = main.items.reduce((t, it) => t + itemSeconds(content, it, main), 0)
    + between * (main.items.length - 1) + (main.roundRest || 0);
  const fits = Math.round((mainBudget + (main.roundRest || 0)) / roundSec);
  const rounds = Math.max(1, Math.min(main.maxRounds || 6, fits));
  // Flows (yoga-style) that hit the round cap hold each pose longer instead (up to 1.5x).
  const holdScale = main.format === 'flow' && fits > rounds
    ? Math.min(1.5, mainBudget / (rounds * roundSec)) : 1;

  steps.push({ phase: 'main', kind: 'rest', sec: 10, label: 'Get ready', ex: main.items[0].ex });
  for (let r = 1; r <= rounds; r++) {
    const label = `Round ${r} of ${rounds}`;
    main.items.forEach((it, i) => {
      const ex = content.exercises.get(it.ex);
      if (main.format === 'intervals') {
        steps.push({ phase: 'main', kind: 'work', ex: it.ex, mode: 'time', sec: main.work, side: null, label });
      } else if (it.sec) {
        steps.push(...timedSteps('main', it.ex, roundTo5(it.sec * holdScale), ex, label));
      } else {
        steps.push({ phase: 'main', kind: 'work', ex: it.ex, mode: 'reps', reps: it.reps, perSide: !!ex?.perSide, side: null, label });
      }
      const last = i === main.items.length - 1;
      if (!last && between > 0) steps.push({ phase: 'main', kind: 'rest', sec: between, label, ex: main.items[i + 1].ex });
    });
    if (r < rounds && main.roundRest) {
      steps.push({ phase: 'main', kind: 'rest', sec: main.roundRest, label: `Round ${r} done`, ex: main.items[0].ex, roundBreak: true });
    }
  }

  // 3) Cool-down
  steps.push(...blockSteps(content, 'cooldown', tpl.cooldown, budget.cooldown));

  return { template: tpl, minutes, rounds, steps };
}

// Rough total time in seconds (reps steps are estimated).
export function estimateSeconds(content, steps) {
  return steps.reduce((t, s) => {
    if (s.mode === 'reps') {
      const ex = content.exercises.get(s.ex);
      return t + s.reps * SEC_PER_REP * (ex?.perSide ? 2 : 1) + 10;
    }
    return t + (s.sec || 0);
  }, 0);
}

export const PHASE_LABEL = { warmup: 'Warm-up', main: 'Workout', cooldown: 'Cool-down' };
