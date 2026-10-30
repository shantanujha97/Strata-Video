// Strata product demo — v3 = v1 + React Bits Silk background, subtle, pure Strata blue (clocked by the video timeline).
// v1: Engine from Bento v17: centred, locked-off 0.8 framing; the camera only moves to follow action.
const K = 1920 / 1440;
const $ = id => document.getElementById(id);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const show = (el, on) => { el.style.display = on ? '' : 'none'; };
const cam = (cx, cy, z) => ({ cx, cy, z });

const BASEZ = 0.8;                                        // window on screen 1536×864 px in a 1920×1080 frame, background all round
const SV = 1300, SHIFT = 2200, STRIP = 0.9;
const SCB = 269, SCD = 242;                               // page scroll: market page → tabs, chart and buy panel; portfolio → expanded rows
const BTN_A = [372, 752], TAB_SR = [205, 498], IN_C = [1265, 624], BUY_C = [1121, 905], CHEV_D = [54, 695], LB_E = [598, 256];
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
gsap.registerPlugin(CustomEase); CustomEase.create('weighty', 'M0,0 C0.38,0 0.12,1 1,1');
const CAM_EASE = 'weighty', LAND = 'expo.out';
const offR = c => cam(c.cx - SHIFT / (K * c.z), c.cy, c.z);
const offL = c => cam(c.cx + SHIFT / (K * c.z), c.cy, c.z);
const HOME = cam(720, 405, BASEZ);
const INIT = { A: offR(HOME), B: cam(720, 405, 0.45), C: cam(720, 405 - SV / (K * BASEZ), BASEZ), D: offR(HOME), E: offL(HOME), M: HOME };
const KEYS = { A: [], B: [], C: [], D: [], E: [], M: [] };
const IDS = 'ABCDEM';
const pan = (id, to, at, dur, ease = CAM_EASE) => { const L = KEYS[id]; const last = L[L.length - 1], prev = last ? last.to : INIT[id]; if (last && at < last.t + last.d - 1e-6) console.error(`camera keys overlap on ${id} at ${at.toFixed(2)}`); L.push({ t: at, d: dur, to: { ...prev, ...to }, ease }); };
function interpCam(a, b, p) {
  const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), p));
  if (b.z >= a.z) { const ox = (b.cx - a.cx) * K * a.z * (1 - p), oy = (b.cy - a.cy) * K * a.z * (1 - p); return { cx: b.cx - ox / (K * z), cy: b.cy - oy / (K * z), z }; }
  const ox = (a.cx - b.cx) * K * b.z * p, oy = (a.cy - b.cy) * K * b.z * p; return { cx: a.cx - ox / (K * z), cy: a.cy - oy / (K * z), z };
}
function camAt(id, t) {
  if (id === 'M') return HOME;
  let st = INIT[id];
  for (const k of KEYS[id]) {
    if (t < k.t) return st;
    if (t < k.t + k.d) {
      const p = (t - k.t) / k.d;
      if (k.an) { const a = k.an, z = Math.exp(lerp(Math.log(st.z), Math.log(k.to.z), gsap.parseEase(k.ease)(p))); return { cx: a.wx - (a.s[0] - 960) / (K * z), cy: a.wy - (a.s[1] - 540) / (K * z), z }; }
      return interpCam(st, k.to, gsap.parseEase(k.ease)(p));
    }
    st = k.to;
  }
  return st;
}

