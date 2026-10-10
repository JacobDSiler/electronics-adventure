/* Electronics Adventure - labs for Quests 4-5 (gates from transistors, memory with latches). */
(function () {
  'use strict';
  const EA = window.EA, h = EA.h, s = EA.s;
  const wire = { stroke: '#1A2E4A', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
  const L = (x1, y1, x2, y2, extra) => s('line', Object.assign({ x1, y1, x2, y2 }, wire, extra || {}));
  const T = (x, y, str, extra) => s('text', Object.assign({ x, y, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#6b768a', 'font-family': 'Nunito,sans-serif' }, extra || {}), str);
  const HOT = '#F29B38', COLD = '#9aa3b2';

  /* =============== QUEST 4 =============== */

  /* ---- Gate Lab ---- */
  EA.lab({
    id: 'gatelab', unit: 4, title: 'Gate Lab', emoji: '🔬', blurb: 'Flip the inputs and watch the transistors',
    run(ctx) {
      const types = ['NOT', 'NOR', 'NAND']; let cur = 'NOT'; let a = 0, b = 0; const done = { NOT: false, NOR: false, NAND: false };
      const seen = { NOT: new Set(), NOR: new Set(), NAND: new Set() };
      const need = { NOT: 2, NOR: 4, NAND: 4 };
      const holder = h('div', { class: 'svgwrap' }), tabs = h('div', { class: 'wrapx', style: { justifyContent: 'center' } }), tbl = h('div', null), ctl = h('div', { class: 'row', style: { justifyContent: 'center' } }), status = h('div', { class: 'feedback' });
      const tA = EA.toggle('Input A', 0, v => { a = v; draw(); }), tB = EA.toggle('Input B', 0, v => { b = v; draw(); });
      const conduct = () => cur === 'NOT' ? a : cur === 'NOR' ? (a | b) : (a & b);
      function tr(x, y, on, label) {
        return [s('rect', { x: x - 28, y: y - 18, width: 56, height: 36, rx: 8, fill: on ? '#b9f3df' : '#e3e7ee', stroke: '#1A2E4A', 'stroke-width': 4 }), T(x, y - 2, label, { 'font-size': 12, fill: '#1A2E4A' }), T(x, y + 12, on ? 'ON' : 'OFF', { 'font-size': 10, fill: on ? '#058a68' : '#8892a2' })];
      }
      function token(x, y, name, v) { return [s('circle', { cx: x, cy: y, r: 13, fill: v ? '#FFD166' : '#fff', stroke: '#1A2E4A', 'stroke-width': 3 }), T(x, y + 4, String(v), { fill: '#1A2E4A', 'font-size': 13 }), T(x, y - 18, name, { 'font-size': 10 })]; }
      function draw() {
        const c = conduct(), out = c ? 0 : 1; const svg = s('svg', { viewBox: '0 0 340 230' });
        svg.append(L(100, 18, 240, 18, { stroke: '#d33' }), T(60, 22, '+5 V', { fill: '#d33' }), L(170, 18, 170, 30));
        svg.append(s('polyline', Object.assign({ points: '170,30 170,36 160,42 180,52 160,62 180,72 170,78 170,84' }, wire, { 'stroke-width': 4 })), T(210, 56, 'pull-up', { 'font-size': 10 }));
        const path = (d) => s('path', { d, fill: 'none', stroke: c ? HOT : 'transparent', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .8 });
        if (cur === 'NOT') {
          svg.append(path('M170,84 V112 M170,148 V205'), L(170, 84, 170, 112), L(170, 148, 170, 205)); svg.append(...tr(170, 130, !!a, 'Q1'), ...token(100, 130, 'A', a), L(113, 130, 142, 130));
        } else if (cur === 'NOR') {
          svg.append(path('M170,84 H120 V112 M120,148 V196 H170 V205 M170,84 H220 V112 M220,148 V196 H170'), L(120, 84, 220, 84), L(120, 84, 120, 112), L(220, 84, 220, 112), L(120, 148, 120, 196), L(220, 148, 220, 196), L(120, 196, 220, 196), L(170, 196, 170, 205));
          svg.append(...tr(120, 130, !!a, 'Q1'), ...tr(220, 130, !!b, 'Q2'), ...token(60, 130, 'A', a), L(73, 130, 92, 130), ...token(280, 130, 'B', b), L(267, 130, 248, 130));
        } else {
          svg.append(path('M170,84 V104 M170,134 V152 M170,182 V205'), L(170, 84, 170, 104), L(170, 140, 170, 152), L(170, 182, 170, 205));
          svg.append(...tr(170, 122, !!a, 'Q1'), ...tr(170, 168, !!b, 'Q2'), ...token(100, 122, 'A', a), L(113, 122, 142, 122), ...token(100, 168, 'B', b), L(113, 168, 142, 168));
        }
        svg.append(s('circle', { cx: 170, cy: 84, r: 6, fill: '#1A2E4A' }), L(170, 84, 240, 84, { 'stroke-width': 4 }), s('circle', { cx: 290, cy: 84, r: 24, fill: out ? '#FFD23F' : '#e3e7ee', stroke: '#1A2E4A', 'stroke-width': 4 }));
        if (out) svg.append(s('circle', { cx: 290, cy: 84, r: 38, fill: '#FFD23F', opacity: .35 }));
        svg.append(T(290, 126, 'OUT = ' + out + (ctx.lvl >= 2 ? (out ? ' (≈5 V)' : ' (0 V)') : ''), { fill: '#1A2E4A', 'font-size': 13 }));
        svg.append(L(150, 205, 190, 205, { 'stroke-width': 5 }), L(158, 212, 182, 212, { 'stroke-width': 4 }), L(164, 219, 176, 219, { 'stroke-width': 3 }), T(222, 214, 'ground (0 V)', { 'font-size': 10 }));
        holder.innerHTML = ''; holder.append(svg);
        const key = cur === 'NOT' ? '' + a : '' + a + b; seen[cur].add(key);
        // table
        const rows = cur === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
        const t = h('table', { class: 'tbl' }, h('tr', null, (cur === 'NOT' ? ['A', 'OUT'] : ['A', 'B', 'OUT']).map(x => h('th', null, x))),
          rows.map(r => { const k = r.join(''), cc = cur === 'NOT' ? r[0] : cur === 'NOR' ? (r[0] | r[1]) : (r[0] & r[1]); const o = cc ? 0 : 1; const vis = seen[cur].has(k);
            return h('tr', { class: (cur === 'NOT' ? '' + a : '' + a + b) === k ? 'cur' : '' }, r.map(x => h('td', null, x)), h('td', { class: vis ? 'ok' : '' }, vis ? o : '?')); }));
        tbl.innerHTML = ''; tbl.append(t);
        tB.classList.toggle('hide', cur === 'NOT');
        if (seen[cur].size >= need[cur] && !done[cur]) { done[cur] = true; EA.sfx.star(); status.textContent = '⭐ ' + cur + ' gate fully tested!'; status.className = 'feedback good'; drawTabs(); if (types.every(g => done[g])) setTimeout(() => ctx.finish(3, 3, 'You tested NOT, NOR and NAND!'), 900); }
      }
      function drawTabs() { tabs.innerHTML = ''; types.forEach(g => tabs.append(h('button', { class: 'btn' + (g === cur ? '' : ' ghost'), onclick: () => { cur = g; a = b = 0; tA.set(0); tB.set(0); status.textContent = ''; drawTabs(); draw(); } }, (done[g] ? '✅ ' : '') + g))); }
      ctx.root.append(h('div', { class: 'stage center' }, h('div', { class: 'prompt' }, 'Pick a gate. Flip the inputs. Try every row of the table!'), tabs, holder, ctl, tbl, status));
      ctl.append(tA, tB); drawTabs(); draw();
    }
  });

  /* ---- Build-a-gate puzzles ---- */
  EA.lab({
    id: 'buildgate', unit: 4, title: 'Build-a-Gate', emoji: '🧱', blurb: 'Chain NAND and NOR to make new gates',
    run(ctx) {
      const P = {
        AND: { text: 'Build an AND gate', sol: 'NAND then NOT = AND', two: true }, OR: { text: 'Build an OR gate', sol: 'NOR then NOT = OR', two: true },
        NAND: { text: 'Build a NAND gate', sol: 'NAND with a plain wire after it', two: true }, NOR: { text: 'Build a NOR gate', sol: 'NOR with a plain wire after it', two: true },
        NOT: { text: 'Build a NOT gate by wiring BOTH inputs of the first gate to A', sol: 'Tie both inputs together: NAND or NOR then a plain wire gives NOT', two: false }
      };
      const list = ctx.lvl === 1 ? ['AND', 'OR'] : ctx.lvl === 2 ? ['AND', 'OR', 'NAND', 'NOR'] : ['AND', 'OR', 'NAND', 'NOR', 'NOT'];
      const picks = EA.shuffle(list);
      let mistakes = 0;
      EA.rounds(ctx, picks.length, (i) => {
        const g = picks[i], p = P[g]; const st = { g1: 'NAND', g2: 'wire' };
        const b1 = h('button', { class: 'btn navy', style: { minWidth: '92px' } }, 'NAND'), b2 = h('button', { class: 'btn navy', style: { minWidth: '92px' } }, 'plain wire');
        b1.onclick = () => { st.g1 = st.g1 === 'NAND' ? 'NOR' : 'NAND'; b1.textContent = st.g1; EA.sfx.click(); };
        b2.onclick = () => { st.g2 = st.g2 === 'wire' ? 'NOT' : 'wire'; b2.textContent = st.g2 === 'wire' ? 'plain wire' : 'NOT'; EA.sfx.click(); };
        const pill = (t, c) => h('div', { class: 'chip', style: { background: c || '#eef2fb', fontSize: '1rem' } }, t);
        const res = h('div', null);
        const flow = h('div', { class: 'row', style: { justifyContent: 'center', flexWrap: 'wrap' } }, pill('A', '#FFD166'), p.two ? pill('B', '#FFD166') : null, '➜', b1, '➜', b2, '➜', pill('OUT', '#b9f3df'));
        const ev = (a, b) => { const x = st.g1 === 'NAND' ? EA.GATES.NAND(a, b) : EA.GATES.NOR(a, b); return st.g2 === 'NOT' ? (x ? 0 : 1) : x; };
        return {
          prompt: p.text + '. Tap the boxes to change them, then check.', visual: h('div', { class: 'center' }, flow, h('p', { class: 'small muted mt8' }, 'Tap the first box to switch between NAND and NOR. Tap the second to switch between a plain wire and a NOT gate.'), res),
          check() {
            const rows = p.two ? [[0, 0], [0, 1], [1, 0], [1, 1]] : [[0, 0], [1, 1]]; let ok = true; const out = [];
            rows.forEach(([a, b]) => { const got = ev(a, b), want = g === 'NOT' ? (a ? 0 : 1) : EA.GATES[g](a, b); if (got !== want) ok = false; out.push([a, b, got, want]); });
            if (!ok) mistakes++;
            res.innerHTML = ''; res.append(h('table', { class: 'tbl' }, h('tr', null, [p.two ? 'A' : 'A', p.two ? 'B' : null, 'You get', 'Goal'].filter(Boolean).map(x => h('th', null, x))), out.map(r => h('tr', null, h('td', null, r[0]), p.two ? h('td', null, r[1]) : null, h('td', { class: r[2] === r[3] ? 'ok' : 'no' }, r[2]), h('td', null, r[3])))));
            return ok;
          }, why: p.sol + '.'
        };
      }, { onDone: (right, n) => ctx.finish(Math.max(0, n - mistakes), n) });
    }
  });

  /* ---- Rule machine ---- */
  EA.lab({
    id: 'rulemachine', unit: 4, title: 'Rule Machine', emoji: '🔔', blurb: 'Predict what a logic rule will do',
    run(ctx) {
      const RULES = [
        { t: 'The lunch bell rings if there is PASTA and NO broccoli.', v: [['🍝', 'pasta'], ['🥦', 'broccoli']], f: (p, b) => p && !b, l: 1 },
        { t: 'The robot dances if there is MUSIC or a CLAP.', v: [['🎵', 'music'], ['👏', 'clap']], f: (m, c) => m || c, l: 1 },
        { t: 'The alarm sounds if the DOOR is open and there is NO key.', v: [['🚪', 'door open'], ['🔑', 'key']], f: (d, k) => d && !k, l: 1 },
        { t: 'The porch light turns on if it is DARK and someone is HOME.', v: [['🌙', 'dark'], ['🏠', 'home']], f: (d, hm) => d && hm, l: 1 },
        { t: 'The lamp lights if (switch 1 AND switch 2) OR switch 3.', v: [['1️⃣', 'switch 1'], ['2️⃣', 'switch 2'], ['3️⃣', 'switch 3']], f: (a, b, c) => (a && b) || c, l: 2 },
        { t: 'The sprinkler runs if it is NOT raining AND (it is hot OR the soil is dry).', v: [['🌧️', 'raining'], ['🌡️', 'hot'], ['🏜️', 'dry soil']], f: (r, hh, d) => !r && (hh || d), l: 3 }
      ];
      const pool = RULES.filter(r => r.l <= ctx.lvl); const n = ctx.lvl === 1 ? 6 : 8;
      EA.rounds(ctx, n, () => {
        const r = EA.pick(pool); const vals = r.v.map(() => EA.rand(2)); const out = r.f(...vals) ? 1 : 0;
        const vis = h('div', { class: 'center' }, h('div', { class: 'card flat', style: { margin: '0 0 10px', fontWeight: 800 } }, '📜 ' + r.t),
          h('div', { class: 'wrapx', style: { justifyContent: 'center' } }, r.v.map((x, k) => h('div', { class: 'chip', style: { background: vals[k] ? '#b9f3df' : '#ffd0d0', fontSize: '1rem' } }, x[0] + ' ' + x[1] + ': ' + (vals[k] ? 'YES' : 'NO')))));
        return { prompt: 'Will it happen?', visual: vis, choices: ['Yes 🔔', 'No 🤫'], answer: out ? 0 : 1, why: 'Follow the rule step by step: the answer is ' + (out ? 'YES' : 'NO') + '.' };
      });
    }
  });

  /* =============== QUEST 5 =============== */

  /* ---- SR latch lab ---- */
  EA.lab({
    id: 'latchlab', unit: 5, title: 'Latch Lab', emoji: '🧠', blurb: 'Set it, reset it, and watch it remember',
    run(ctx) {
      let S = 0, R = 0, Q = 0, QB = 1, wasBoth = false;
      const tasks = EA.tasks([{ text: 'SET the latch (Q becomes 1)' }, { text: 'Let go: it still remembers 1!' }, { text: 'RESET it (Q becomes 0)' }, { text: 'Try pressing BOTH (and see why it is forbidden)' }]);
      const holder = h('div', { class: 'svgwrap' }), msg = h('div', { class: 'feedback' });
      function logic() {
        if (S && R) { Q = 0; QB = 0; wasBoth = true; }
        else if (S) { Q = 1; QB = 0; wasBoth = false; }
        else if (R) { Q = 0; QB = 1; wasBoth = false; }
        else if (wasBoth) { Q = EA.rand(2); QB = Q ? 0 : 1; wasBoth = false; msg.textContent = '😬 Both were pressed, so when you let go it could land either way. That is why S=R=1 is forbidden!'; msg.className = 'feedback bad'; }
        if (S && !R) { tasks.mark(0); msg.textContent = 'Q is 1.'; msg.className = 'feedback'; }
        if (!S && !R && Q === 1 && started.set) { tasks.mark(1); msg.textContent = '✨ Nobody is pressing anything, and Q is STILL 1. That is memory!'; msg.className = 'feedback good'; }
        if (R && !S) { tasks.mark(2); msg.textContent = 'Q is 0.'; msg.className = 'feedback'; }
        if (S && R) { tasks.mark(3); msg.textContent = 'Both outputs are 0 now. Let go and watch…'; msg.className = 'feedback bad'; }
        if (S && !R) started.set = true;
        draw();
        if (tasks.all() && !logic.done) { logic.done = true; setTimeout(() => ctx.finish(4, 4, 'Two NOR gates listening to each other remember one bit!'), 1200); }
      }
      const started = { set: false };
      function draw() {
        const col = v => v ? HOT : COLD; const svg = s('svg', { viewBox: '0 0 340 200' });
        const gate = (y, label) => [s('rect', { x: 120, y, width: 62, height: 50, rx: 14, fill: '#fff', stroke: '#1A2E4A', 'stroke-width': 4 }), T(151, y + 30, 'NOR', { fill: '#1A2E4A', 'font-size': 14 })];
        svg.append(L(40, 38, 120, 38, { stroke: col(R) }), L(40, 162, 120, 162, { stroke: col(S) }), T(24, 42, 'R', { fill: '#1A2E4A', 'font-size': 15 }), T(24, 166, 'S', { fill: '#1A2E4A', 'font-size': 15 }));
        svg.append(s('polyline', Object.assign({ points: '182,55 225,55 225,112 95,112 95,138 120,138' }, wire, { stroke: col(Q) })), s('polyline', Object.assign({ points: '182,145 255,145 255,88 75,88 75,72 120,72' }, wire, { stroke: col(QB) })));
        svg.append(...gate(30, 'g1'), ...gate(120, 'g2'));
        svg.append(L(182, 55, 300, 55, { stroke: col(Q) }), L(182, 145, 300, 145, { stroke: col(QB) }));
        svg.append(s('circle', { cx: 312, cy: 55, r: 16, fill: Q ? '#3ddc97' : '#2e5a48', stroke: '#1A2E4A', 'stroke-width': 3 }), T(312, 60, String(Q), { fill: '#fff', 'font-size': 14 }), T(312, 34, 'Q', { fill: '#1A2E4A' }),
          s('circle', { cx: 312, cy: 145, r: 16, fill: QB ? '#ff5a5a' : '#7a3a3a', stroke: '#1A2E4A', 'stroke-width': 3 }), T(312, 150, String(QB), { fill: '#fff', 'font-size': 14 }), T(312, 124, 'not Q', { fill: '#1A2E4A', 'font-size': 11 }));
        holder.innerHTML = ''; holder.append(svg);
      }
      const hold = (label, set, color) => {
        const b = h('button', { class: 'btn big ' + color, style: { touchAction: 'none', minWidth: '130px' } }, label);
        const dn = e => { e.preventDefault(); set(1); b.classList.add('held'); EA.sfx.click(); logic(); }, up = () => { set(0); b.classList.remove('held'); logic(); };
        b.addEventListener('pointerdown', dn); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, up));
        b.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!b._k) { b._k = 1; dn(e); } } }); b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { b._k = 0; up(); } });
        return b;
      };
      ctx.root.append(h('div', { class: 'stage center' }, tasks.el, holder, h('div', { class: 'wrapx', style: { justifyContent: 'center' } }, hold('SET', v => { S = v; }, 'mint'), hold('RESET', v => { R = v; }, 'coral')), h('p', { class: 'small muted mt8' }, 'Press and hold, then let go.'), msg));
      draw();
    }
  });

  /* ---- Human latch ---- */
  EA.lab({
    id: 'humanlatch', unit: 5, title: 'Human Latch', emoji: '🃏', blurb: 'Be the memory: what does the card show now?',
    run(ctx) {
      const n = ctx.lvl === 1 ? 5 : ctx.lvl === 2 ? 6 : 8; const seq = [];
      for (let i = 0; i < n; i++) seq.push(i === 0 ? EA.pick(['Set', 'Reset']) : EA.pick(['Set', 'Reset', 'Nothing', 'Nothing']));
      let q = 0; const hist = [];
      EA.rounds(ctx, n, (i) => {
        const cmd = seq[i], prev = q; q = cmd === 'Set' ? 1 : cmd === 'Reset' ? 0 : q; hist.push(cmd);
        const chips = h('div', { class: 'wrapx', style: { justifyContent: 'center' } }, hist.map((c, k) => h('span', { class: 'chip', style: { background: k === hist.length - 1 ? '#FFD166' : '#eef2fb' } }, (k + 1) + '. ' + c)));
        const card = ctx.lvl === 1 ? h('div', { class: 'mt8 small muted' }, 'Before this command the card showed ' + prev + '.') : null;
        return { prompt: 'The partner says “' + cmd + '”. What does the card show now?', visual: h('div', { class: 'center' }, chips, card), choices: ['0', '1'], answer: q,
          why: cmd === 'Set' ? 'Set makes the card 1.' : cmd === 'Reset' ? 'Reset makes the card 0.' : '“Nothing” means HOLD: the card keeps its last value (' + q + '). That is memory!' };
      });
    }
  });

  /* ---- Tripwire alarm ---- */
  EA.lab({
    id: 'tripwire', unit: 5, title: 'Tripwire Alarm', emoji: '🐭', blurb: 'A latch makes the alarm remember',
    run(ctx) {
      let latchOn = false, trig = false, memory = 0;
      const tasks = EA.tasks([{ text: 'No latch: send the mouse. The alarm stops when it leaves' }, { text: 'Turn the latch ON and send the mouse. The alarm KEEPS ringing' }, { text: 'Press RESET to silence it' }]);
      const mouse = h('div', { style: { fontSize: '3rem', position: 'absolute', left: '-60px', bottom: '8px', transition: 'left 1.4s linear' } }, '🐭');
      const wireEl = h('div', { style: { position: 'absolute', left: '48%', top: '10px', bottom: '8px', borderLeft: '4px dashed #FF6B6B' } });
      const room = h('div', { style: { position: 'relative', height: '90px', background: '#f4efe6', borderRadius: '16px', overflow: 'hidden', border: '3px solid #1A2E4A' } }, wireEl, mouse, h('div', { style: { position: 'absolute', right: '10px', top: '8px', fontSize: '2rem' } }, '🧀'));
      const bell = h('div', { style: { fontSize: '4rem' } }, '🔔'), msg = h('div', { class: 'feedback' }), lt = h('button', { class: 'btn ghost' }, 'Latch: OFF');
      let sending = false, seenNoLatch = false, seenLatch = false;
      function alarm() { return latchOn ? !!memory : trig; }
      function upd() {
        const on = alarm(); bell.style.animation = on ? 'shake .3s infinite' : 'none'; bell.style.filter = on ? 'none' : 'grayscale(1) opacity(.5)'; bell.textContent = on ? '🚨' : '🔔';
        if (on) { clearInterval(upd.t); upd.t = setInterval(() => { if (alarm()) EA.sfx.buzz(); else clearInterval(upd.t); }, 420); EA.sfx.buzz(); } else clearInterval(upd.t);
      }
      EA.onLeave(() => clearInterval(upd.t));
      lt.onclick = () => { latchOn = !latchOn; lt.textContent = 'Latch: ' + (latchOn ? 'ON' : 'OFF'); lt.className = 'btn' + (latchOn ? '' : ' ghost'); if (!latchOn) memory = 0; upd(); };
      const send = h('button', { class: 'btn big sun' }, '🐭 Send the mouse');
      send.onclick = () => {
        if (sending) return; sending = true; mouse.style.transition = 'none'; mouse.style.left = '-60px'; void mouse.offsetWidth; mouse.style.transition = 'left 1.4s linear'; mouse.style.left = '100%';
        EA.after(() => { trig = true; if (latchOn) memory = 1; upd(); msg.textContent = latchOn ? 'The mouse tripped the wire: the latch SETS.' : 'The wire is tripped!'; msg.className = 'feedback'; }, 560);
        EA.after(() => { trig = false; upd(); sending = false;
          if (!latchOn) { msg.textContent = '😶 The mouse left, so the alarm stopped. No memory!'; msg.className = 'feedback bad'; seenNoLatch = true; tasks.mark(0); }
          else { msg.textContent = '😱 The mouse is gone but the alarm is STILL ringing. The latch remembers!'; msg.className = 'feedback good'; seenLatch = true; tasks.mark(1); }
        }, 760);
      };
      const reset = h('button', { class: 'btn coral' }, 'RESET'); reset.onclick = () => { memory = 0; upd(); msg.textContent = 'Reset: the latch forgets.'; msg.className = 'feedback'; if (seenLatch) { tasks.mark(2); } if (tasks.all() && !reset.d) { reset.d = true; setTimeout(quiz, 900); } };
      function quiz() {
        EA.rounds(ctx, 2, (i) => i === 0 ? { prompt: 'Why does the alarm keep ringing after the mouse leaves?', choices: ['The latch remembered the trip', 'The mouse is still there', 'The battery is loud'], answer: 0, why: 'The wire SET the latch. It stays set until Reset.' }
          : { prompt: 'What silences a latched alarm?', choices: ['The Reset input', 'Waiting', 'A bigger battery'], answer: 0, why: 'Reset clears the latch back to 0.' });
      }
      const box = h('div', { class: 'stage center' }, tasks.el, room, h('div', { class: 'row mt12', style: { justifyContent: 'center', gap: '24px' } }, bell, h('div', null, lt, h('div', { class: 'mt8' }, reset))), h('div', { class: 'mt12' }, send), msg);
      ctx.root.append(box); upd();
    }
  });

  /* ---- Who pressed first ---- */
  EA.lab({
    id: 'firstbuzz', unit: 5, title: 'Who Pressed First?', emoji: '🔴', blurb: 'A two-player buzzer where the latch locks the other out',
    run(ctx) {
      const total = 5; let round = 0, locked = -1; const score = [0, 0];
      const QS = ['Name an animal that starts with S!', 'Name something red!', 'Say a number bigger than 20!', 'Name a fruit!', 'Name a country!', 'Name a colour of the rainbow!', 'Name a musical instrument!', 'Name something in the kitchen!', 'Name a vegetable!', 'Name a planet!'];
      const prompt = h('div', { class: 'prompt', style: { margin: '0' } }, ''), info = h('div', { class: 'feedback' });
      const mkZone = (i) => {
        const sc = h('div', { class: 'chip' }, 'Score 0'), led = EA.led(false, i ? 'blue' : 'red', true);
        const b = h('button', { class: 'bigbtn', style: { minWidth: '100%', minHeight: '110px', fontSize: '2rem', fontFamily: 'Baloo 2', fontWeight: 800, background: i ? '#8ec5ff' : '#ff9d9d', boxShadow: '0 8px 0 ' + (i ? '#4f8fd8' : '#d65c5c'), touchAction: 'none' } }, 'BUZZ! ' + (i ? '🔵' : '🔴'));
        b.addEventListener('pointerdown', e => { e.preventDefault(); press(i); });
        const el = h('div', { class: 'card', style: { margin: 0, transform: i === 0 ? 'rotate(180deg)' : 'none', textAlign: 'center' } }, h('div', { class: 'row', style: { justifyContent: 'center' } }, led, sc), b);
        return { el, sc, led, b };
      };
      const z = [mkZone(0), mkZone(1)];
      function press(i) {
        if (locked !== -1) { EA.sfx.bad(); return; }
        locked = i; EA.tone(i ? 600 : 800, .25, 'square', .1); EA.setLed(z[i].led, true); z[1 - i].b.disabled = true; score[i]++; z[i].sc.textContent = 'Score ' + score[i];
        info.textContent = 'Player ' + (i + 1) + ' was first! The latch locked the other buzzer.'; info.className = 'feedback good'; nextB.classList.remove('hide');
      }
      const nextB = h('button', { class: 'btn mint hide' }, 'Next round →');
      nextB.onclick = () => {
        if (++round >= total) { ctx.finish(total, total, 'Final score: ' + score[0] + ' to ' + score[1] + '. The latch was the referee!'); return; }
        locked = -1; z.forEach(x => { x.b.disabled = false; EA.setLed(x.led, false); }); nextB.classList.add('hide'); info.textContent = ''; setQ();
      };
      const setQ = () => { prompt.textContent = 'Round ' + (round + 1) + ' of ' + total + ': ' + EA.pick(QS); };
      ctx.root.append(h('div', { class: 'stage' }, z[0].el, h('div', { class: 'center', style: { margin: '10px 0' } }, prompt, info, nextB), z[1].el, h('p', { class: 'small muted center mt8' }, 'Two players, one screen! The first to press locks out the other, just like a latch.')));
      setQ();
    }
  });
})();
