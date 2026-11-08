// Pregnancy and postpartum tracks (SPEC section 7a).
// DRAFT: the rules and wording here are general guidance only and must be
// reviewed by a pelvic-health physical therapist before Grauer is shared.

const WEEK = 7 * 24 * 60 * 60 * 1000;
const parseDay = (s) => new Date(`${s}T12:00:00`); // noon avoids time-zone edge cases

export function trackInfo(p, now = new Date()) {
  if (p.track === 'prenatal' && p.prenatal?.dueDate) {
    const due = parseDay(p.prenatal.dueDate);
    const weeks = Math.max(0, Math.floor(40 - (due - now) / WEEK));
    return {
      kind: 'prenatal',
      weeks,
      trimester: weeks < 14 ? 1 : weeks < 28 ? 2 : 3,
      overdue: now > due,
      lowImpactLocked: true,
      showStandard: false,
    };
  }
  if (p.track === 'postpartum' && p.postpartum?.birthDate) {
    const pp = p.postpartum;
    const weeks = Math.max(0, Math.floor((now - parseDay(pp.birthDate)) / WEEK));
    // Phase 1 until a provider clears exercise; phase 3 (impact) needs 12+ weeks AND no symptoms.
    const phase = !pp.cleared ? 1 : weeks >= 12 && pp.symptomFree ? 3 : 2;
    return {
      kind: 'postpartum',
      weeks,
      phase,
      cleared: !!pp.cleared,
      csection: pp.delivery === 'csection',
      lowImpactLocked: phase < 3,
      showStandard: phase === 3,
    };
  }
  return { kind: 'standard', lowImpactLocked: false, showStandard: true };
}

export const POSTPARTUM_PHASES = [
  { n: 1, name: 'Reconnect', text: 'Breathing, pelvic floor and deep core. Gentle walks.' },
  { n: 2, name: 'Rebuild', text: 'Low-impact strength once your provider clears you (usually around 6 weeks).' },
  { n: 3, name: 'Return to impact', text: 'From 12+ weeks, cleared, and symptom-free: back to the main program, impact added gradually.' },
];

export const PRENATAL_STOP_SIGNS = [
  'Vaginal bleeding or fluid leaking',
  'Regular, painful contractions',
  'Dizziness or feeling faint',
  'Chest pain, or shortness of breath before you start',
  'Headache',
  'Calf pain or swelling',
  'Muscle weakness that affects your balance',
  'Less movement from your baby',
];

export const POSTPARTUM_WATCH = [
  'Leaking urine or stool',
  'A heavy or dragging feeling in the pelvis',
  'Pain in the pelvis, back, or a C-section scar',
  'Bleeding that increases or turns bright red again',
  'Doming or bulging along the middle of your belly',
];