const MBW = [];
window.BGP = {
  Grainient: { colors: ['#030509', '#050b18', '#0a1838', '#123171', '#2c6eff'], speed: 0.6, interactive: false, clickSwirl: false, intro: false, grainAmount: 0.06 },
  Silk: { color: '#0f2a6b', sheenColor: '#2c6eff', speed: 2.2, noiseIntensity: 0.8, sheen: 0.22, glow: 0.12, mouseInteraction: false, clickRipple: false, intro: false },
  LightRays: { raysOrigin: 'top-center', raysColor: '#2c6eff', raysSpeed: 0.8, lightSpread: 0.7, rayLength: 2.2, intensity: 0.9, followMouse: false, cursorShadow: false, clickPulse: false, intro: false },
  Aurora: { colorStops: ['#0a1f5c', '#2c6eff', '#00b78b'], amplitude: 1.15, blend: 0.55, speed: 0.9, height: 0.5, brightness: 0.75, mouseInteraction: false, intro: false },
  SoftAurora: { color1: '#2c6eff', color2: '#00b78b', brightness: 0.55, speed: 0.5, enableMouseInteraction: false, clickPulse: false, intro: false },
};
const S = {
  black: 1, logoOn: 1, outro: 0, endIn: 0, mk: 0, glow: 0, q: 0, logoScale: 1,
  A: 0, B: 0, C: 0, D: 0, E: 0, M: 0, mx: 0, Mfade: 1, endFade: 0,
  hovA: 0, hovAr: 0, btnA: 0,
  bscroll: 0, tip: 0, hovTab: 0, sr: 0,
  inC: 0, caret: 0, amt: 0, btnC: 0, dimC: 0, stat: 0, ok: 0,
  exp: 0, dscroll: 0, hovD: 0,
  btnE: 0, dimE: 0, lb: 0, hovYou: 0,
  cur: { w: 'A', x: 0, y: 0, op: 0, press: 0, hand: 0 },
  cams: { ...INIT },
};
let tl, LET = [], CURVE = {};

function drawBg() {
  const c = $('bg'), g = c.getContext('2d');
  g.fillStyle = '#050608'; g.fillRect(0, 0, 1920, 1080);
  const neb = (x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); };
  neb(1520, 160, 950, '44,110,255', 0.085); neb(240, 980, 820, '44,110,255', 0.055); neb(1760, 1020, 560, '0,183,139', 0.03); neb(960, 540, 720, '10,14,24', 0.3);
  g.fillStyle = 'rgba(208,214,217,0.045)';
  for (let y = 12; y < 1080; y += 24) for (let x = 12; x < 1920; x += 24) { g.beginPath(); g.arc(x, y, 1, 0, Math.PI * 2); g.fill(); }
}
// headline: plain words + one accent phrase on Strata's blue highlight bar
function heading(el, plain, accent) {
  el.innerHTML = (plain ? plain.split(' ').map(w => `<span>${w}</span>`).join(' ') + ' ' : '') + `<span class="acc"><i></i><b>${accent}</b></span>`;
  [...el.children].forEach(s => { s.style.opacity = 0; });
}
function setupLogo() {
  $('pTop').setAttribute('d', LOGO.mark.top); $('pBot').setAttribute('d', LOGO.mark.bottom);
  const NS = 'http://www.w3.org/2000/svg';
  for (const d of LOGO.letters) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', '#d0d6d9'); $('gLetters').appendChild(p); LET.push(p); }
}

// ---- timeline helpers ----
const move = (obj, to, at, dur, ease = 'power3.inOut') => tl.to(obj, { ...to, duration: dur, ease }, at);
const set = (obj, props, at) => tl.set(obj, props, at);
function cardIn(el, at, st = 0.08, s0 = 1.05) {
  const kids = [...el.children], n = kids.length, bar = el.querySelector('.acc i');
  const E = at + st * (n - 1) + 0.45 + 0.4 + 0.04 * n;
  tl.fromTo(kids, { opacity: 0, y: 34, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, ease: 'expo.out', stagger: st }, at);
  tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.out' }, at + st * (n - 1) + 0.12);
  tl.fromTo(el, { scale: s0 }, { scale: 1, duration: 0.8, ease: 'expo.out' }, at);
  tl.fromTo(el, { scale: 1 }, { scale: 1.03, duration: E - at - 0.8, ease: 'none', immediateRender: false }, at + 0.8);
  return E;
}
function cardOut(el, at, mode = 'push') {
  if (mode === 'push') { tl.fromTo(el, { scale: 1.03 }, { scale: 1.45, duration: 0.42, ease: 'power2.in', immediateRender: false }, at); tl.to(el.children, { opacity: 0, filter: 'blur(10px)', duration: 0.24, ease: 'power2.in', stagger: 0.015 }, at); }
  else tl.set(el.children, { opacity: 0 }, at);
}
const tap = (obj, k, at) => { move(obj, { [k]: 1 }, at, 0.07, 'power1.out'); move(obj, { [k]: 0 }, at + 0.07, 0.14, 'power1.in'); };
const curIn = (w, x, y, at) => { set(S.cur, { w, x, y, op: 0, hand: 0 }, at); move(S.cur, { op: 1 }, at, 0.2, 'none'); };
const curGo = (x, y, at, dur, hand = 0) => { move(S.cur, { x, y }, at, dur, 'power2.inOut'); move(S.cur, { hand }, at + dur * (hand ? 0.75 : 0.1), 0.12, 'none'); };
const click = at => tap(S.cur, 'press', at);
const curOut = at => move(S.cur, { op: 0 }, at, 0.18, 'none');
const hover = (k, at, dur = 0.18) => move(S, { [k]: 1 }, at, dur, 'power1.out');
const unhover = (k, at, dur = 0.25) => move(S, { [k]: 0 }, at, dur, 'power1.in');
const pop = (k, at, dur = 0.45) => move(S, { [k]: 1 }, at, dur, 'expo.out');

