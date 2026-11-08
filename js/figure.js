// Stick-figure exercise demos.
//
// How it works:
//  - Each pose (content/poses.json) gives positions for the hip (P), shoulder (S),
//    head (H), hands (W, W2) and ankles (A, A2).
//  - We blend ("tween") between an exercise's poses to animate it.
//  - Elbows and knees are NOT stored. We work them out with two-bone inverse
//    kinematics (IK): given shoulder + hand, find the elbow so the upper arm and
//    forearm keep their real lengths. That's why limbs never stretch or shrink
//    mid-animation.

const SVGNS = 'http://www.w3.org/2000/svg';
const LEN = { torso: 44, neck: 18, upper: 24, fore: 22, thigh: 30, shin: 30, foot: 10, head: 10 };
const FRONT_SHOULDER = 11; // half shoulder width when facing the viewer
const FRONT_HIP = 7;

// --- tiny 2D vector helpers -------------------------------------------------
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const lerpNum = (a, b, t) => a + (b - a) * t;
const fromAngle = (deg) => [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)];
function lerpAngle(a, b, t) {
  let d = ((b - a) % 360 + 540) % 360 - 180; // shortest way round
  return a + d * t;
}

// Two-bone IK: returns the middle joint (elbow/knee) and the end point.
// bend (+1 / -1) picks which side of the root->target line the joint bends to.
function ik(root, target, l1, l2, bend) {
  const d = sub(target, root);
  let dist = len(d);
  const dir = dist > 0 ? mul(d, 1 / dist) : [0, 1];
  const reach = l1 + l2 - 0.01;
  if (dist >= reach) {
    // Out of reach: straighten the limb and point it at the target.
    return { joint: add(root, mul(dir, l1)), end: add(root, mul(dir, reach)) };
  }
  dist = Math.max(dist, Math.abs(l1 - l2) + 0.01);
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist); // law of cosines
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const perp = [-dir[1], dir[0]];
  return { joint: add(add(root, mul(dir, a)), mul(perp, h * bend)), end: target };
}

// Fill in defaults so every pose has the same shape.
export function resolvePose(p) {
  const front = !!p.front;
  return {
    front,
    P: p.P, S: p.S, H: p.H,
    W1: p.W, W2: p.W2 || p.W,
    A1: p.A, A2: p.A2 || p.A,
    ft1: p.ft ?? 0,
    ft2: p.ft2 ?? (front ? 180 : (p.ft ?? 0)),
    eb1: p.eb ?? (front ? -1 : 1),
    eb2: p.eb2 ?? (front ? 1 : (p.eb ?? 1)),
    kb1: p.kb ?? -1,
    kb2: p.kb2 ?? (front ? 1 : (p.kb ?? -1)),
  };
}

function blend(a, b, t) {
  const pick = t < 0.5 ? a : b;
  return {
    front: pick.front,
    P: lerp(a.P, b.P, t), S: lerp(a.S, b.S, t), H: lerp(a.H, b.H, t),
    W1: lerp(a.W1, b.W1, t), W2: lerp(a.W2, b.W2, t),
    A1: lerp(a.A1, b.A1, t), A2: lerp(a.A2, b.A2, t),
    ft1: lerpAngle(a.ft1, b.ft1, t), ft2: lerpAngle(a.ft2, b.ft2, t),
    eb1: pick.eb1, eb2: pick.eb2, kb1: pick.kb1, kb2: pick.kb2,
  };
}

// Turn a resolved pose into actual joint coordinates.
function skeleton(r) {
  const P = r.P;
  const S = add(P, mul(norm(sub(r.S, P)), LEN.torso)); // keep torso length fixed
  const H = add(S, mul(norm(sub(r.H, S)), LEN.neck));
  const sOff = r.front ? [[FRONT_SHOULDER, 0], [-FRONT_SHOULDER, 0]] : [[0, 0], [0, 0]];
  const hOff = r.front ? [[FRONT_HIP, 0], [-FRONT_HIP, 0]] : [[0, 0], [0, 0]];
  const footLen = r.front ? 6 : LEN.foot;
  const limbs = [1, 2].map((n, i) => {
    const sh = add(S, sOff[i]);
    const hp = add(P, hOff[i]);
    const arm = ik(sh, r['W' + n], LEN.upper, LEN.fore, r['eb' + n]);
    const leg = ik(hp, r['A' + n], LEN.thigh, LEN.shin, r['kb' + n]);
    const toe = add(leg.end, mul(fromAngle(r['ft' + n]), footLen));
    return { sh, elbow: arm.joint, hand: arm.end, hp, knee: leg.joint, ankle: leg.end, toe };
  });
  return { P, S, H, front: r.front, limbs };
}

// Which gorilla placeholder to show: curls for strength/HIIT, the thinker for the rest.
function placeholderFor(ex) {
  if (ex?.placeholder) return ex.placeholder;
  return ['strength', 'hiit'].includes(ex?.category) ? 'curl' : 'think';
}

const smooth = (u) => u * u * (3 - 2 * u);
const pts = (...ps) => ps.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

