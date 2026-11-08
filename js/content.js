// Loads the workout content (JSON files) once and offers lookups.

export async function loadContent() {
  const [poses, lib, sess] = await Promise.all(
    // no-cache = always check for a newer copy (still works offline via the service worker)
    ['poses', 'exercises', 'sessions'].map((f) => fetch(`content/${f}.json`, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${f}.json`);
      return r.json();
    })),
  );
  const exercises = new Map(lib.exercises.map((e) => [e.id, e]));
  const sessions = new Map(sess.sessions.map((s) => [s.id, s]));

  // Catch typos in content early (shows up in the browser console).
  for (const e of lib.exercises) {
    for (const f of e.frames || []) if (!poses[f]) console.warn(`[content] ${e.id}: unknown pose "${f}"`);
    for (const k of ['easier', 'harder', 'lowImpactAlt']) if (e[k] && !exercises.has(e[k])) console.warn(`[content] ${e.id}.${k}: unknown exercise "${e[k]}"`);
  }
  for (const s of sess.sessions) {
    for (const it of [...s.warmup, ...s.main.items, ...s.cooldown]) if (!exercises.has(it.ex)) console.warn(`[content] session ${s.id}: unknown exercise "${it.ex}"`);
  }

  return { poses, exercises, sessions, exerciseList: lib.exercises, sessionList: sess.sessions };
}

export const CATEGORY_LABEL = { warmup: 'Warm-up', strength: 'Strength', hiit: 'HIIT', yoga: 'Yoga', stretch: 'Stretch', prenatal: 'Pre & Postnatal' };
export const EQUIPMENT_LABEL = { db: 'Dumbbell', kb: 'Kettlebell', bar: 'Pull-up bar' };