function build() {
  tl = gsap.timeline({ paused: true });
  const mb = (a, b) => MBW.push([a, b]);
  const dipIn = at => move(S, { black: 1 }, at, 0.18, 'power2.in');
  const dipOut = at => move(S, { black: 0 }, at, 0.45, 'expo.out');
  const scr = (c, x, y) => [960 + (x - c.cx) * K * c.z, 540 + (y - c.cy) * K * c.z];
  const akey = (id, t, d, ease, to, an) => { const L = KEYS[id], last = L[L.length - 1]; if (last && t < last.t + last.d - 1e-6) console.error(`camera keys overlap on ${id} at ${t.toFixed(2)}`); L.push({ t, d, to, ease, an }); };
  // the only moves: push/pull about a fixed point, or a pan on one axis
  const focusPt = (k, C) => [(C.cx * C.z - k.cx * k.z) / (C.z - k.z), (C.cy * C.z - k.cy * k.z) / (C.z - k.z)];
  const zoomTo = (id, C, at, dur, ease) => { const k = camAt(id, at), P = focusPt(k, C); akey(id, at, dur, ease, cam(C.cx, C.cy, C.z), { wx: P[0], wy: P[1], s: scr(k, P[0], P[1]) }); };
  const panX = (id, x, at, dur, ease) => { const k = camAt(id, at); akey(id, at, dur, ease, cam(x, k.cy, k.z)); };
  const panY = (id, y, at, dur, ease) => { const k = camAt(id, at); akey(id, at, dur, ease, cam(k.cx, y, k.z)); };

  // ===== 01 LOGO: the two halves of the mark lock together, the wordmark writes on, zoom through =====
  move(S, { black: 0 }, 0, 0.5, 'sine.inOut');
  move(S, { mk: 1 }, 0.15, 1.1, 'expo.out');
  move(S, { glow: 1 }, 0.35, 0.8, 'sine.inOut');
  move(S, { q: 1 }, 1.4, 0.5, 'power3.inOut');
  tl.fromTo(LET, { opacity: 0, x: 5, filter: 'blur(1.6px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out', stagger: 0.055 }, 1.55);
  move(S, { logoScale: 1.04 }, 1.95, 0.7, 'sine.inOut');
  move(S, { logoScale: 7 }, 2.65, 0.3, 'power3.in'); mb(2.62, 2.96);
  dipIn(2.78);
  set(S, { logoOn: 0 }, 2.96);

  // ===== 02 TAGLINE → slides off as Markets slides in =====
  const H = 2.96;
  dipOut(H + 0.02);
  cardIn($('h1'), H + 0.06, 0.075, 0.86);
  const SL = H + 1.2;
  set(S, { A: 1 }, SL);
  tl.fromTo($('h1'), { x: 0 }, { x: -SHIFT, duration: STRIP, ease: CAM_EASE }, SL); mb(SL, SL + STRIP);
  pan('A', HOME, SL, STRIP);
  cardOut($('h1'), SL + 0.95, 'fade');

  // ===== 03 MARKETS: locked off; the cursor reads the Ethena card, then pushes through View Market =====
  const Dn = SL + STRIP;
  curIn('A', 980, 600, Dn + 0.05); curGo(330, 470, Dn + 0.1, 0.55); hover('hovA', Dn + 0.5);
  curGo(300, 668, Dn + 1.2, 0.45); hover('hovAr', Dn + 1.5, 0.15); unhover('hovAr', Dn + 2.0);
  curGo(BTN_A[0], BTN_A[1], Dn + 2.0, 0.45, 1); hover('btnA', Dn + 2.4, 0.12);
  click(Dn + 2.7);
  zoomTo('A', cam(BTN_A[0], BTN_A[1], 7.5), Dn + 2.75, 0.7, 'power3.in'); mb(Dn + 3.1, Dn + 3.45);
  curOut(Dn + 2.8);
  dipIn(Dn + 3.27);
  set(S, { A: 0 }, Dn + 3.45);

  // ===== 04 "One yield. Two tranches." grows out of the dip; the camera pushes through it =====
  const X0 = Dn + 3.45;
  dipOut(X0 + 0.02);
  const E0 = cardIn($('card0'), X0 + 0.06, 0.08, 0.86);
  cardOut($('card0'), E0, 'push');

  // ===== 05 ETHENA MARKET: fly in → page scrolls to the tranches → tooltip rides the curve → pick Senior → whip down =====
  const T = E0 + 0.22;
  move(S, { B: 1 }, T, 0.28, 'sine.inOut');
  pan('B', HOME, T, 1.05, LAND); mb(T, T + 0.35);
  curIn('B', 640, 700, T + 0.9);
  move(S, { bscroll: 1 }, T + 1.05, 0.95, 'power2.inOut');
  const c0 = 150, y0 = CURVE[c0] - SCB + 30;
  curGo(c0, y0, T + 1.5, 0.55);
  move(S, { tip: 1 }, T + 2.0, 0.3, 'power2.out');
  move(S.cur, { x: 640 }, T + 2.1, 1.45, 'sine.inOut');                      // the tooltip rides along with the cursor
  move(S, { tip: 0 }, T + 3.55, 0.25, 'power2.in');
  curGo(TAB_SR[0], TAB_SR[1] - SCB, T + 3.6, 0.55, 1); hover('hovTab', T + 4.05, 0.12);
  click(T + 4.3); move(S, { sr: 1 }, T + 4.35, 0.22, 'power1.out'); unhover('hovTab', T + 4.37, 0.15);
  curGo(330, 300, T + 4.6, 0.4); curOut(T + 4.85);
  panY('B', 405 + 1300 / (K * BASEZ), T + 4.95, 0.42, 'power3.in'); mb(T + 5.0, T + 5.6);
  set(S, { B: 0 }, T + 5.3);

  // ===== 06 "Pick your risk. Earn your way." rides up on the whip, carries on up as the buy flow rises in =====
  const X1 = T + 5.18;
  tl.fromTo($('card1'), { y: 1000 }, { y: 0, duration: 0.45, ease: 'power3.out' }, X1);
  const E1 = cardIn($('card1'), X1 + 0.06, 0.07, 1);
  tl.fromTo($('card1'), { y: 0 }, { y: -SV, duration: STRIP, ease: CAM_EASE, immediateRender: false }, E1); mb(E1, E1 + STRIP);
  cardOut($('card1'), E1 + 0.95, 'fade');

  // ===== 07 BUY: rise → click the amount → snap in while typing → Buy → snap out → status → success → whip right =====
  set(S, { C: 1 }, E1);
  pan('C', HOME, E1, STRIP);
  const W = E1 + STRIP;
  curIn('C', 1000, 720, W + 0.05); curGo(IN_C[0], IN_C[1] - SCB, W + 0.1, 0.55, 1);
  click(W + 0.7); move(S, { inC: 1 }, W + 0.72, 0.15, 'none'); set(S, { caret: 1 }, W + 0.72);
  zoomTo('C', cam(1121, 481, 1.3), W + 0.78, 0.5, 'expo.out'); mb(W + 0.78, W + 0.98);
  [1, 2, 3, 4].forEach((n, i) => set(S, { amt: n }, W + 1.4 + i * 0.13));
  curGo(BUY_C[0], BUY_C[1] - SCB, W + 2.05, 0.5, 1); hover('btnC', W + 2.5, 0.12);
  click(W + 2.75); set(S, { caret: 0 }, W + 2.76); move(S, { inC: 0 }, W + 2.76, 0.15, 'none');
  zoomTo('C', HOME, W + 2.85, 0.45, 'expo.out'); mb(W + 2.85, W + 3.05);
  curOut(W + 2.95); unhover('btnC', W + 2.9);
  move(S, { dimC: 0.7 }, W + 3.0, 0.3, 'power1.out'); pop('stat', W + 3.05);
  move(S, { stat: 0 }, W + 3.85, 0.18, 'power1.in'); pop('ok', W + 3.9, 0.5);
  panX('C', 720 + 1800 / (K * BASEZ), W + 4.95, 0.5, 'power3.in'); mb(W + 5.15, W + 5.9);
  set(S, { C: 0 }, W + 5.62);

  // ===== 08 "Every position, one view." rides in on the whip, slides off as Portfolio glides in =====
  const X2 = W + 5.49;
  tl.fromTo($('card2'), { x: 1500 }, { x: 0, duration: 0.45, ease: 'power3.out' }, X2);
  const E2 = cardIn($('card2'), X2 + 0.05, 0.07, 1);
  tl.fromTo($('card2'), { x: 0 }, { x: -SHIFT, duration: STRIP, ease: CAM_EASE, immediateRender: false }, E2); mb(E2, E2 + STRIP);
  cardOut($('card2'), E2 + 0.95, 'fade');

  // ===== 09 PORTFOLIO: glide in → expand jrUSDe → the page scrolls to its networks → whip left =====
  set(S, { D: 1 }, E2);
  pan('D', HOME, E2, STRIP);
  const R = E2 + STRIP;
  curIn('D', 300, 560, R + 0.05); curGo(CHEV_D[0], CHEV_D[1], R + 0.1, 0.6, 1);
  click(R + 0.8); move(S, { exp: 1 }, R + 0.85, 0.55, 'power2.out');
  move(S, { dscroll: 1 }, R + 1.4, 0.9, 'power2.inOut');
  curGo(640, 822 - SCD, R + 1.5, 0.75); hover('hovD', R + 2.2); unhover('hovD', R + 2.95);
  curOut(R + 3.0);
  panX('D', 720 - 1800 / (K * BASEZ), R + 3.05, 0.5, 'power3.in'); mb(R + 3.25, R + 4.0);
  set(S, { D: 0 }, R + 3.72);

  // ===== 10 "Earn points along the way." rides in from the left, slides off as Points glides in =====
  const X3 = R + 3.59;
  tl.fromTo($('card3'), { x: -1500 }, { x: 0, duration: 0.45, ease: 'power3.out' }, X3);
  const E3 = cardIn($('card3'), X3 + 0.05, 0.07, 1);
  tl.fromTo($('card3'), { x: 0 }, { x: SHIFT, duration: STRIP, ease: CAM_EASE, immediateRender: false }, E3); mb(E3, E3 + STRIP);
  cardOut($('card3'), E3 + 0.95, 'fade');

  // ===== 11 POINTS: glide in → View Leaderboard → the leaderboard rises → you, #34 =====
  set(S, { E: 1 }, E3);
  pan('E', HOME, E3, STRIP);
  const Q = E3 + STRIP;
  curIn('E', 900, 560, Q + 0.05); curGo(LB_E[0], LB_E[1], Q + 0.1, 0.6, 1); hover('btnE', Q + 0.6, 0.12);
  click(Q + 0.9); unhover('btnE', Q + 0.95, 0.15);
  move(S, { dimE: 0.7 }, Q + 0.95, 0.3, 'power1.out'); pop('lb', Q + 1.0, 0.55);
  curGo(760, 650, Q + 1.35, 0.5, 0); hover('hovYou', Q + 1.8); curOut(Q + 2.35);

  // ===== 12 MONTAGE: fifteen screens, locked off and centred; every shot shorter than the last =====
  const M = Q + 2.5;
  const DUR = [0.7, 0.7, 0.7, 0.58, 0.5, 0.44, 0.39, 0.35, 0.32, 0.29, 0.27, 0.25, 0.23, 0.22, 0.21];
  const NM = DUR.length, XF = 0.14, MT = DUR.reduce((a, b) => a + b, 0);
  set(S, { M: 1, mx: 0 }, M);
  tl.fromTo(S, { Mfade: 0 }, { Mfade: 1, duration: XF, ease: 'none', immediateRender: false }, M);
  set(S, { E: 0 }, M + XF);
  let mt = M;
  for (let i = 1; i < NM; i++) { mt += DUR[i - 1]; const xf = Math.min(XF, DUR[i] * 0.3); move(S, { mx: i }, mt - xf / 2, xf, 'none'); }

  // ===== 13 END: the montage gives way to the lockup + strata.markets, then black for the loop =====
  const LP = M + MT;
  move(S, { endFade: 1 }, LP - 0.12, 0.3, 'power1.in');
  set(S, { logoOn: 1, outro: 1, logoScale: 1, q: 1, mk: 1, glow: 0 }, LP - 0.12);
  set(LET, { opacity: 1, x: 0, filter: 'blur(0px)' }, LP - 0.12);
  move(S, { endIn: 1 }, LP + 0.05, 0.8, 'expo.out');
  move(S, { glow: 0.6 }, LP + 0.05, 0.8, 'sine.inOut');
  set(S, { M: 0 }, LP + 0.2);
  const ENDT = LP + 1.9;
  move(S, { black: 1 }, ENDT - 0.5, 0.5, 'sine.inOut');
  tl.set({}, {}, ENDT);

  window.TIMES = { H, SL, Dn, X0, E0, T, X1, E1, W, X2, E2, R, X3, E3, Q, M, LP, ENDT };
  window.DURATION = +ENDT.toFixed(3);
  window.MB = MBW;
}