export class Figure {
  // container: element to draw into. poses: the poses.json object.
  constructor(container, poses, { animate = true, frame = null } = {}) {
    this.poses = poses;
    this.animate = animate && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.fixedFrame = frame;
    this.container = container;
    this.svg = el('svg', { viewBox: '0 0 200 156', class: 'figure', role: 'img' });
    container.appendChild(this.svg);
    this.propsG = el('g', { class: 'fig-props' }, this.svg);
    el('line', { x1: 6, y1: 149, x2: 194, y2: 149, class: 'fig-floor' }, this.svg);
    // far limbs first so the near side draws on top
    this.arm2 = el('polyline', { class: 'fig-limb fig-far' }, this.svg);
    this.leg2 = el('polyline', { class: 'fig-limb fig-far' }, this.svg);
    this.torso = el('polygon', { class: 'fig-torso' }, this.svg);
    this.head = el('circle', { r: LEN.head, class: 'fig-head' }, this.svg);
    this.band = el('line', { class: 'fig-band' }, this.svg);
    this.leg1 = el('polyline', { class: 'fig-limb' }, this.svg);
    this.arm1 = el('polyline', { class: 'fig-limb' }, this.svg);
    this.raf = null;
  }

  setExercise(ex) {
    this.ex = ex;
    // No stick-figure demo yet? Show a gorilla placeholder instead.
    const hasDemo = !!ex?.frames?.length;
    this.svg.style.display = hasDemo ? '' : 'none';
    if (!hasDemo) {
      cancelAnimationFrame(this.raf);
      if (!this.ph) {
        this.ph = document.createElement('div');
        this.ph.className = 'fig-placeholder';
        this.container.appendChild(this.ph);
      }
      this.ph.style.display = '';
      const art = placeholderFor(ex);
      this.ph.innerHTML = `<img src="img/placeholders/${art}.svg" alt=""><span>Demo coming soon</span>`;
      return;
    }
    if (this.ph) this.ph.style.display = 'none';
    this.frames = ex.frames.map((name) => {
      const p = this.poses[name];
      if (!p) console.warn('Missing pose', name, 'in', ex?.id);
      return resolvePose(p || this.poses.stand);
    });
    this.tempo = (ex?.tempo || 1) * 1000;
    this.propsG.innerHTML = '';
    for (const pr of ex?.props || []) {
      if (pr.type === 'wall') el('rect', { x: pr.x, y: 0, width: pr.w || 8, height: 149, class: 'fig-prop' }, this.propsG);
      if (pr.type === 'box') el('rect', { x: pr.x, y: pr.y, width: pr.w, height: pr.h, rx: 3, class: 'fig-prop' }, this.propsG);
    }
    this.svg.setAttribute('aria-label', ex ? `${ex.name} demonstration` : 'Exercise demonstration');
    this.start = performance.now();
    this.drawAt(this.start);
    this.loop();
  }

  loop() {
    cancelAnimationFrame(this.raf);
    if (!this.animate) return;
    const tick = (now) => { this.drawAt(now); this.raf = requestAnimationFrame(tick); };
    this.raf = requestAnimationFrame(tick);
  }

  drawAt(now) {
    const n = this.frames.length;
    let pose;
    if (!this.animate || n === 1) {
      const i = this.fixedFrame ?? (n > 1 ? Math.floor(n / 2) : 0);
      pose = this.frames[Math.min(i, n - 1)];
      if (n === 1 && this.animate) {
        // single-pose holds get a gentle "breathing" bob
        const b = Math.sin((now - this.start) / 900) * 0.8;
        pose = { ...pose, S: add(pose.S, [0, b]), H: add(pose.H, [0, b]) };
      }
    } else {
      // (rAF's timestamp can be a hair earlier than start, so never go below 0)
      const t = Math.max(0, now - this.start) / this.tempo;
      const k = Math.floor(t) % n;
      const f = t - Math.floor(t);
      // hold each key pose briefly, then ease into the next
      const u = smooth(Math.min(1, Math.max(0, (f - 0.15) / 0.7)));
      pose = blend(this.frames[k], this.frames[(k + 1) % n], u);
    }
    this.draw(skeleton(pose));
  }

  draw(sk) {
    const [l1, l2] = sk.limbs;
    this.arm1.setAttribute('points', pts(l1.sh, l1.elbow, l1.hand));
    this.arm2.setAttribute('points', pts(l2.sh, l2.elbow, l2.hand));
    this.leg1.setAttribute('points', pts(l1.hp, l1.knee, l1.ankle, l1.toe));
    this.leg2.setAttribute('points', pts(l2.hp, l2.knee, l2.ankle, l2.toe));
    this.torso.setAttribute('points', sk.front ? pts(l1.sh, l2.sh, l2.hp, l1.hp) : pts(sk.S, sk.P));
    this.torso.classList.toggle('fig-torso-front', sk.front);
    // facing the viewer, both sides are equally "near"
    this.arm2.classList.toggle('fig-far', !sk.front);
    this.leg2.classList.toggle('fig-far', !sk.front);
    this.head.setAttribute('cx', sk.H[0].toFixed(1));
    this.head.setAttribute('cy', sk.H[1].toFixed(1));
    // sweatband (in your level color) across the forehead, perpendicular to the neck
    const up = norm(sub(sk.H, sk.S));
    const c = add(sk.H, mul(up, 3.5));
    const side = [-up[1], up[0]];
    const b1 = add(c, mul(side, 9.5)), b2 = add(c, mul(side, -9.5));
    this.band.setAttribute('x1', b1[0].toFixed(1)); this.band.setAttribute('y1', b1[1].toFixed(1));
    this.band.setAttribute('x2', b2[0].toFixed(1)); this.band.setAttribute('y2', b2[1].toFixed(1));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.svg.remove();
    this.ph?.remove();
  }
}
