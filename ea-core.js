/* Electronics Adventure - core: helpers, storage, sync, router and the main screens.
 * Plain JS, no build step. Content lives in ea-content.js, labs in ea-labs-*.js, parent area in ea-parent.js. */
(function () {
  'use strict';
  const EA = window.EA = window.EA || {};
  EA.labs = EA.labs || {};
  EA.units = EA.units || [];
  EA.screens = EA.screens || {};
  EA.VERSION = '1.0.0';

  /* ================= DOM helpers ================= */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function applyProps(el, props, svg) {
    if (!props) return;
    for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.slice(0, 2) === '--') el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
      else if (k === 'html') el.innerHTML = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  function kids(el, list) {
    for (const c of list.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
  }
  const h = EA.h = function (tag, props, ...list) { const el = document.createElement(tag); applyProps(el, props); kids(el, list); return el; };
  const s = EA.s = function (tag, props, ...list) { const el = document.createElementNS(SVGNS, tag); applyProps(el, props, true); kids(el, list); return el; };
  const $ = EA.$ = (sel, root) => (root || document).querySelector(sel);
  EA.rand = n => Math.floor(Math.random() * n);
  EA.pick = a => a[Math.floor(Math.random() * a.length)];
  EA.shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  EA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  EA.GATES = {
    AND: (a, b) => a & b, OR: (a, b) => a | b, NOT: a => a ? 0 : 1,
    NAND: (a, b) => (a & b) ^ 1, NOR: (a, b) => (a | b) ^ 1, XOR: (a, b) => a ^ b
  };

  /* ================= cleanup registry (labs set timers) ================= */
  let cleanups = [];
  EA.onLeave = fn => { cleanups.push(fn); };
  EA.cleanup = () => { const c = cleanups; cleanups = []; c.forEach(fn => { try { fn(); } catch (e) { } }); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } };
  EA.every = (fn, ms) => { const id = setInterval(fn, ms); EA.onLeave(() => clearInterval(id)); return id; };
  EA.after = (fn, ms) => { const id = setTimeout(fn, ms); EA.onLeave(() => clearTimeout(id)); return id; };

  /* ================= sound + speech ================= */
  let actx = null;
  function tone(freq, dur, type, vol, when) {
    if (!D.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      o.connect(g); g.connect(actx.destination);
      const t = actx.currentTime + (when || 0), v = vol == null ? 0.14 : vol;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.03);
    } catch (e) { }
  }
  EA.tone = tone;
  EA.sfx = {
    ok() { tone(523, .12); tone(659, .12, 'sine', .14, .1); tone(784, .22, 'sine', .14, .2); },
    bad() { tone(200, .28, 'sawtooth', .09); },
    click() { tone(660, .05, 'square', .05); },
    on() { tone(880, .09, 'triangle', .13); },
    off() { tone(440, .09, 'triangle', .13); },
    buzz() { tone(190, .35, 'square', .08); },
    beep(f, d) { tone(f || 1000, d || .08, 'square', .07); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .18, 'triangle', .15, i * .11)); },
    star() { tone(988, .1, 'triangle', .13); tone(1319, .16, 'triangle', .13, .09); }
  };
  EA.say = function (text) {
    if (!D.tts) return;
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[⚡💡🔌]/g, ''));
      u.rate = 0.9; u.pitch = 1.05; u.lang = 'en-GB';
      speechSynthesis.speak(u);
    } catch (e) { }
  };
  EA.sayBtn = text => h('button', { class: 'say', 'aria-label': 'Read aloud', onclick: () => EA.say(text) }, '🔊');

  /* ================= storage ================= */
  const KEY = 'ea_v1', NKEY = 'ea_notes_v1';
  const defaults = () => ({ v: 1, profiles: [], cur: null, prog: {}, pin: '', fam: '', famPin: '', sound: true, tts: true, parts: {}, sessionsDone: {} });
  function load() { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return defaults(); } }
  let D = load();
  EA.D = () => D;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } scheduleSync(); }
  EA.save = save;
  EA.notes = {
    all(pid) { try { return (JSON.parse(localStorage.getItem(NKEY)) || {})[pid] || []; } catch (e) { return []; } },
    put(pid, list) { try { const o = JSON.parse(localStorage.getItem(NKEY)) || {}; o[pid] = list; localStorage.setItem(NKEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
  };

  /* ================= bands, avatars ================= */
  EA.BANDS = [
    { id: 'sprout', e: '🌱', name: 'Sprout', ages: '2–3', desc: 'Big buttons, no reading' },
    { id: 'spark', e: '⚡', name: 'Spark', ages: '4–6', desc: 'Pictures, read-aloud, simple rounds' },
    { id: 'maker', e: '🔧', name: 'Maker', ages: '7–8', desc: 'Predict, build, truth tables' },
    { id: 'engineer', e: '🚀', name: 'Engineer', ages: '9–10', desc: 'Numbers, formulas, code' }
  ];
  EA.AVATARS = ['🦊', '🐱', '🐶', '🦉', '🐢', '🦋', '🌟', '🚀', '🌈', '🐸', '🦄', '🐼', '🐙', '🦁', '🐧', '🌻', '🤖', '🎨', '🐝', '🦖'];
  const bandFromGrade = g => { g = String(g); if (g === 'PS' || g === 'PK') return 'sprout'; if (g === 'K' || g === '1') return 'spark'; if (g === '2' || g === '3') return 'maker'; return 'engineer'; };
  EA.P = () => D.profiles.find(p => p.id === D.cur) || null;
  EA.lvl = () => { const b = (EA.P() || {}).band; return b === 'engineer' ? 3 : b === 'maker' ? 2 : 1; };
  EA.band = () => (EA.P() || {}).band || 'spark';

  /* ================= progress ================= */
  function PR(pid) { pid = pid || D.cur; if (!pid) return null; return D.prog[pid] || (D.prog[pid] = { labs: {}, quiz: {}, missions: {}, badges: {} }); }
  EA.PR = PR;
  EA.labStars = (id, pid) => ((PR(pid) || { labs: {} }).labs[id] || {}).stars || 0;
  EA.totalStars = pid => { const pr = PR(pid); if (!pr) return 0; let n = 0; for (const k in pr.labs) n += pr.labs[k].stars || 0; for (const k in pr.quiz) n += pr.quiz[k].pct >= 90 ? 3 : pr.quiz[k].pct >= 70 ? 2 : 1; return n; };
  EA.unit = id => EA.units.find(u => u.id === Number(id));
  EA.unitStatus = function (u, pid) {
    const pr = PR(pid) || { labs: {}, quiz: {}, missions: {}, badges: {} };
    const labsDone = u.labs.filter(id => ((pr.labs[id] || {}).stars || 0) > 0).length;
    const q = pr.quiz[u.id]; const quizBest = q ? q.pct : null;
    const quizPass = quizBest != null && quizBest >= 70;
    const mDone = u.sessions.filter((x, i) => pr.missions['u' + u.id + 's' + i]).length;
    const parts = u.labs.length + 1;
    const pct = Math.round(((labsDone + (quizPass ? 1 : 0)) / parts) * 100);
    return { labsDone, labsTotal: u.labs.length, quizBest, quizPass, mDone, mTotal: u.sessions.length, badge: !!pr.badges[u.id], pct };
  };
  EA.recordLab = function (labId, stars, score, max) {
    const pr = PR(); if (!pr) return;
    const old = pr.labs[labId] || {};
    if (stars > (old.stars || 0)) pr.labs[labId] = { stars, score, max, at: Date.now() };
    else pr.labs[labId] = Object.assign({}, old, { at: Date.now() });
    save(); checkBadge(EA.labs[labId] && EA.unit(EA.labs[labId].unit));
  };
  EA.recordQuiz = function (unitId, pct) {
    const pr = PR(); if (!pr) return;
    const old = pr.quiz[unitId];
    if (!old || pct > old.pct) pr.quiz[unitId] = { pct, at: Date.now() };
    save(); checkBadge(EA.unit(unitId));
  };
  EA.toggleMission = function (key, force) {
    const pr = PR(); if (!pr) return false;
    pr.missions[key] = force == null ? !pr.missions[key] : !!force;
    if (!pr.missions[key]) delete pr.missions[key];
    save(); return !!pr.missions[key];
  };
  function checkBadge(u) {
    if (!u) return;
    const st = EA.unitStatus(u), pr = PR();
    if (st.labsDone === st.labsTotal && st.quizPass && !pr.badges[u.id]) {
      pr.badges[u.id] = Date.now(); save();
      setTimeout(() => EA.badgeModal(u), 700);
    }
  }
  EA.badgeModal = function (u) {
    EA.confetti(); EA.sfx.win();
    EA.modal(h('div', null,
      h('div', { class: 'bigem' }, u.badge.emoji),
      h('h2', null, 'Badge earned!'),
      h('p', { class: 'mt8', style: { fontWeight: 800, fontSize: '1.2rem', color: u.color } }, u.badge.name),
      h('p', { class: 'muted mt8' }, u.badge.earned),
      h('div', { class: 'row mt16', style: { justifyContent: 'center' } },
        h('button', { class: 'btn mint', onclick: () => { EA.closeModal(); } }, 'Hooray! 🎉'))));
  };

  /* ================= overlays ================= */
  let modalEl = null;
  EA.closeModal = () => { if (modalEl) { modalEl.remove(); modalEl = null; } };
  EA.modal = function (content, opts) {
    EA.closeModal();
    modalEl = h('div', { class: 'modal', onclick: e => { if (e.target === modalEl && opts && opts.dismiss) EA.closeModal(); } }, h('div', { class: 'box' }, content));
    document.body.append(modalEl); return modalEl;
  };
  EA.toast = function (msg) {
    const t = h('div', { class: 'toast' }, msg); document.body.append(t); setTimeout(() => t.remove(), 2200);
  };
  EA.confetti = function () {
    const cols = ['#FFD166', '#06D6A0', '#FF6B6B', '#2D6BE4', '#9B6BE4', '#F29B38'];
    for (let i = 0; i < 44; i++) {
      const c = h('i', { class: 'confetti', style: { left: Math.random() * 100 + 'vw', background: cols[i % cols.length], animationDelay: (Math.random() * 0.6) + 's', animationDuration: (2 + Math.random() * 1.6) + 's' } });
      document.body.append(c); setTimeout(() => c.remove(), 4200);
    }
  };
  EA.starsEl = (n, max) => { max = max || 3; const el = h('span', { class: 'stars' }); for (let i = 0; i < max; i++) el.append(h('span', { class: i < n ? '' : 'off' }, '⭐')); return el; };

  /* ================= LED + toggle widgets ================= */
  EA.led = (on, color, big) => h('span', { class: 'led ' + (color || 'red') + (on ? ' on' : ' off') + (big ? ' lg' : '') });
  EA.setLed = (el, on) => { el.classList.toggle('on', !!on); el.classList.toggle('off', !on); };
  EA.toggle = function (label, init, onchange) {
    let v = init ? 1 : 0;
    const val = h('span', { class: 'v' }, String(v));
    const b = h('button', { class: 'tog' + (v ? ' on' : ''), 'aria-pressed': String(!!v) }, val, h('small', null, label));
    b.onclick = () => { v = v ? 0 : 1; val.textContent = v; b.classList.toggle('on', !!v); b.setAttribute('aria-pressed', String(!!v)); v ? EA.sfx.on() : EA.sfx.off(); onchange && onchange(v); };
    b.get = () => v;
    b.set = x => { v = x ? 1 : 0; val.textContent = v; b.classList.toggle('on', !!v); };
    return b;
  };

  /* ================= cloud sync (optional; app works offline) ================= */
  EA.FIREBASE = {
    apiKey: 'AIzaSyCxqGRhdCyh92LyiFvrTi6ETTiFKVhDvUM', authDomain: 'homeschool-math.firebaseapp.com', projectId: 'homeschool-math',
    storageBucket: 'homeschool-math.firebasestorage.app', messagingSenderId: '275309549483', appId: '1:275309549483:web:3c118499f22eb23e6f24ee'
  };
  let fbP = null;
  function fb() {
    if (fbP) return fbP;
    fbP = (async () => {
      try {
        const app = await import('https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js');
        const fs = await import('https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js');
        const a = app.getApps().length ? app.getApp() : app.initializeApp(EA.FIREBASE);
        return { fs, db: fs.getFirestore(a) };
      } catch (e) { console.warn('Firebase unavailable', e); fbP = null; return null; }
    })();
    return fbP;
  }
  function mergeProg(a, b) {
    const out = Object.assign({}, a);
    for (const pid of Object.keys(b || {})) {
      const x = out[pid] || { labs: {}, quiz: {}, missions: {}, badges: {} }, y = b[pid] || {};
      const m = { labs: Object.assign({}, x.labs), quiz: Object.assign({}, x.quiz), missions: Object.assign({}, y.missions || {}, x.missions), badges: Object.assign({}, y.badges || {}, x.badges) };
      for (const k in (y.labs || {})) { const c = m.labs[k]; if (!c || (y.labs[k].stars || 0) > (c.stars || 0)) m.labs[k] = y.labs[k]; }
      for (const k in (y.quiz || {})) { const c = m.quiz[k]; if (!c || (y.quiz[k].pct || 0) > (c.pct || 0)) m.quiz[k] = y.quiz[k]; }
      out[pid] = m;
    }
    return out;
  }
  async function cloudPull() {
    if (!D.fam) return false;
    const f = await fb(); if (!f) return false;
    try {
      const snap = await f.fs.getDoc(f.fs.doc(f.db, 'families', D.fam + '_ea'));
      if (snap.exists()) { const r = snap.data(); D.prog = mergeProg(D.prog, r.prog || {}); try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } }
      return true;
    } catch (e) { console.warn('pull failed', e); return false; }
  }
  async function cloudPush() {
    if (!D.fam) return false;
    const f = await fb(); if (!f) return false;
    try {
      await cloudPull();
      await f.fs.setDoc(f.fs.doc(f.db, 'families', D.fam + '_ea'), { app: 'electronics-adventure', prog: D.prog, ts: Date.now() }, { merge: false });
      return true;
    } catch (e) { console.warn('push failed', e); return false; }
  }
  let syncT = null;
  function scheduleSync() { if (!D.fam) return; clearTimeout(syncT); syncT = setTimeout(cloudPush, 2500); }
  EA.syncNow = cloudPush;
  EA.joinFamily = async function (code) {
    code = String(code || '').trim().toUpperCase();
    if (!/^[A-Z]{2}-[A-Z0-9]{4}$/.test(code)) return { ok: false, msg: 'A family code looks like MA-AB12.' };
    const f = await fb(); if (!f) return { ok: false, msg: 'Could not reach the cloud. Check the internet and try again.' };
    try {
      const snap = await f.fs.getDoc(f.fs.doc(f.db, 'families', code));
      if (!snap.exists()) return { ok: false, msg: 'No family found with that code.' };
      const fam = snap.data(); let added = 0;
      for (const p of (fam.profiles || [])) {
        const id = String(p.id);
        if (!D.profiles.some(x => x.id === id)) { D.profiles.push({ id, name: p.name || 'Explorer', avatar: p.avatar || '🌟', band: bandFromGrade(p.gradeId) }); added++; }
      }
      D.fam = code; D.famPin = fam.parentPin || '';
      if (!D.cur && D.profiles.length) D.cur = D.profiles[0].id;
      save(); await cloudPull(); save();
      return { ok: true, msg: added ? 'Joined! Added ' + added + ' explorer' + (added > 1 ? 's' : '') + '.' : 'Joined! Progress synced.', added };
    } catch (e) { return { ok: false, msg: 'Something went wrong joining. Try again.' }; }
  };
  EA.leaveFamily = () => { D.fam = ''; D.famPin = ''; save(); };

  /* ================= router ================= */
  EA.go = path => { if (location.hash === '#' + path) render(); else location.hash = '#' + path; };
  EA.back = fallback => { if (history.length > 1) history.back(); else EA.go(fallback || '/'); };
  function seg() { const raw = (location.hash.slice(1) || '/'); const [path, qs] = raw.split('?'); return { parts: path.split('/').filter(Boolean), qs: new URLSearchParams(qs || '') }; }

  const NAV = [['/', '🏠', 'Home'], ['/badges', '🏅', 'Badges'], ['/notebook', '📓', 'Notebook'], ['/sprouts', '🌱', 'Sparks'], ['/parent', '🔒', 'Parents']];
  function navBar(active) {
    return h('nav', { class: 'nav' }, h('div', null, NAV.map(([p, e, t]) => h('button', { class: active === p ? 'on' : '', onclick: () => EA.go(p) }, h('span', { class: 'e' }, e), t))));
  }
  EA.topbar = function (title, backPath, right) {
    return h('div', { class: 'topbar' },
      h('button', { class: 'iconbtn', 'aria-label': 'Back', onclick: () => backPath ? EA.go(backPath) : EA.back('/') }, '←'),
      h('h2', null, title), right || null);
  };
  EA.starPill = () => h('span', { class: 'starpill' }, '⭐ ' + EA.totalStars());

  function render() {
    EA.cleanup(); EA.closeModal();
    const app = $('#app'); app.innerHTML = ''; app.style.removeProperty('--c');
    document.querySelectorAll('.nav').forEach(n => n.remove());
    window.scrollTo(0, 0);
    const { parts, qs } = seg();
    const r = parts[0] || '';
    if (!D.profiles.length && r !== 'welcome' && r !== 'parent') return EA.go('/welcome');
    if (D.profiles.length && !EA.P()) { D.cur = D.profiles[0].id; save(); }
    let nav = null;
    try {
      if (r === '') { app.append(screenHome()); nav = '/'; }
      else if (r === 'welcome') app.append(screenWelcome(qs));
      else if (r === 'who') app.append(screenWho());
      else if (r === 'unit') app.append(screenUnit(parts[1]));
      else if (r === 'lab') app.append(screenLab(parts[1]));
      else if (r === 'quiz') app.append(screenQuiz(parts[1]));
      else if (r === 'badges') { app.append(screenBadges()); nav = '/badges'; }
      else if (r === 'notebook') { app.append(screenNotebook(parts[1], qs)); nav = parts[1] ? null : '/notebook'; }
      else if (r === 'sprouts') { app.append(screenSprouts(parts[1])); nav = parts[1] ? null : '/sprouts'; }
      else if (r === 'parent') { app.append(EA.screens.parent ? EA.screens.parent() : h('p', null, 'Parent area missing.')); nav = '/parent'; }
      else { app.append(screenHome()); nav = '/'; }
    } catch (e) {
      console.error(e);
      app.append(h('div', { class: 'card' }, h('h3', null, 'Oops, something broke'), h('p', { class: 'muted mt8' }, String(e && e.message || e)), h('button', { class: 'btn mt12', onclick: () => EA.go('/') }, 'Home')));
    }
    if (nav) document.body.append(navBar(nav));
  }
  EA.render = render;

  /* ================= screens ================= */
  const traces = () => s('svg', { class: 'traces', viewBox: '0 0 400 200', preserveAspectRatio: 'xMidYMid slice' },
    s('path', { d: 'M0 40 H90 L110 60 H200 L220 40 H400 M0 120 H60 L80 100 H180 M120 180 H260 L280 160 H400 M300 40 V100 H400', fill: 'none', stroke: '#fff', 'stroke-width': 2 }),
    [[90, 40], [200, 60], [180, 100], [260, 180], [300, 100], [400, 160]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 5, fill: '#FFD166' })));

  function screenHome() {
    const p = EA.P(), band = p.band;
    const next = EA.units.find(u => !EA.unitStatus(u).badge) || EA.units[0];
    const wrap = h('div', null);
    wrap.append(h('div', { class: 'hero' }, traces(), h('div', { class: 'spark' }, '⚡'),
      h('div', { class: 'row' },
        h('div', { class: 'brand' }, h('div', { class: 'logo' }, '💡'), h('div', null, h('h1', null, 'Electronics Adventure'), h('small', null, 'Light it. Switch it. Remember it.'))),
        h('button', { class: 'who', onclick: () => EA.go('/who') }, h('span', { class: 'av' }, p.avatar), p.name)),
      h('div', { class: 'hello' }, 'Hi ' + p.name + '! ', h('span', null, '⭐ ' + EA.totalStars() + ' stars so far · ' + Object.keys(EA.PR().badges).length + ' of 7 badges'))));
    if (band === 'sprout') {
      wrap.append(h('div', { class: 'card', style: { marginTop: '-34px', position: 'relative' } },
        h('div', { class: 'center' }, h('div', { class: 'bigem' }, '🌱'), h('h2', null, 'Little Sparks'), h('p', { class: 'muted mt8' }, 'Big buttons for little hands!'),
          h('button', { class: 'btn big mint mt12', onclick: () => EA.go('/sprouts') }, 'Play 🌱'))));
    }
    const q = h('div', { class: 'quest', style: band === 'sprout' ? { marginTop: '8px' } : {} });
    EA.units.forEach(u => {
      const st = EA.unitStatus(u);
      q.append(h('button', { class: 'node' + (st.badge ? ' got' : ''), style: { '--c': u.color }, onclick: () => EA.go('/unit/' + u.id) },
        next === u && !st.badge ? h('span', { class: 'nextpill' }, 'Next up') : null,
        h('div', { class: 'em' }, u.emoji),
        h('div', { class: 'tx' }, h('span', { class: 'un' }, 'Quest ' + u.id), h('b', null, u.title), h('span', null, u.tagline),
          h('div', { class: 'bar' }, h('i', { style: { width: st.pct + '%' } }))),
        h('div', { class: 'bd' }, u.badge.emoji)));
    });
    wrap.append(q);
    wrap.append(h('div', { class: 'card flat mt24 center' }, h('b', null, '🧰 Real parts, real builds'),
      h('p', { class: 'muted small mt8' }, 'Each quest has Missions to build with your grown-up, using real parts. The Labs and Quizzes here help you practise first.')));
    return wrap;
  }

  /* ---------- welcome / who ---------- */
  function profileForm(onDone, opts) {
    opts = opts || {};
    let av = EA.AVATARS[EA.rand(EA.AVATARS.length)], band = 'maker';
    const name = h('input', { class: 'inp', placeholder: 'Name', maxlength: 20, autocomplete: 'off' });
    const avBox = h('div', { class: 'avgrid' });
    const bBox = h('div', { class: 'bands' });
    const drawAv = () => { avBox.innerHTML = ''; EA.AVATARS.forEach(a => avBox.append(h('button', { class: a === av ? 'on' : '', onclick: () => { av = a; drawAv(); } }, a))); };
    const drawB = () => { bBox.innerHTML = ''; EA.BANDS.forEach(b => bBox.append(h('button', { class: b.id === band ? 'on' : '', onclick: () => { band = b.id; drawB(); } }, h('span', { class: 'e' }, b.e), h('span', null, h('b', null, b.name + ' (ages ' + b.ages + ')'), h('br'), h('span', { class: 'muted small' }, b.desc))))); };
    drawAv(); drawB();
    return h('div', null, h('label', { class: 'lbl' }, 'Explorer name'), name, h('label', { class: 'lbl' }, 'Pick a friend'), avBox, h('label', { class: 'lbl' }, 'Who is this?'), bBox,
      h('button', { class: 'btn big mint wide mt16', onclick: () => {
        const n = name.value.trim(); if (!n) { name.focus(); return EA.toast('Type a name first'); }
        const p = { id: 'p' + Date.now().toString(36) + EA.rand(99), name: n, avatar: av, band };
        D.profiles.push(p); D.cur = p.id; save(); onDone(p);
      } }, opts.cta || 'Start exploring ⚡'));
  }

  function screenWelcome(qs) {
    const wrap = h('div', null);
    wrap.append(h('div', { class: 'hero' }, traces(), h('div', { class: 'spark' }, '⚡'),
      h('div', { class: 'brand' }, h('div', { class: 'logo' }, '💡'), h('div', null, h('h1', null, 'Electronics Adventure'), h('small', null, 'Welcome, explorer!')))));
    const joinMsg = h('div', { class: 'feedback' });
    const code = h('input', { class: 'inp', placeholder: 'MA-AB12 or WA-AB12', maxlength: 7, autocapitalize: 'characters', autocomplete: 'off', value: D.fam || qs.get('family') || '' });
    const joinBtn = h('button', { class: 'btn wide mt8', onclick: async () => {
      joinBtn.disabled = true; joinMsg.textContent = 'Joining…'; joinMsg.className = 'feedback';
      const r = await EA.joinFamily(code.value); joinBtn.disabled = false;
      joinMsg.textContent = r.msg; joinMsg.className = 'feedback ' + (r.ok ? 'good' : 'bad');
      if (r.ok && D.profiles.length) setTimeout(() => EA.go('/'), 800);
    } }, 'Join my family');
    wrap.append(h('div', { class: 'card', style: { marginTop: '-30px', position: 'relative' } }, h('h3', null, '🏠 I have a family code'),
      h('p', { class: 'muted small mt8' }, 'Use the same code as Math Adventure or Words Adventure. Your explorers and progress come along.'), h('div', { class: 'mt8' }, code), joinBtn, joinMsg));
    wrap.append(h('div', { class: 'card' }, h('h3', null, '✨ New explorer'), profileForm(() => EA.go('/'))));
    return wrap;
  }

  function screenWho() {
    const wrap = h('div', null, EA.topbar('Who is playing?', '/'));
    D.profiles.forEach(p => {
      const st = EA.totalStars(p.id);
      wrap.append(h('button', { class: 'nbitem', onclick: () => { D.cur = p.id; save(); EA.go('/'); } },
        h('span', { style: { fontSize: '2.4rem' } }, p.avatar), h('span', { style: { flex: 1 } }, h('b', null, p.name), h('br'), h('span', { class: 'muted small' }, (EA.BANDS.find(b => b.id === p.band) || {}).name + ' · ⭐ ' + st)),
        p.id === D.cur ? h('span', null, '✔️') : null));
    });
    wrap.append(h('div', { class: 'card mt16' }, h('h3', null, '➕ Add an explorer'), profileForm(() => EA.go('/'), { cta: 'Add explorer' })));
    return wrap;
  }

  /* ---------- unit ---------- */
  function screenUnit(id) {
    const u = EA.unit(id); if (!u) return h('p', null, 'Quest not found');
    const app = $('#app'); app.style.setProperty('--c', u.color);
    const st = EA.unitStatus(u), pr = EA.PR();
    const wrap = h('div', { style: { '--c': u.color } });
    wrap.append(h('div', { class: 'uhero' },
      h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('button', { class: 'iconbtn', onclick: () => EA.go('/') }, '←'), h('span', { class: 'starpill' }, '⭐ ' + EA.totalStars())),
      h('div', { class: 'row mt12' }, h('div', { class: 'em' }, u.emoji), h('div', null, h('div', { style: { fontWeight: 800, opacity: .85, fontSize: '.8rem', letterSpacing: '.08em' } }, 'QUEST ' + u.id), h('h1', null, u.title))),
      h('div', { class: 'bq' }, '🤔 ' + u.bigQuestion, ' ', EA.sayBtn(u.bigQuestion))));
    wrap.append(h('div', { class: 'card' }, h('p', null, u.story, ' ', EA.sayBtn(u.story)),
      h('div', { class: 'bar mt12' }, h('i', { style: { width: st.pct + '%' } })),
      h('p', { class: 'small muted mt8' }, st.labsDone + ' of ' + st.labsTotal + ' labs · quiz ' + (st.quizBest == null ? 'not tried' : st.quizBest + '%') + ' · badge ' + (st.badge ? 'earned! ' + u.badge.emoji : 'not yet'))));

    wrap.append(h('h3', { class: 'sec' }, '🧪 Labs ', h('span', { class: 'muted small' }, '(practise on screen)')));
    u.labs.forEach(lid => {
      const lab = EA.labs[lid]; if (!lab) return;
      wrap.append(h('button', { class: 'labcard', onclick: () => EA.go('/lab/' + lid) }, h('span', { class: 'em' }, lab.emoji), h('span', { style: { flex: 1 } }, h('b', null, lab.title), h('span', { class: 'd' }, lab.blurb)), EA.starsEl(EA.labStars(lid))));
    });
    wrap.append(h('button', { class: 'labcard', onclick: () => EA.go('/quiz/' + u.id) }, h('span', { class: 'em' }, '❓'), h('span', { style: { flex: 1 } }, h('b', null, 'Quest Quiz'), h('span', { class: 'd' }, '5 questions. Get 70% for your badge!')),
      h('span', { class: 'chip' }, st.quizBest == null ? 'Try it' : st.quizBest + '%')));

    wrap.append(h('h3', { class: 'sec' }, '🔧 Missions ', h('span', { class: 'muted small' }, '(build with real parts)')));
    const mc = h('div', { class: 'card' });
    u.sessions.forEach((m, i) => {
      const key = 'u' + u.id + 's' + i;
      const ck = h('button', { class: 'ck' + (pr.missions[key] ? ' on' : ''), 'aria-label': 'Mark done' }, pr.missions[key] ? '✔' : '');
      ck.onclick = () => { const on = EA.toggleMission(key); ck.classList.toggle('on', on); ck.textContent = on ? '✔' : ''; on ? EA.sfx.star() : EA.sfx.click(); };
      mc.append(h('div', { class: 'mission' }, ck, h('div', { style: { flex: 1 } }, h('b', null, (i + 1) + '. ' + m.title), h('div', { class: 'small mt8' }, m.kid, ' ', EA.sayBtn(m.kid)),
        m.parts && m.parts.length ? h('div', { class: 'parts' }, m.parts.map(x => h('span', null, x))) : null,
        m.sprout ? h('div', { class: 'small muted mt8' }, '🌱 Little ones: ' + m.sprout) : null)));
    });
    wrap.append(mc);

    wrap.append(h('h3', { class: 'sec' }, '📖 Words to know'));
    const def = h('div', { class: 'vdef' }, 'Tap a word!');
    wrap.append(h('div', { class: 'vocab' }, u.vocab.map(v => h('button', { onclick: () => { def.textContent = v.w + ': ' + v.d; EA.say(v.w + '. ' + v.d); } }, v.w))), def);
    wrap.append(h('div', { class: 'card flat mt24 center' }, h('div', { class: 'bigem', style: { filter: st.badge ? 'none' : 'grayscale(1)', opacity: st.badge ? 1 : .4 } }, u.badge.emoji), h('b', null, u.badge.name),
      h('p', { class: 'muted small mt8' }, st.badge ? u.badge.earned : u.badge.how)));
    wrap.append(h('div', { style: { height: '30px' } }));
    return wrap;
  }

  /* ---------- lab ---------- */
  function screenLab(id) {
    const lab = EA.labs[id]; if (!lab) return h('p', null, 'Lab not found');
    const u = EA.unit(lab.unit);
    const wrap = h('div', { style: { '--c': u ? u.color : '#2D6BE4' } });
    wrap.append(EA.topbar(lab.emoji + ' ' + lab.title, '/unit/' + lab.unit, EA.starsEl(EA.labStars(id))));
    const root = h('div', null); wrap.append(root);
    const ctx = {
      root, band: EA.band(), lvl: EA.lvl(), unit: u,
      finish(score, max, msg) {
        const ratio = max ? score / max : 1; const stars = ratio >= .9 ? 3 : ratio >= .6 ? 2 : 1;
        const prev = EA.labStars(id);
        EA.recordLab(id, stars, score, max);
        EA.sfx.win(); if (stars === 3) EA.confetti();
        EA.modal(h('div', null, h('div', { class: 'bigem' }, ['🙂', '😀', '🤩', '🏆'][stars]), h('h2', null, ['', 'Nice work!', 'Great job!', 'Amazing!'][stars]),
          h('div', { class: 'mt8', style: { fontSize: '2rem' } }, EA.starsEl(stars)),
          h('p', { class: 'muted mt8' }, msg || (max > 1 ? score + ' out of ' + max : 'Lab complete!')),
          prev && stars <= prev ? h('p', { class: 'small muted mt8' }, 'Your best is ' + prev + ' ⭐') : null,
          h('div', { class: 'wrapx mt16', style: { justifyContent: 'center' } },
            h('button', { class: 'btn ghost', onclick: () => { EA.closeModal(); render(); } }, '🔁 Again'),
            h('button', { class: 'btn mint', onclick: () => { EA.closeModal(); EA.go('/unit/' + lab.unit); } }, 'Back to quest'))));
      },
      sayPrompt(text) { return h('div', { class: 'prompt' }, text, ' ', EA.sayBtn(text)); }
    };
    try { lab.run(ctx); } catch (e) { console.error(e); root.append(h('div', { class: 'card' }, 'This lab hit a snag: ' + e.message)); }
    return wrap;
  }

  /* ---------- quiz ---------- */
  function screenQuiz(id) {
    const u = EA.unit(id); if (!u) return h('p', null, 'Quest not found');
    const wrap = h('div', { style: { '--c': u.color } });
    wrap.append(EA.topbar('❓ ' + u.title + ' quiz', '/unit/' + u.id));
    const qs = EA.shuffle(u.quiz).slice(0, 5);
    let i = 0, right = 0;
    const box = h('div', { class: 'stage' }); wrap.append(box);
    function show() {
      box.innerHTML = '';
      const q = qs[i];
      const order = EA.shuffle(q.opts.map((o, idx) => ({ o, ok: idx === q.a })));
      const fb = h('div', { class: 'feedback' });
      const next = h('button', { class: 'btn mint wide mt12 hide' }, i === qs.length - 1 ? 'See my score' : 'Next →');
      const btns = order.map(x => {
        const b = h('button', { class: 'choice' }, x.o);
        b.onclick = () => {
          btns.forEach(bb => bb.disabled = true);
          if (x.ok) { right++; b.classList.add('good'); fb.textContent = '✅ Yes! ' + q.why; fb.className = 'feedback good'; EA.sfx.ok(); }
          else { b.classList.add('bad'); btns[order.findIndex(y => y.ok)].classList.add('good'); fb.textContent = '💡 ' + q.why; fb.className = 'feedback bad'; EA.sfx.bad(); }
          next.classList.remove('hide');
        };
        return b;
      });
      next.onclick = () => { if (++i < qs.length) show(); else done(); };
      box.append(h('div', { class: 'progress' }, h('i', { style: { width: (i / qs.length * 100) + '%' } })),
        h('div', { class: 'prompt' }, q.q, ' ', EA.sayBtn(q.q)), h('div', { class: 'choices' }, btns), fb, next);
    }
    function done() {
      const pct = Math.round(right / qs.length * 100);
      EA.recordQuiz(u.id, pct);
      const pass = pct >= 70; pass ? EA.sfx.win() : EA.sfx.click(); if (pct === 100) EA.confetti();
      box.innerHTML = '';
      box.append(h('div', { class: 'center' }, h('div', { class: 'bigem' }, pass ? '🎉' : '💪'), h('h2', null, right + ' out of ' + qs.length),
        h('p', { class: 'muted mt8' }, pass ? 'You passed the quest quiz!' : 'So close! Try the labs again, then have another go.'),
        h('div', { class: 'wrapx mt16', style: { justifyContent: 'center' } }, h('button', { class: 'btn ghost', onclick: render }, '🔁 Try again'), h('button', { class: 'btn mint', onclick: () => EA.go('/unit/' + u.id) }, 'Back to quest'))));
    }
    show();
    return wrap;
  }

  /* ---------- badges ---------- */
  function screenBadges() {
    const pr = EA.PR(); const wrap = h('div', null, EA.topbar('My badges', '/', EA.starPill()));
    const grid = h('div', { class: 'sprouts' });
    EA.units.forEach(u => {
      const got = !!pr.badges[u.id];
      grid.append(h('button', { class: 'toy', style: { background: got ? u.color : '#cfd6e2' }, onclick: () => got ? EA.badgeModal(u) : EA.go('/unit/' + u.id) },
        h('span', { class: 'em', style: { filter: got ? 'none' : 'grayscale(1)', opacity: got ? 1 : .5 } }, u.badge.emoji), h('span', null, u.badge.name), h('small', { style: { fontFamily: 'Nunito', fontWeight: 700, opacity: .9 } }, got ? 'Earned!' : 'Quest ' + u.id)));
    });
    wrap.append(grid);
    const all = EA.units.every(u => pr.badges[u.id]);
    const capKey = 'capstone', teachKey = 'taught';
    const mk = (key, label) => {
      const ck = h('button', { class: 'ck' + (pr.missions[key] ? ' on' : ''), style: { '--c': '#FF6B6B', width: '34px', height: '34px', borderRadius: '11px', border: '3px solid #FF6B6B', background: pr.missions[key] ? '#FF6B6B' : '#fff', color: '#fff', flex: 'none' } }, pr.missions[key] ? '✔' : '');
      ck.onclick = () => { const on = EA.toggleMission(key); ck.textContent = on ? '✔' : ''; ck.style.background = on ? '#FF6B6B' : '#fff'; render(); };
      return h('div', { class: 'row mt12' }, ck, h('span', null, label));
    };
    const master = all && pr.missions[capKey] && pr.missions[teachKey];
    wrap.append(h('div', { class: 'card mt24 center' }, h('div', { class: 'bigem', style: { filter: master ? 'none' : 'grayscale(1)', opacity: master ? 1 : .4 } }, '👑'), h('h3', null, 'Master Builder'),
      h('p', { class: 'muted small mt8' }, 'Earn all 7 badges, build a capstone project, and teach one lesson to a sibling.'),
      h('div', { style: { textAlign: 'left', maxWidth: '360px', margin: '10px auto 0' } }, h('div', { class: 'row' }, h('span', null, all ? '✅' : '⬜'), h('span', null, 'All 7 badges')), mk(capKey, 'I built my capstone project'), mk(teachKey, 'I taught a lesson to a sibling'))));
    if (master) { wrap.append(h('div', { class: 'card center' }, h('b', null, '🎓 Master Builder!'), h('p', { class: 'muted small mt8' }, 'You did it. Time for Demo Day!'))); }
    return wrap;
  }

  /* ---------- notebook ---------- */
  function screenNotebook(sub, qs) {
    const pid = D.cur;
    if (sub === 'new') return notebookEditor(pid, qs);
    const list = EA.notes.all(pid);
    const wrap = h('div', null, EA.topbar('📓 Lab notebook', '/', h('button', { class: 'btn mint', onclick: () => EA.go('/notebook/new') }, '+ New page')));
    wrap.append(h('p', { class: 'muted small mt12' }, 'Predict, draw, test, and write what surprised you. Pages stay on this device.'));
    if (!list.length) wrap.append(h('div', { class: 'card center' }, h('div', { class: 'bigem' }, '✏️'), h('p', { class: 'mt8' }, 'No pages yet. Tap “New page” after your next build!')));
    list.slice().reverse().forEach(n => wrap.append(h('button', { class: 'nbitem', onclick: () => viewNote(n) }, n.img ? h('img', { src: n.img, alt: '' }) : h('span', { style: { fontSize: '2rem', width: '84px', textAlign: 'center' } }, '📄'),
      h('span', { style: { flex: 1 } }, h('b', null, n.title || 'My page'), h('br'), h('span', { class: 'muted small' }, new Date(n.ts).toLocaleDateString())))));
    return wrap;
  }
  function viewNote(n) {
    EA.modal(h('div', { style: { textAlign: 'left' } }, h('h3', null, n.title || 'My page'), n.img ? h('img', { src: n.img, style: { width: '100%', borderRadius: '12px', border: '2px solid var(--line)', margin: '8px 0' }, alt: '' }) : null,
      h('p', null, h('b', null, 'I predicted: '), n.predict || '—'), h('p', { class: 'mt8' }, h('b', null, 'What happened: '), n.happened || '—'),
      h('div', { class: 'wrapx mt16' }, h('button', { class: 'btn ghost', onclick: () => { if (confirm('Delete this page?')) { EA.notes.put(D.cur, EA.notes.all(D.cur).filter(x => x.id !== n.id)); EA.closeModal(); render(); } } }, '🗑 Delete'), h('button', { class: 'btn', onclick: EA.closeModal }, 'Close'))), { dismiss: true });
  }
  function notebookEditor(pid, qs) {
    const wrap = h('div', { class: 'nb' }, EA.topbar('New notebook page', '/notebook'));
    const unitOpts = [h('option', { value: '' }, 'Any quest')].concat(EA.units.map(u => h('option', { value: u.id, selected: String(u.id) === qs.get('unit') }, 'Quest ' + u.id + ': ' + u.title)));
    const sel = h('select', { class: 'inp' }, unitOpts);
    const pred = h('textarea', { class: 'inp', rows: 2, placeholder: 'I think … will happen' });
    const happened = h('textarea', { class: 'inp', rows: 3, placeholder: 'What happened? What surprised me?' });
    const cv = h('canvas', { width: 600, height: 400 }); const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 600, 400); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1A2E4A';
    let drawing = false, last = null;
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 600 / r.width, (e.clientY - r.top) * 400 / r.height]; };
    cv.addEventListener('pointerdown', e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.arc(last[0], last[1], 2.5, 0, 7); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); });
    cv.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p; });
    const stop = () => { drawing = false; }; cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
    const colors = ['#1A2E4A', '#FF6B6B', '#2D6BE4', '#06D6A0', '#F29B38', '#9B6BE4'];
    const sw = h('div', { class: 'swatches' });
    colors.forEach((c, i) => sw.append(h('button', { class: i === 0 ? 'on' : '', style: { background: c }, 'aria-label': 'Colour ' + (i + 1), onclick: ev => { ctx.strokeStyle = c; sw.querySelectorAll('button').forEach(b => b.classList.remove('on')); ev.currentTarget.classList.add('on'); } })));
    sw.append(h('button', { class: 'chip btnlike', style: { marginLeft: 'auto' }, onclick: () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 600, 400); } }, 'Clear'));
    wrap.append(h('div', { class: 'card' }, h('label', { class: 'lbl' }, 'Which quest?'), sel, h('label', { class: 'lbl' }, '1. My prediction'), pred, h('label', { class: 'lbl' }, '2. My drawing'), sw, cv, h('label', { class: 'lbl' }, '3. What happened'), happened,
      h('button', { class: 'btn big mint wide mt16', onclick: () => {
        const u = EA.unit(sel.value);
        const note = { id: 'n' + Date.now(), ts: Date.now(), unit: sel.value || null, title: u ? u.title : 'My page', predict: pred.value.trim(), happened: happened.value.trim(), img: cv.toDataURL('image/jpeg', 0.6) };
        const list = EA.notes.all(pid).concat(note).slice(-40);
        if (!EA.notes.put(pid, list)) { delete note.img; list[list.length - 1] = note; EA.notes.put(pid, list); EA.toast('Saved without the drawing (storage is full)'); } else EA.toast('Page saved! 📓');
        EA.sfx.ok(); EA.go('/notebook');
      } }, 'Save page')));
    return wrap;
  }

  /* ---------- Little Sparks (toddler toys) ---------- */
  function screenSprouts(toy) {
    if (toy && SPROUT_TOYS[toy]) { const t = SPROUT_TOYS[toy]; const w = h('div', null, EA.topbar(t.emoji + ' ' + t.title, '/sprouts')); const stage = h('div', { class: 'stage center' }); w.append(stage); t.run(stage); return w; }
    const wrap = h('div', null, EA.topbar('🌱 Little Sparks', '/'));
    wrap.append(h('p', { class: 'muted small mt12' }, 'Big, safe, screen-sized electronics toys for the smallest explorers. A grown-up can sit alongside!'));
    const grid = h('div', { class: 'sprouts mt12' });
    Object.keys(SPROUT_TOYS).forEach(k => { const t = SPROUT_TOYS[k]; grid.append(h('button', { class: 'toy', style: { background: t.color }, onclick: () => { EA.say(t.title); EA.go('/sprouts/' + k); } }, h('span', { class: 'em' }, t.emoji), t.title)); });
    wrap.append(grid);
    return wrap;
  }
  const SPROUT_TOYS = {
    light: {
      emoji: '💡', title: 'Light Switch', color: '#F29B38', run(st) {
        let on = false; const bulb = h('div', { class: 'bulb' }, '💡'); const b = h('button', { class: 'bigbtn', style: { margin: '16px auto 0', minWidth: '180px' } }, '🔘');
        b.onclick = () => { on = !on; bulb.classList.toggle('on', on); on ? EA.sfx.on() : EA.sfx.off(); EA.say(on ? 'On!' : 'Off!'); };
        st.append(bulb, b);
      }
    },
    sun: {
      emoji: '☀️', title: 'Sun & Fan', color: '#FFB703', run(st) {
        let sun = true; const fan = h('div', { style: { fontSize: '6rem', display: 'inline-block' } }, '🌀'); const sunEl = h('div', { style: { fontSize: '5rem' } }, '☀️');
        const set = () => { fan.style.animation = sun ? 'spin .5s linear infinite' : 'none'; sunEl.textContent = sun ? '☀️' : '☁️'; };
        const b = h('button', { class: 'bigbtn', style: { margin: '14px auto 0', minWidth: '180px', background: '#bfe0ff', boxShadow: '0 8px 0 #7aa8d6' } }, '☁️');
        b.onclick = () => { sun = !sun; set(); sun ? EA.sfx.on() : EA.sfx.off(); EA.say(sun ? 'Sunny! The fan spins!' : 'Cloudy. The fan stops.'); };
        set(); st.append(sunEl, fan, b); EA.onLeave(() => { fan.style.animation = 'none'; });
      }
    },
    opposite: {
      emoji: '🦉', title: 'Opposite Owl', color: '#9B6BE4', run(st) {
        const owl = h('div', { style: { fontSize: '6rem' } }, '🦉'); const says = h('div', { class: 'prompt', style: { fontSize: '1.8rem' } }, 'Press a button!');
        const arrow = h('div', { style: { fontSize: '4.5rem', minHeight: '5.5rem' } }, '');
        const mk = (e, name, opp) => { const b = h('button', { class: 'bigbtn', style: { margin: '0 8px' } }, e); b.onclick = () => { arrow.textContent = opp; says.textContent = 'I do the opposite!'; EA.sfx.click(); EA.say('You said ' + name + '. I say ' + (name === 'up' ? 'down' : 'up') + '!'); }; return b; };
        st.append(owl, says, arrow, h('div', { class: 'row', style: { justifyContent: 'center' } }, mk('⬆️', 'up', '⬇️'), mk('⬇️', 'down', '⬆️')));
      }
    },
    door: {
      emoji: '🚪', title: 'Magic Door', color: '#06B386', run(st) {
        let mode = 'both'; const held = [false, false];
        const door = h('div', { style: { fontSize: '6rem' } }, '🚪'); const hint = h('div', { class: 'prompt' }, 'Hold BOTH buttons!');
        const upd = () => { const open = mode === 'both' ? held[0] && held[1] : held[0] || held[1]; const was = door.textContent === '🏰'; door.textContent = open ? '🏰' : '🚪'; if (open && !was) { EA.sfx.ok(); EA.say('Open!'); } };
        const mk = i => { const b = h('button', { class: 'bigbtn', style: { margin: '0 8px', touchAction: 'none' } }, i ? '🔵' : '🔴');
          const dn = e => { e.preventDefault(); held[i] = true; b.classList.add('held'); upd(); }, up = () => { held[i] = false; b.classList.remove('held'); upd(); };
          b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up); return b; };
        const sw = h('button', { class: 'chip btnlike mt16', onclick: () => { mode = mode === 'both' ? 'either' : 'both'; sw.textContent = mode === 'both' ? 'Needs BOTH' : 'Needs EITHER'; hint.textContent = mode === 'both' ? 'Hold BOTH buttons!' : 'Press EITHER button!'; EA.say(mode === 'both' ? 'Both' : 'Either'); } }, 'Needs BOTH');
        st.append(door, hint, h('div', { class: 'row', style: { justifyContent: 'center' } }, mk(0), mk(1)), sw);
      }
    },
    count: {
      emoji: '🔢', title: 'Count the Lights', color: '#E0529C', run(st) {
        const words = ['one', 'two', 'three', 'four', 'five']; let n = 0; const row = h('div', { class: 'row', style: { justifyContent: 'center', flexWrap: 'wrap' } });
        const lamps = words.map((w, i) => { const l = h('button', { class: 'bulb', style: { background: 'none', border: 'none', fontSize: '3.6rem' } }, '💡'); l.onclick = () => { n = Math.max(n, i + 1); l.classList.add('on'); EA.tone(500 + i * 120, .2, 'triangle', .15); EA.say(w); }; row.append(l); return l; });
        const reset = h('button', { class: 'btn ghost mt16', onclick: () => { lamps.forEach(l => l.classList.remove('on')); n = 0; EA.sfx.off(); } }, 'Lights off');
        st.append(h('div', { class: 'prompt' }, 'Tap each light and count!'), row, reset);
      }
    },
    echo: {
      emoji: '🦇', title: 'Bat Echo', color: '#3A7BD5', run(st) {
        const bat = h('div', { style: { fontSize: '5rem' } }, '🦇'); const wall = h('div', { style: { fontSize: '4rem' } }, '🧱'); const msg = h('div', { class: 'prompt' }, 'Ping! The bat listens for the echo.');
        const ping = (near) => { msg.textContent = near ? 'Wall is NEAR: echo comes back fast!' : 'Wall is FAR: echo takes longer…'; EA.tone(1200, .12, 'sine', .15); EA.say(near ? 'Near. Quick echo!' : 'Far. Slow echo.'); setTimeout(() => EA.tone(1200, .12, 'sine', .08), near ? 350 : 1200); };
        st.append(h('div', { class: 'row', style: { justifyContent: 'center', fontSize: '2rem' } }, bat, '…', wall), msg,
          h('div', { class: 'row mt16', style: { justifyContent: 'center' } }, h('button', { class: 'btn big', onclick: () => ping(true) }, 'Near'), h('button', { class: 'btn big coral', onclick: () => ping(false) }, 'Far')));
      }
    }
  };

  /* ================= start ================= */
  EA.start = function () {
    // Harbor hand-off: ?from=harbor&family=MA-XXXX&child=<id>&view=parent
    const q = new URLSearchParams(location.search);
    EA.fromHarbor = q.get('from') === 'harbor';
    const boot = async () => {
      if (q.get('family') && q.get('family') !== D.fam) await EA.joinFamily(q.get('family'));
      if (q.get('child') && D.profiles.some(p => p.id === q.get('child'))) { D.cur = q.get('child'); save(); }
      if (q.get('view') === 'parent' && EA.fromHarbor) { sessionStorage.setItem('ea_harbor_parent', '1'); location.hash = '#/parent'; }
      render();
      if (D.fam) cloudPull().then(() => { if (!document.querySelector('.modal')) { const r = seg().parts[0]; if (!r || r === 'badges') render(); } });
    };
    window.addEventListener('hashchange', render);
    if (q.get('family') || q.get('child') || q.get('view')) boot(); else { render(); if (D.fam) cloudPull().then(ok => { if (ok && !document.querySelector('.modal')) { const r = seg().parts[0]; if (!r || r === 'badges') render(); } }); }
  };
})();
