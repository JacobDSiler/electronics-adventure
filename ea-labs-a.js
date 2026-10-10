/* Electronics Adventure - labs for Quests 1-3 (circuits, switch logic, transistor). Also defines shared lab helpers. */
(function () {
  'use strict';
  const EA = window.EA, h = EA.h, s = EA.s;

  /* ---------- shared helpers ---------- */
  EA.lab = def => { EA.labs[def.id] = def; };

  /* Rounds runner: make(i, api) -> { prompt, speak?, visual?, choices?[strings], answer?(index), check?(), why, after?(ok) }.
   * api.answer(ok, why) can be called by custom visuals. Finishes with ctx.finish(right, n) unless opts.onDone. */
  EA.rounds = function (ctx, n, make, opts) {
    opts = opts || {};
    let i = 0, right = 0;
    const box = h('div', { class: 'stage' }); (opts.into || ctx.root).append(box);
    function show() {
      box.innerHTML = '';
      const fb = h('div', { class: 'feedback' });
      const next = h('button', { class: 'btn mint wide mt12 hide' }, i === n - 1 ? 'Finish ✔' : 'Next →');
      const btns = []; let r = null;
      const api = {
        done: false,
        answer(ok, why) {
          if (api.done) return; api.done = true; if (ok) right++;
          fb.textContent = (ok ? '✅ ' : '💡 ') + (why || ''); fb.className = 'feedback ' + (ok ? 'good' : 'bad');
          ok ? EA.sfx.ok() : EA.sfx.bad();
          next.classList.remove('hide'); btns.forEach(b => { b.disabled = true; });
          if (r && r.after) r.after(ok);
          if (!ok) { box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 350); }
        }
      };
      r = make(i, api);
      box.append(h('div', { class: 'progress' }, h('i', { style: { width: (i / n * 100) + '%' } })));
      box.append(h('div', { class: 'prompt' }, r.prompt, ' ', EA.sayBtn(r.speak || r.prompt)));
      if (r.visual) box.append(r.visual);
      if (r.choices) {
        const wrap = h('div', { class: 'choices' });
        r.choices.forEach((c, idx) => {
          const b = h('button', { class: 'choice' }, c);
          b.onclick = () => { if (api.done) return; const ok = idx === r.answer; b.classList.add(ok ? 'good' : 'bad'); if (!ok && btns[r.answer]) btns[r.answer].classList.add('good'); api.answer(ok, r.why); };
          btns.push(b); wrap.append(b);
        });
        box.append(wrap);
      }
      if (r.check) {
        const b = h('button', { class: 'btn wide mt12' }, 'Check ✔');
        b.onclick = () => { if (api.done) return; api.answer(r.check(), r.why); };
        btns.push(b); box.append(b);
      }
      box.append(fb, next);
      next.onclick = () => { if (++i < n) show(); else if (opts.onDone) opts.onDone(right, n); else ctx.finish(right, n); };
    }
    show();
    return box;
  };

  /* checklist of tasks shown above an explorer */
  EA.tasks = function (list) {
    const box = h('div', { class: 'card flat', style: { margin: '0 0 12px', padding: '10px 14px' } });
    const rows = list.map(t => { const r = h('div', { class: 'row', style: { padding: '3px 0' } }, h('span', null, '⬜'), h('span', null, t.text)); box.append(r); return r; });
    const done = list.map(() => false);
    return {
      el: box, mark(i) { if (done[i]) return; done[i] = true; rows[i].firstChild.textContent = '✅'; rows[i].lastChild.style.textDecoration = 'line-through'; rows[i].lastChild.style.opacity = '.6'; EA.sfx.star(); },
      all() { return done.every(Boolean); }, count() { return done.filter(Boolean).length; }
    };
  };

  const wire = { stroke: '#1A2E4A', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
  const L = (x1, y1, x2, y2, extra) => s('line', Object.assign({ x1, y1, x2, y2 }, wire, extra || {}));
  const T = (x, y, str, extra) => s('text', Object.assign({ x, y, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#6b768a', 'font-family': 'Nunito,sans-serif' }, extra || {}), str);

  /* =============== QUEST 1 =============== */

  /* ---- Close the Loop ---- */
  EA.lab({
    id: 'loop', unit: 1, title: 'Close the Loop', emoji: '🔌', blurb: 'Fix broken circuits so the light comes on',
    run(ctx) {
      const A = { gap: true, sw: true, rev: false, res: true, msg: 'A missing wire means the loop is not complete: no loop, no light!' };
      const B = { gap: false, sw: false, rev: false, res: true, msg: 'An open switch breaks the loop. Closing it completes the loop.' };
      const C = { gap: false, sw: true, rev: true, res: true, msg: 'LEDs only work one way round. The long leg (+) must face the battery\'s + side.' };
      const D = { gap: false, sw: true, rev: false, res: false, msg: 'With no resistor the LED gets too much power and burns out. Always use a resistor!' };
      const E = { gap: true, sw: true, rev: true, res: true, msg: 'Two faults at once! Always check the whole loop, part by part.' };
      const F = { gap: false, sw: false, rev: true, res: false, msg: 'Three faults. Checking one part at a time is the way engineers fix things.' };
      const sets = ctx.lvl === 1 ? [A, B, C] : ctx.lvl === 2 ? [A, C, D, E] : [B, D, E, F];
      let ri = 0, st = null, taps = 0, faults = 0, solved = false;
      const root = ctx.root; const prompt = h('div', { class: 'prompt' }); const holder = h('div', { class: 'svgwrap' }); const fb = h('div', { class: 'feedback' });
      const next = h('button', { class: 'btn mint wide mt12 hide' }, 'Next →');
      root.append(h('div', { class: 'stage' }, h('div', { class: 'progress' }, h('i', { id: 'lp', style: { width: '0%' } })), prompt, holder, fb, next));
      const prog = root.querySelector('#lp');
      function begin() {
        st = Object.assign({}, sets[ri]); solved = false; fb.textContent = ''; next.classList.add('hide');
        faults += (st.gap ? 1 : 0) + (!st.sw ? 1 : 0) + (st.rev ? 1 : 0) + (!st.res ? 1 : 0);
        prompt.textContent = 'The light is out! Tap the part that is broken.'; prog.style.width = (ri / sets.length * 100) + '%'; draw();
      }
      function poke(k) {
        if (solved) return; taps++; EA.sfx.click();
        if (k === 'gap') st.gap = !st.gap; if (k === 'sw') st.sw = !st.sw; if (k === 'rev') st.rev = !st.rev; if (k === 'res') st.res = !st.res;
        draw();
      }
      function draw() {
        const lit = !st.gap && st.sw && !st.rev && st.res, pop = !st.gap && st.sw && !st.rev && !st.res;
        const hint = (ctx.lvl === 1) ? (k, bad) => bad ? T(0, 0, '') : null : () => null;
        const svg = s('svg', { viewBox: '0 0 320 200', role: 'img', 'aria-label': 'A circuit with a battery, switch, resistor and LED' });
        // wires
        svg.append(L(40, 80, 40, 40), L(40, 40, 90, 40), L(140, 40, 170, 40), L(230, 40, 270, 40), L(270, 40, 270, 72), L(270, 100, 270, 160), L(270, 160, 180, 160), L(120, 160, 40, 160), L(40, 160, 40, 118));
        // gap
        if (st.gap) { svg.append(s('rect', { x: 120, y: 144, width: 60, height: 32, rx: 8, fill: 'none', stroke: '#FF6B6B', 'stroke-width': 3, 'stroke-dasharray': '6 5' }), T(150, 192, ctx.lvl === 1 ? 'tap to add wire' : '', { fill: '#FF6B6B' })); }
        else svg.append(L(120, 160, 180, 160));
        // battery
        svg.append(L(22, 88, 58, 88, { 'stroke-width': 5 }), L(30, 108, 50, 108, { 'stroke-width': 9 }), L(40, 80, 40, 88), L(40, 108, 40, 118), T(72, 86, '+', { 'font-size': 18, fill: '#d33' }), T(72, 118, '−', { 'font-size': 20 }), T(40, 192, 'battery', { 'font-size': 11 }));
        // switch
        if (st.sw) svg.append(L(90, 40, 140, 40)); else svg.append(L(90, 40, 132, 14));
        svg.append(s('circle', { cx: 90, cy: 40, r: 5, fill: '#1A2E4A' }), s('circle', { cx: 140, cy: 40, r: 5, fill: '#1A2E4A' }), T(115, 64, 'switch', { 'font-size': 11 }));
        // resistor
        if (st.res) svg.append(s('polyline', Object.assign({ points: '170,40 178,40 184,24 196,56 208,24 220,56 226,40 230,40' }, wire)));
        else svg.append(L(170, 40, 230, 40), s('rect', { x: 166, y: 22, width: 68, height: 36, rx: 8, fill: 'none', stroke: '#FF6B6B', 'stroke-width': 3, 'stroke-dasharray': '6 5' }));
        svg.append(T(200, 76, st.res ? 'resistor' : (ctx.lvl === 1 ? 'tap to add!' : ''), { 'font-size': 11, fill: st.res ? '#6b768a' : '#FF6B6B' }));
        // LED
        const g = s('g', { transform: st.rev ? 'rotate(180 270 86)' : '' });
        g.append(s('polygon', { points: '256,72 284,72 270,98', fill: lit ? '#FFD23F' : (pop ? '#ff4040' : '#c9ced8'), stroke: '#1A2E4A', 'stroke-width': 4, 'stroke-linejoin': 'round' }), L(254, 100, 286, 100));
        if (lit) svg.append(s('circle', { cx: 270, cy: 88, r: 30, fill: '#FFD23F', opacity: .45 }));
        if (pop) svg.append(s('circle', { cx: 270, cy: 88, r: 34, fill: '#ff4040', opacity: .5 }), T(270, 30, '💥', { 'font-size': 22 }));
        svg.append(g, T(270, 192, 'LED', { 'font-size': 11 }));
        if (st.rev && ctx.lvl === 1) svg.append(T(222, 100, 'wrong way!', { fill: '#FF6B6B', 'font-size': 11 }));
        // dots
        if (lit) for (let k = 0; k < 6; k++) svg.append(s('circle', { r: 5, fill: '#2D6BE4' }, s('animateMotion', { dur: '2.4s', repeatCount: 'indefinite', begin: (-k * .4) + 's', path: 'M40,80 V40 H270 V160 H40 V118' })));
        // hit areas
        const hit = (x, y, w, hh, k, label) => s('rect', { x, y, width: w, height: hh, fill: 'transparent', style: 'cursor:pointer', onclick: () => poke(k), 'aria-label': label });
        svg.append(hit(116, 140, 68, 40, 'gap', 'wire gap'), hit(84, 6, 62, 62, 'sw', 'switch'), hit(160, 14, 80, 50, 'res', 'resistor'), hit(240, 64, 60, 48, 'rev', 'LED'));
        holder.innerHTML = ''; holder.append(svg);
        if (pop) { fb.textContent = '💥 Pop! ' + NORES.msg; fb.className = 'feedback bad'; if (!pop._p) { EA.sfx.bad(); } }
        else if (!lit) { fb.textContent = ''; }
        if (lit && !solved) { solved = true; EA.sfx.ok(); prompt.textContent = '💡 It\'s alive!'; fb.textContent = '✅ ' + sets[ri].msg; fb.className = 'feedback good'; next.textContent = ri === sets.length - 1 ? 'Finish ✔' : 'Next →'; next.classList.remove('hide'); }
      }
      const NORES = { msg: 'The LED got too much power! Tap the resistor slot to add a resistor.' };
      next.onclick = () => { if (++ri < sets.length) begin(); else ctx.finish(Math.min(faults, taps) || 1, Math.max(taps, faults) || 1, 'You fixed every circuit!'); };
      begin();
    }
  });

  /* ---- Conductor or insulator ---- */
  EA.lab({
    id: 'conduct', unit: 1, title: 'Conductor or Insulator?', emoji: '🧲', blurb: 'Predict, then test with the circuit tester',
    run(ctx) {
      const ITEMS = [['🪙', 'a coin', 1], ['📎', 'a paper clip', 1], ['🥄', 'a metal spoon', 1], ['🔑', 'a key', 1], ['🔩', 'a metal bolt', 1], ['🍴', 'a fork', 1], ['🥫', 'a tin can', 1], ['✏️', 'pencil lead (graphite)', 1],
        ['🪵', 'a wooden stick', 0], ['🧸', 'a plastic toy', 0], ['🎈', 'a balloon (rubber)', 0], ['🧦', 'a sock', 0], ['📄', 'paper', 0], ['🥛', 'a glass cup', 0], ['🧶', 'wool yarn', 0], ['🪨', 'a dry rock', 0]];
      const n = ctx.lvl === 1 ? 6 : ctx.lvl === 2 ? 8 : 10;
      const picks = EA.shuffle(ITEMS).slice(0, n);
      EA.rounds(ctx, n, (i, api) => {
        const [em, name, cond] = picks[i];
        const led = EA.led(false, 'yellow', true);
        const tester = h('div', { class: 'center', style: { margin: '6px 0' } },
          h('div', { style: { fontSize: '4.5rem', lineHeight: 1.1 } }, em), h('div', { class: 'muted', style: { fontWeight: 800 } }, name),
          h('div', { class: 'mt8' }, '🔋 ─ ', led, ' ─ ', h('span', null, '🔌 tester'))
        );
        return {
          prompt: 'Will ' + name + ' let electricity through?', visual: tester, choices: ['Conductor ⚡', 'Insulator 🧱'], answer: cond ? 0 : 1,
          why: cond ? (name.includes('graphite') ? 'Surprise! Graphite in pencil lead conducts electricity.' : 'It is metal, and metals are conductors, so the light came on!') : 'Not a conductor. It is an insulator, so the light stayed off.',
          after() { EA.setLed(led, !!cond); }
        };
      });
    }
  });

  /* ---- Solar sun ---- */
  EA.lab({
    id: 'solar', unit: 1, title: 'Solar Sun', emoji: '☀️', blurb: 'Light makes electricity. How much?',
    run(ctx) {
      const tasks = EA.tasks([{ text: 'Make the fan spin FAST' }, { text: 'Make the fan stop without touching it' }, { text: 'Make the LED glow while the fan spins slowly' }]);
      let sun = 60, cloud = false;
      const sunEl = h('div', { style: { fontSize: '4rem', transition: 'transform .2s' } }, '☀️'), cloudEl = h('div', { style: { fontSize: '4rem', marginLeft: '-30px', opacity: 0, transition: 'opacity .2s' } }, '☁️');
      const fan = h('div', { style: { fontSize: '4.2rem', display: 'inline-block' } }, '🌀'), led = EA.led(false, 'yellow', true);
      const meter = h('div', { class: 'chip mono' }, ''), bar = h('div', { class: 'bar' }, h('i', { style: { width: '0%', background: '#F29B38' } }));
      const slider = h('input', { type: 'range', min: 0, max: 100, value: sun, 'aria-label': 'Sun brightness' });
      const cb = h('button', { class: 'btn ghost', onclick: () => { cloud = !cloud; cb.textContent = cloud ? '☁️ Remove cloud' : '☁️ Add a cloud'; update(); } }, '☁️ Add a cloud');
      function update() {
        sun = Number(slider.value); const light = sun * (cloud ? .2 : 1); const V = 5.2 * Math.pow(light / 100, .8);
        sunEl.style.transform = 'scale(' + (.6 + sun / 100 * .9) + ')'; sunEl.style.opacity = .3 + sun / 140; cloudEl.style.opacity = cloud ? 1 : 0;
        const spin = V >= .7; fan.style.animation = spin ? 'spin ' + EA.clamp(2.2 - V * .4, .22, 2) + 's linear infinite' : 'none';
        EA.setLed(led, V >= 1.8);
        bar.firstChild.style.width = (V / 5.2 * 100) + '%'; meter.textContent = ctx.lvl >= 2 ? 'Solar panel makes ≈ ' + V.toFixed(1) + ' V' : (V < .7 ? 'Almost no power' : V < 2.5 ? 'A little power' : 'Lots of power!');
        if (V >= 4) tasks.mark(0); if (V < .7) tasks.mark(1); if (V >= 1.8 && V <= 2.8) tasks.mark(2);
        if (tasks.all() && !update.done) { update.done = true; setTimeout(() => ctx.finish(3, 3, 'Solar panels turn light into electricity: more light, more power!'), 700); }
      }
      slider.oninput = update;
      ctx.root.append(h('div', { class: 'stage center' }, tasks.el,
        h('div', { class: 'row', style: { justifyContent: 'center' } }, sunEl, cloudEl),
        h('div', { style: { width: '120px', height: '46px', margin: '6px auto', borderRadius: '8px', border: '3px solid #1A2E4A', background: 'repeating-linear-gradient(90deg,#2D6BE4 0 28px,#1A2E4A 28px 30px)' }, 'aria-label': 'solar panel' }), h('div', { class: 'row mt8', style: { justifyContent: 'center', gap: '24px' } }, fan, led),
        h('div', { class: 'mt8' }, meter), bar, h('label', { class: 'lbl' }, 'Sun brightness'), slider, h('div', { class: 'mt8' }, cb)));
      update();
    }
  });

  /* ---- Series or side by side ---- */
  EA.lab({
    id: 'series', unit: 1, title: 'In a Row or Side by Side?', emoji: '💡💡', blurb: 'What happens when one bulb breaks?',
    run(ctx) {
      let mode = 'series', a = true, b = true; const seen = { series: false, parallel: false };
      const tasks = EA.tasks([{ text: 'In a row: unscrew a bulb' }, { text: 'Side by side: unscrew a bulb' }]);
      const holder = h('div', { class: 'svgwrap' }), info = h('div', { class: 'feedback' });
      const modeBtn = (m, label) => h('button', { class: 'btn' + (mode === m ? '' : ' ghost'), onclick: () => { mode = m; a = b = true; draw(); } }, label);
      const modes = h('div', { class: 'wrapx', style: { justifyContent: 'center' } });
      function bulb(svg, x, y, present, on, dim) {
        const g = s('g', { style: 'cursor:pointer', onclick: () => { if (present) { if (x === 130 || x === 220) { } } } });
        svg.append(s('circle', { cx: x, cy: y, r: 22, fill: present ? (on ? '#FFD23F' : '#e3e7ee') : 'none', stroke: '#1A2E4A', 'stroke-width': 4, 'stroke-dasharray': present ? '' : '5 5', opacity: on && dim ? .75 : 1 }));
        if (on) svg.append(s('circle', { cx: x, cy: y, r: dim ? 32 : 40, fill: '#FFD23F', opacity: dim ? .2 : .35 }));
        if (present) svg.append(L(x - 12, y - 12, x + 12, y + 12, { 'stroke-width': 3 }), L(x - 12, y + 12, x + 12, y - 12, { 'stroke-width': 3 }));
        svg.append(T(x, y + 44, present ? 'tap to unscrew' : 'tap to put back', { 'font-size': 10 }));
      }
      function draw() {
        modes.innerHTML = ''; modes.append(modeBtn('series', 'In a row (series)'), modeBtn('parallel', 'Side by side (parallel)'));
        const svg = s('svg', { viewBox: '0 0 340 210' });
        const hitA = (x, y, k) => s('rect', { x: x - 30, y: y - 30, width: 60, height: 60, fill: 'transparent', style: 'cursor:pointer', onclick: () => { if (k === 'a') a = !a; else b = !b; EA.sfx.click(); note(); draw(); } });
        if (mode === 'series') {
          const on = a && b;
          svg.append(L(40, 90, 40, 40), L(40, 40, 300, 40), L(300, 40, 300, 160), L(300, 160, 40, 160), L(40, 160, 40, 118));
          svg.append(L(22, 90, 58, 90), L(30, 110, 50, 110, { 'stroke-width': 9 }), T(40, 190, 'battery', { 'font-size': 11 }));
          svg.append(s('rect', { x: 100, y: 28, width: 140, height: 24, fill: '#fdf6ee' }));
          bulb(svg, 130, 40, a, on, true); bulb(svg, 215, 40, b, on, true);
          svg.append(hitA(130, 40, 'a'), hitA(215, 40, 'b'));
          if (on) for (let k = 0; k < 5; k++) svg.append(s('circle', { r: 4, fill: '#2D6BE4' }, s('animateMotion', { dur: '3s', repeatCount: 'indefinite', begin: (-k * .6) + 's', path: 'M40,90 V40 H300 V160 H40 V118' })));
        } else {
          svg.append(L(40, 90, 40, 40), L(40, 40, 300, 40), L(300, 40, 300, 160), L(300, 160, 40, 160), L(40, 160, 40, 118));
          svg.append(L(22, 90, 58, 90), L(30, 110, 50, 110, { 'stroke-width': 9 }), T(40, 190, 'battery', { 'font-size': 11 }));
          svg.append(L(130, 40, 130, 160), L(220, 40, 220, 160));
          svg.append(s('rect', { x: 100, y: 78, width: 150, height: 44, fill: '#fdf6ee' }));
          bulb(svg, 130, 100, a, a, false); bulb(svg, 220, 100, b, b, false);
          svg.append(hitA(130, 100, 'a'), hitA(220, 100, 'b'));
          [[a, 130], [b, 220]].forEach(([p, x]) => { if (p) for (let k = 0; k < 3; k++) svg.append(s('circle', { r: 4, fill: '#2D6BE4' }, s('animateMotion', { dur: '1.8s', repeatCount: 'indefinite', begin: (-k * .6) + 's', path: 'M' + x + ',40 V160' }))); });
        }
        holder.innerHTML = ''; holder.append(svg);
      }
      function note() {
        if (a && b) { info.textContent = ''; return; }
        if (mode === 'series') { info.textContent = 'In a row, there is only ONE path, so both lights go out!'; seen.series = true; tasks.mark(0); }
        else { info.textContent = 'Side by side, each light has its own path. The other one stays on!'; seen.parallel = true; tasks.mark(1); }
        info.className = 'feedback good';
        if (tasks.all() && !note.done) { note.done = true; setTimeout(startQuiz, 1200); }
      }
      function startQuiz() {
        box.remove();
        EA.rounds(ctx, 2, (i) => i === 0
          ? { prompt: 'Lights in a row (series). You unscrew one bulb. What happens to the other?', choices: ['It goes out too', 'It stays on', 'It gets brighter'], answer: 0, why: 'One path: break it anywhere and everything stops.' }
          : { prompt: 'Which is better for the lights in a house?', choices: ['In a row (series)', 'Side by side (parallel)', 'It makes no difference'], answer: 1, why: 'Each light has its own path, so one broken bulb does not turn everything off.' });
      }
      const box = h('div', { class: 'stage center' }, tasks.el, modes, holder, info);
      ctx.root.append(box); draw();
    }
  });

  /* =============== QUEST 2 =============== */

  /* ---- Be the Gate ---- */
  EA.lab({
    id: 'humangate', unit: 2, title: 'Be the Gate!', emoji: '🚪', blurb: 'You are the logic gate. Does the door open?',
    run(ctx) {
      const gates = ctx.lvl === 1 ? ['AND', 'OR'] : ctx.lvl === 2 ? ['AND', 'OR', 'NOT', 'NAND'] : ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];
      const rule = { AND: 'Opens only if BOTH are ✋', OR: 'Opens if EITHER (or both) is ✋', NOT: 'Opens if the input is ✊ (does the OPPOSITE)', NAND: 'Opens unless BOTH are ✋', NOR: 'Opens only if BOTH are ✊', XOR: 'Opens if exactly ONE is ✋' };
      const n = ctx.lvl === 1 ? 6 : 8;
      EA.rounds(ctx, n, (i) => {
        const g = EA.pick(gates), a = EA.rand(2), b = EA.rand(2);
        const out = EA.GATES[g](a, b);
        const card = v => h('div', { style: { fontSize: '3.4rem', background: v ? '#b9f3df' : '#ffd0d0', borderRadius: '18px', padding: '8px 14px', border: '3px solid #1A2E4A' } }, v ? '✋' : '✊');
        const vis = h('div', { class: 'center' },
          h('div', { class: 'chip', style: { fontSize: '1.2rem', background: '#1A2E4A', color: '#fff' } }, g + ' gate'),
          h('div', { class: 'small muted mt8' }, ctx.lvl > 1 || true ? rule[g] : ''),
          h('div', { class: 'row mt12', style: { justifyContent: 'center' } }, card(a), g === 'NOT' ? null : card(b), h('span', { style: { fontSize: '2.4rem' } }, '➜ 🚪')));
        return { prompt: 'Does the door open?', visual: vis, choices: ['Opens ✅', 'Stays shut 🚫'], answer: out ? 0 : 1, why: g + ' with ' + (g === 'NOT' ? a : a + ' and ' + b) + ' gives ' + out + '.' };
      });
    }
  });

  /* ---- Switch gates ---- */
  EA.lab({
    id: 'switchgates', unit: 2, title: 'Switch Gates', emoji: '🔘', blurb: 'Build AND and OR with real switches',
    run(ctx) {
      function circuit(state) {
        const holder = h('div', { class: 'svgwrap' });
        function draw() {
          const A = state.A, B = state.B, ser = state.mode === 'series';
          const lamp = ser ? (A && B) : (A || B);
          const svg = s('svg', { viewBox: '0 0 340 190' });
          svg.append(L(40, 90, 40, 40), L(40, 160, 40, 118), L(22, 90, 58, 90), L(30, 110, 50, 110, { 'stroke-width': 9 }), T(40, 182, 'battery', { 'font-size': 11 }));
          const sw = (x, y, on) => { svg.append(s('circle', { cx: x, cy: y, r: 5, fill: '#1A2E4A' }), s('circle', { cx: x + 50, cy: y, r: 5, fill: '#1A2E4A' })); svg.append(on ? L(x, y, x + 50, y) : L(x, y, x + 44, y - 24)); };
          if (ser) {
            svg.append(L(40, 40, 90, 40), L(140, 40, 170, 40), L(220, 40, 262, 40), L(262, 40, 262, 70), L(262, 120, 262, 160), L(262, 160, 40, 160));
            sw(90, 40, A); sw(170, 40, B); svg.append(T(115, 70, 'A', { 'font-size': 14 }), T(195, 70, 'B', { 'font-size': 14 }));
          } else {
            svg.append(L(40, 40, 60, 40), L(60, 40, 60, 100), L(60, 40, 90, 40), L(140, 40, 200, 40), L(60, 100, 90, 100), L(140, 100, 200, 100), L(200, 40, 200, 100), L(200, 70, 262, 70), L(262, 120, 262, 160), L(262, 160, 40, 160));
            sw(90, 40, A); sw(90, 100, B); svg.append(T(115, 22, 'A', { 'font-size': 14 }), T(115, 128, 'B', { 'font-size': 14 }));
          }
          svg.append(s('circle', { cx: 262, cy: 95, r: 26, fill: lamp ? '#FFD23F' : '#e3e7ee', stroke: '#1A2E4A', 'stroke-width': 4 }), L(250, 83, 274, 107, { 'stroke-width': 3 }), L(250, 107, 274, 83, { 'stroke-width': 3 }));
          if (lamp) svg.append(s('circle', { cx: 262, cy: 95, r: 42, fill: '#FFD23F', opacity: .35 }));
          holder.innerHTML = ''; holder.append(svg);
        }
        draw(); holder.draw = draw; return holder;
      }
      function makeRound(i, api) {
        if (i === 2) return { prompt: 'Make a lamp that lights when button A is NOT pressed. Can you do it with plain switches?', choices: ['Yes, in a row', 'Yes, side by side', 'No! I need something new'], answer: 2, why: 'A plain switch can only let electricity through, it cannot flip the answer. We need a transistor for NOT!' };
        const goal = i === 0 ? 'AND' : 'OR';
        const state = { mode: 'series', A: 0, B: 0 };
        const circ = circuit(state);
        const mk = (label, key) => EA.toggle(label, 0, v => { state[key] = v; circ.draw(); });
        const mb = (m, label) => { const b = h('button', { class: 'btn ghost', onclick: () => { state.mode = m; [s1, s2].forEach(x => x.classList.add('ghost')); (m === 'series' ? s1 : s2).classList.remove('ghost'); circ.draw(); } }, label); return b; };
        const s1 = mb('series', 'In a row'), s2 = mb('parallel', 'Side by side'); s1.classList.remove('ghost');
        const table = h('div', null);
        const vis = h('div', { class: 'center' }, h('div', { class: 'wrapx', style: { justifyContent: 'center' } }, s1, s2), circ, h('div', { class: 'row', style: { justifyContent: 'center' } }, mk('Button A', 'A'), mk('Button B', 'B')), table);
        return {
          prompt: goal === 'AND' ? 'Build a gate: the lamp lights ONLY when BOTH buttons are pressed.' : 'Build a gate: the lamp lights when EITHER button is pressed.', visual: vis,
          check() {
            let ok = true; const rows = []; for (const a of [0, 1]) for (const b of [0, 1]) { const got = state.mode === 'series' ? (a & b) : (a | b), want = EA.GATES[goal](a, b); rows.push([a, b, got, want]); if (got !== want) ok = false; }
            table.innerHTML = ''; table.append(h('table', { class: 'tbl' }, h('tr', null, ['A', 'B', 'Your lamp', 'Goal'].map(x => h('th', null, x))), rows.map(r => h('tr', null, h('td', null, r[0]), h('td', null, r[1]), h('td', { class: r[2] === r[3] ? 'ok' : 'no' }, r[2]), h('td', null, r[3])))));
            return ok;
          },
          why: goal === 'AND' ? 'Buttons in a row make AND: both must be on for electricity to get through.' : 'Buttons side by side make OR: either path works.'
        };
      }
      EA.rounds(ctx, 3, makeRound);
    }
  });

  /* ---- Binary lights ---- */
  EA.lab({
    id: 'binary', unit: 2, title: 'Binary Lights', emoji: '🔢', blurb: 'Count with lights that are on or off',
    run(ctx) {
      const bits = ctx.lvl === 1 ? 3 : 4, max = (1 << bits) - 1, n = ctx.lvl === 1 ? 5 : 6;
      const vals = Array.from({ length: bits }, (_, k) => 1 << (bits - 1 - k));
      EA.rounds(ctx, n, (i) => {
        if (i % 2 === 0) {
          const target = 1 + EA.rand(max); const state = Array(bits).fill(0);
          const out = h('div', { class: 'chip mono', style: { fontSize: '1.2rem' } }, 'Your number: 0');
          const tg = vals.map((v, k) => EA.toggle(String(v), 0, x => { state[k] = x; out.textContent = 'Your number: ' + vals.reduce((t, vv, kk) => t + vv * state[kk], 0); }));
          return { prompt: 'Make the number ' + target + ' with the lights!', visual: h('div', { class: 'center' }, h('div', { class: 'row', style: { justifyContent: 'center' } }, tg), h('div', { class: 'mt12' }, out), h('div', { class: 'small muted mt8' }, 'Each light is worth the number under it.')),
            check: () => vals.reduce((t, v, k) => t + v * state[k], 0) === target, why: 'Add up the values of the lights that are ON: ' + vals.filter((v, k) => ((target & v) !== 0)).join(' + ') + ' = ' + target + '.' };
        }
        const num = 1 + EA.rand(max); const pat = vals.map(v => (num & v) ? 1 : 0);
        const opts = new Set([num]); while (opts.size < 4) opts.add(1 + EA.rand(max)); const list = EA.shuffle([...opts]);
        const lights = h('div', { class: 'row', style: { justifyContent: 'center' } }, pat.map((p, k) => h('div', { class: 'center' }, EA.led(!!p, 'yellow', true), h('div', { class: 'mono small' }, vals[k]))));
        return { prompt: 'What number do the lights show?', visual: lights, choices: list.map(String), answer: list.indexOf(num), why: pat.map((p, k) => p ? vals[k] : null).filter(Boolean).join(' + ') + ' = ' + num + '.' };
      });
    }
  });

  /* =============== QUEST 3 =============== */

  /* ---- Pinout detective ---- */
  EA.lab({
    id: 'pinout', unit: 3, title: 'Pinout Detective', emoji: '🔍', blurb: 'Which leg is which? It depends on the type!',
    run(ctx) {
      const TYPES = { BC547: ['Collector', 'Base', 'Emitter'], '2N3904': ['Emitter', 'Base', 'Collector'] };
      const all = [['BC547', 'Collector'], ['BC547', 'Emitter'], ['2N3904', 'Collector'], ['2N3904', 'Emitter'], ['BC547', 'Base'], ['2N3904', 'Base']];
      const picks = EA.shuffle(all).slice(0, ctx.lvl === 1 ? 4 : 6);
      EA.rounds(ctx, picks.length, (i) => {
        const [type, want] = picks[i]; const order = TYPES[type];
        const svg = s('svg', { viewBox: '0 0 240 170', style: 'max-width:300px;margin:0 auto' });
        svg.append(s('path', { d: 'M60 90 V60 A60 60 0 0 1 180 60 V90 Z', fill: '#2b3a55', stroke: '#1A2E4A', 'stroke-width': 4 }), T(120, 62, type, { fill: '#fff', 'font-size': 15 }), T(120, 80, 'flat face toward you', { fill: '#9fb2d1', 'font-size': 9 }));
        const lbls = [];
        [80, 120, 160].forEach((x, k) => { svg.append(L(x, 90, x, 140, { stroke: '#9aa3b2', 'stroke-width': 6 })); const t = T(x, 160, order[k][0], { fill: '#2D6BE4', 'font-size': 18, opacity: 0 }); lbls.push(t); svg.append(t, T(x, 120, ['L', 'M', 'R'][k], { fill: '#fff', 'font-size': 10, opacity: 0 })); });
        return { prompt: 'This is a ' + type + '. Which leg is the ' + want.toUpperCase() + '?', visual: h('div', { class: 'svgwrap' }, svg), choices: ['Left leg', 'Middle leg', 'Right leg'], answer: order.indexOf(want),
          why: type + ' reads ' + order.join(' – ') + ' (left to right, flat face toward you). Always check the datasheet!', after() { lbls.forEach(t => t.setAttribute('opacity', 1)); } };
      });
    }
  });

  /* ---- Transistor tap ---- */
  EA.lab({
    id: 'tap', unit: 3, title: 'The Transistor Tap', emoji: '🚰', blurb: 'A tiny signal controls a big flow',
    run(ctx) {
      const tasks = EA.tasks([{ text: 'Press and hold the button 3 times' }, { text: 'Slide to a TINY signal (under 30 µA) and see the LED glimmer' }, { text: 'Slide to a bigger signal (over 150 µA) and see it shine' }]);
      let presses = 0, sig = 0, held = false;
      const holder = h('div', { class: 'svgwrap' }); const readout = h('div', { class: 'chip mono', style: { fontSize: '.95rem' } }, '');
      const slider = h('input', { type: 'range', min: 0, max: 400, step: 5, value: 0, 'aria-label': 'Signal into the base' });
      const btn = h('button', { class: 'bigbtn', style: { minWidth: '110px', minHeight: '110px', fontSize: '2rem', touchAction: 'none' } }, '👆');
      const down = e => { e.preventDefault(); if (!held) { held = true; presses++; btn.classList.add('held'); if (presses >= 3) tasks.mark(0); } draw(); }, up = () => { held = false; btn.classList.remove('held'); draw(); };
      btn.addEventListener('pointerdown', down); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, up));
      slider.oninput = () => { sig = Number(slider.value); draw(); };
      function draw() {
        const ib = held ? 380 : sig, ic = Math.min(15, ib * .1), open = ic > .2;
        const svg = s('svg', { viewBox: '0 0 340 200' });
        svg.append(L(30, 60, 140, 60, { stroke: '#2D6BE4', 'stroke-width': 18 }), L(200, 60, 270, 60, { stroke: '#2D6BE4', 'stroke-width': 18 }));
        svg.append(s('rect', { x: 134, y: 36, width: 72, height: 48, rx: 10, fill: open ? '#b9f3df' : '#e3e7ee', stroke: '#1A2E4A', 'stroke-width': 4 }), T(170, 66, 'transistor', { 'font-size': 11, fill: '#1A2E4A' }));
        svg.append(L(170, 84, 170, 150, { stroke: '#F29B38', 'stroke-width': 6 }), T(170, 168, 'tiny signal in the BASE', { 'font-size': 11 }), T(70, 40, 'big flow', { 'font-size': 11 }), T(70, 90, '🔋', { 'font-size': 22 }));
        if (open) svg.append(L(30, 60, 270, 60, { stroke: '#fff', 'stroke-width': 4, 'stroke-dasharray': '10 14', class: 'flow' }));
        if (ib > 0) svg.append(L(170, 150, 170, 84, { stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '4 10', class: 'flow' }));
        const bright = ic / 15;
        svg.append(s('circle', { cx: 300, cy: 60, r: 26, fill: '#FFD23F', opacity: .15 + bright * .85, stroke: '#1A2E4A', 'stroke-width': 4 }));
        if (bright > .05) svg.append(s('circle', { cx: 300, cy: 60, r: 26 + bright * 14, fill: '#FFD23F', opacity: bright * .4 }));
        holder.innerHTML = ''; holder.append(svg);
        readout.textContent = 'Base: ' + ib + ' µA  →  LED: ' + ic.toFixed(1) + ' mA' + (ib > 0 ? '  (' + Math.round(ic * 1000 / ib) + '× bigger!)' : '');
        if (!held) { if (sig > 0 && sig <= 30 && ic > .05) tasks.mark(1); if (sig >= 150) tasks.mark(2); }
        if (tasks.all() && !draw.done) { draw.done = true; setTimeout(quiz, 900); }
      }
      function quiz() {
        box.remove();
        EA.rounds(ctx, 3, i => [
          { prompt: 'The signal going into the base is…', choices: ['tiny', 'huge'], answer: 0, why: 'Just a trickle of current controls the big flow.' },
          { prompt: 'A transistor is like a tap turned by…', choices: ['a trickle of water', 'a firehose'], answer: 0, why: 'Small flow in, big flow out.' },
          { prompt: 'What do we call this: a tiny signal making a bigger one?', choices: ['Amplifying', 'Freezing', 'Painting'], answer: 0, why: 'Amplify means make bigger.' }][i]);
      }
      const box = h('div', { class: 'stage center' }, tasks.el, holder, h('div', { class: 'row', style: { justifyContent: 'center' } }, btn, h('div', { style: { flex: 1, maxWidth: '240px' } }, h('div', { class: 'small muted' }, 'Or slide the signal:'), slider)), h('div', { class: 'mt8' }, readout));
      ctx.root.append(box); draw();
    }
  });

  /* ---- Night light designer ---- */
  EA.lab({
    id: 'nightlight', unit: 3, title: 'Night Light Designer', emoji: '🌙', blurb: 'A light sensor and a transistor make an automatic lamp',
    run(ctx) {
      let bright = 80, pos = 'A', rfix = 10; // A: LDR to - side ; B: LDR to + side
      const tasks = EA.tasks([{ text: 'Make the lamp turn ON when it gets dark' }, { text: 'Make the lamp turn OFF in bright light' }, { text: 'Swap the parts so the lamp turns ON in bright light' }, { text: 'Tune the fixed resistor (100k) so it switches near the middle of the slider' }]);
      const slider = h('input', { type: 'range', min: 0, max: 100, value: bright, 'aria-label': 'How bright it is' });
      const sky = h('div', { style: { fontSize: '3.4rem', textAlign: 'center', transition: 'all .2s' } }); const lamp = h('div', { class: 'bulb', style: { fontSize: '4.5rem', textAlign: 'center' } }, '💡'); const meter = h('div', { class: 'chip mono', style: { fontSize: '.85rem', textAlign: 'left' } });
      const posB = h('button', { class: 'btn ghost' }, ''), resSel = h('select', { class: 'inp', style: { width: 'auto' } }, [10, 47, 100].map(v => h('option', { value: v }, v + ' kΩ')));
      posB.onclick = () => { pos = pos === 'A' ? 'B' : 'A'; update(); }; resSel.onchange = () => { rfix = Number(resSel.value); update(); };
      function vbase(b, p, rf) {
        const rl = Math.pow(10, 6 - 3.5 * b / 100), rfx = rf * 1000; // LDR ohms
        return p === 'A' ? 4.5 * rl / (rl + rfx) : 4.5 * rfx / (rfx + rl);
      }
      function update() {
        bright = Number(slider.value); const rl = Math.pow(10, 6 - 3.5 * bright / 100), vb = vbase(bright, pos, rfix), on = vb > .7;
        sky.textContent = bright < 20 ? '🌙' : bright < 50 ? '🌤️' : bright < 80 ? '⛅' : '☀️'; sky.style.background = 'linear-gradient(180deg,' + (bright < 30 ? '#1b2a49' : bright < 60 ? '#6a9fd8' : '#9fd5ff') + ',#fff)'; sky.style.borderRadius = '16px'; sky.style.padding = '10px';
        lamp.classList.toggle('on', on);
        posB.textContent = pos === 'A' ? '🔁 Light sensor is on the − side' : '🔁 Light sensor is on the + side';
        meter.innerHTML = 'Sensor: ' + (rl >= 1000 ? (rl / 1000).toFixed(rl > 99000 ? 0 : 1) + ' kΩ' : Math.round(rl) + ' Ω') + '<br>Base voltage: ' + vb.toFixed(2) + ' V ' + (on ? '(≥ 0.7 V: transistor ON)' : '(under 0.7 V: OFF)');
        // tasks
        if (pos === 'A' && bright <= 15 && on) tasks.mark(0);
        if (pos === 'A' && bright >= 95 && !on) tasks.mark(1);
        if (pos === 'B' && bright >= 85 && on) tasks.mark(2);
        if (pos === 'A' && rfix === 100) { const lo = vbase(35, 'A', 100) > .7, hi = vbase(65, 'A', 100) > .7; if (lo && !hi) tasks.mark(3); }
        if (tasks.all() && !update.done) { update.done = true; setTimeout(() => ctx.finish(4, 4, 'A light sensor and a transistor make an automatic night light!'), 900); }
      }
      slider.oninput = update;
      ctx.root.append(h('div', { class: 'stage' }, tasks.el, sky, h('div', { class: 'row', style: { justifyContent: 'center', gap: '20px' } }, lamp, meter),
        h('label', { class: 'lbl' }, '🌙 How bright is it? ☀️'), slider, h('div', { class: 'row mt12' }, posB), ctx.lvl >= 2 ? h('div', { class: 'row mt12' }, h('span', { class: 'small', style: { fontWeight: 800 } }, 'Fixed resistor:'), resSel) : null,
        h('p', { class: 'small muted mt12' }, 'The sensor (LDR) has high resistance in the dark and low resistance in light. Together with the fixed resistor it makes a voltage divider that feeds the transistor\'s base.')));
      if (ctx.lvl === 1) { /* keep the tuner but hint */ }
      update();
    }
  });
})();