// ---------------- apply ----------------
const applyCam = (el, c) => { el.style.transform = `translate(960px,540px) scale(${K * c.z}) translate(${-c.cx}px,${-c.cy}px)`; };
const w2s = (c, x, y) => [960 + (x - c.cx) * K * c.z, 540 + (y - c.cy) * K * c.z];
const curveY = x => { const k = clamp(Math.round(x), 74, 776); return CURVE[k]; };

function applyLogo() {
  show($('logo'), S.logoOn > 0); show($('glow'), S.logoOn > 0); show($('endtag'), S.outro > 0);
  if (!S.logoOn) return;
  const L = 6.2, MZ = 9, LY = S.outro ? 500 : 540;
  const ox = 960 - 111 * L / 2, oy = LY - 14 * L;
  const lock = [ox + 8.54 * L, oy + 14 * L];
  const q = S.q, s = lerp(MZ, L, q), cx = lerp(960, lock[0], q), cy = lerp(LY, lock[1], q);
  // the halves arrive from opposite sides and lock together
  const mk = S.mk, d = (1 - mk) * 9;
  const gx = cx - 8.54 * s, gy = cy - 14 * s;
  $('gTop').setAttribute('transform', `translate(${gx + d * 0.55 * s} ${gy - d * s}) scale(${s})`);
  $('gBot').setAttribute('transform', `translate(${gx - d * 0.55 * s} ${gy + d * s}) scale(${s})`);
  $('gTop').style.opacity = $('gBot').style.opacity = clamp(mk * 2, 0, 1);
  $('gLetters').setAttribute('transform', `translate(${ox + LOGO.typeOffset[0] * L} ${oy + LOGO.typeOffset[1] * L}) scale(${L})`);
  Object.assign($('glow').style, { left: (cx - 500) + 'px', top: (cy - 500) + 'px', opacity: S.glow * (1 - 0.45 * q) * clamp(mk * 1.5, 0, 1) });
  let sc = `scale(${S.logoScale})`, op = 1;
  if (S.outro) { const e = S.endIn; sc = `scale(${0.96 + 0.04 * e})`; op = e; $('logo').style.filter = `blur(${(1 - e) * 6}px)`; Object.assign($('endtag').style, { opacity: e * 0.9, transform: `translateY(${(1 - e) * 12}px)` }); }
  else $('logo').style.filter = '';
  Object.assign($('logo').style, { transformOrigin: `${cx}px ${cy}px`, transform: sc, opacity: op }); $('glow').style.transform = sc;
}

function render(t) {
  window.bgTick(t);
  tl.time(t, false);
  for (const id of IDS) S.cams[id] = camAt(id, t);
  // background parallax: the dotted backdrop follows the visible camera at a fraction of its travel
  let px = 0, py = 0, pz = 0, wsum = 0;
  for (const id of IDS) { const w = S[id]; if (w <= 0.001) continue; const c = S.cams[id]; px += w * (c.cx - 720); py += w * (c.cy - 405); pz += w * Math.log(clamp(c.z / BASEZ, 0.5, 2.5)); wsum += w; }
  if (wsum > 1) { px /= wsum; py /= wsum; pz /= wsum; }
  $('bg').style.transform = `translate(${1.0 * t - clamp(px * 0.09, -90, 90)}px,${0.4 * t - clamp(py * 0.09, -60, 60)}px) scale(${1.04 * Math.exp(0.1 * pz)})`;
  $('black').style.opacity = S.black;
  applyLogo();

  show($('wA'), S.A > 0.001);
  if (S.A > 0.001) { $('hovA').style.opacity = S.hovA; $('hovAr').style.opacity = S.hovAr; $('btnA').style.opacity = S.btnA * 0.6; applyCam($('wA'), S.cams.A); $('wA').style.opacity = S.A; }

  show($('wB'), S.B > 0.001);
  if (S.B > 0.001) {
    const sc = SCB * S.bscroll; $('pgB').style.transform = `translateY(${-sc}px)`;
    $('bSr').style.opacity = S.sr; $('hovTab').style.opacity = S.hovTab;
    const tp = S.tip; show($('tip'), tp > 0.001); show($('tdot'), tp > 0.001);
    if (tp > 0.001) {
      const hx = clamp(S.cur.x, 80, 770), cy = curveY(hx);
      Object.assign($('tdot').style, { left: (hx - 4) + 'px', top: (cy - 4) + 'px', opacity: clamp(tp * 2, 0, 1) });
      Object.assign($('tip').style, { left: (hx - 63) + 'px', top: (cy - 65) + 'px', opacity: clamp(tp * 2, 0, 1), transform: `translateY(${(1 - tp) * 6}px)` });
      $('tMon').textContent = MONTHS[clamp(Math.round((hx - 122.5) / 101), 0, 6)];
      $('tVal').textContent = '$' + (1 + 2 * (920 - cy) / 198.5).toFixed(2) + 'B';
      if (S.cur.w === 'B') S.cur.y = cy - sc + 30;                         // the cursor rides the curve with its tooltip
    }
    applyCam($('wB'), S.cams.B); $('wB').style.opacity = S.B;
  }

  show($('wC'), S.C > 0.001);
  if (S.C > 0.001) {
    $('pgC').style.transform = `translateY(${-SCB}px)`;
    const n = Math.round(S.amt); document.querySelectorAll('.buyst').forEach((im, i) => { im.style.opacity = i === n - 1 ? 1 : 0; });
    $('inC').style.opacity = S.inC; $('caretC').style.opacity = S.caret && (n < 4 || Math.floor(t * 2.6) % 2 === 0) ? 1 : 0;
    $('btnC').style.opacity = S.btnC * 0.5;
    $('dimC').style.opacity = S.dimC;
    Object.assign($('mStat').style, { opacity: clamp(S.stat * 1.6, 0, 1), transform: `scale(${0.94 + 0.06 * S.stat})` });
    Object.assign($('mOk').style, { opacity: clamp(S.ok * 1.6, 0, 1), transform: `scale(${0.94 + 0.06 * S.ok})` });
    applyCam($('wC'), S.cams.C); $('wC').style.opacity = S.C;
  }

  show($('wD'), S.D > 0.001);
  if (S.D > 0.001) {
    $('pgD').style.transform = `translateY(${-SCD * S.dscroll}px)`;
    const e = S.exp, open = e > 0.001;
    $('dOpen').style.opacity = open ? 1 : 0; $('dLowWrap').style.opacity = open ? 1 : 0;
    $('dOpen').style.clipPath = `inset(0 0 ${1052 - (732 + 180 * e)}px 0)`;
    $('dLowWrap').style.transform = `translateY(${180 * e}px)`;
    $('hovD').style.opacity = S.hovD;
    applyCam($('wD'), S.cams.D); $('wD').style.opacity = S.D;
  }

  show($('wE'), S.E > 0.001);
  if (S.E > 0.001) {
    $('btnE').style.opacity = S.btnE * 0.6; $('dimE').style.opacity = S.dimE;
    Object.assign($('mLb').style, { opacity: clamp(S.lb * 1.6, 0, 1), transform: `translateY(${(1 - S.lb) * 18}px) scale(${0.96 + 0.04 * S.lb})` });
    $('hovYou').style.opacity = S.hovYou;
    applyCam($('wE'), S.cams.E); $('wE').style.opacity = S.E;
  }

  show($('wM'), S.M > 0.001);
  if (S.M > 0.001) {
    const f = Math.floor(S.mx + 1e-6), fr = S.mx - f;
    [...document.querySelectorAll('.mshot')].forEach((im, i) => { im.style.opacity = i <= f ? 1 : i === f + 1 ? fr : 0; im.style.display = i <= f + 1 ? '' : 'none'; });
    applyCam($('wM'), S.cams.M); $('wM').style.opacity = (S.E > 0.001 ? S.Mfade : 1) * (1 - S.endFade);
  }
  ['h1', 'card0', 'card1', 'card2', 'card3'].forEach(id => { const el = $(id); show(el, [...el.children].some(s => parseFloat(s.style.opacity || 0) > 0.001)); });

  const cur = $('cursor'), cs = S.cur;
  if (cs.op > 0.001) {
    const [x, y] = w2s(S.cams[cs.w], cs.x, cs.y);
    Object.assign(cur.style, { display: 'block', left: x + 'px', top: y + 'px', opacity: cs.op, transform: `scale(${1 - 0.16 * cs.press})`, transformOrigin: '0 0' });
    $('curArrow').style.opacity = 1 - cs.hand; $('curHand').style.opacity = cs.hand;
  } else cur.style.display = 'none';
}

window.render = render;
window.ready = (async () => {
  CURVE = await (await fetch('assets/chart_curve.json')).json();
  const BG = new URLSearchParams(location.search).get('bg') || 'Silk';
  await window.mountBg($('bgIn'), BG, (window.BGP || {})[BG] || {});
  for (let i = 0; i < 4; i++) window.bgTick(i / 60);
  const mc = $('mCard');
  ['m00_wallet', 'm01_bar', 'm02_eco', 'm03_settings', 'm04_referees', 'm05_sort', 'm06_collapy', 'm07_history', 'm08_asset', 'm09_invite', 'm10_menu', 'm11_coll', 'm12_sell', 'm13_toasts', 'm14_selljr'].forEach(n => { const im = document.createElement('img'); im.className = 'mshot'; im.src = `assets/${n}.jpg`; Object.assign(im.style, { left: 0, top: 0, width: '1440px', height: '810px' }); mc.appendChild(im); });
  // Markets: card + jrUSDe row hovers
  Object.assign($('hovA').style, { left: '32px', top: '268px', width: '679px', height: '517px' });
  const ar = document.createElement('div'); ar.id = 'hovAr'; ar.className = 'hovr'; Object.assign(ar.style, { left: '40px', top: '637px', width: '664px', height: '68px', borderRadius: '6px' }); $('wA').firstElementChild.appendChild(ar);
  Object.assign($('hovD').style, { top: '792px', height: '60px' });
  heading($('h1'), 'Democratizing', 'on-chain yields.');
  heading($('card0'), 'One yield.', 'Two tranches.');
  heading($('card1'), 'Pick your risk.', 'Earn your way.');
  heading($('card2'), 'Every position,', 'one view.');
  heading($('card3'), 'Earn points', 'along the way.');
  setupLogo(); build();
  await document.fonts.load('600 32px DMS'); await document.fonts.load('500 14px DMM');
  await Promise.all([...document.images].map(i => i.decode().catch(() => null)));
  render(0); return true;
})();
