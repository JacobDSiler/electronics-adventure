/* Electronics Adventure - labs for Quests 6-7 (real chips, timers, adder, Arduino + sonar). */
(function () {
  'use strict';
  const EA = window.EA, h = EA.h, s = EA.s;
  const wire = { stroke: '#1A2E4A', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
  const L = (x1, y1, x2, y2, extra) => s('line', Object.assign({ x1, y1, x2, y2 }, wire, extra || {}));
  const T = (x, y, str, extra) => s('text', Object.assign({ x, y, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#6b768a', 'font-family': 'Nunito,sans-serif' }, extra || {}), str);

  /* =============== QUEST 6 =============== */

  const CHIPS = {
    '74HC04': { name: 'Six NOT gates', pins: ['1A', '1Y', '2A', '2Y', '3A', '3Y', 'GND', '4Y', '4A', '5Y', '5A', '6Y', '6A', 'VCC'] },
    '74HC00': { name: 'Four NAND gates', pins: ['1A', '1B', '1Y', '2A', '2B', '2Y', 'GND', '3Y', '3A', '3B', '4Y', '4A', '4B', 'VCC'] },
    '74HC02': { name: 'Four NOR gates', pins: ['1Y', '1A', '1B', '2Y', '2A', '2B', 'GND', '3A', '3B', '3Y', '4A', '4B', '4Y', 'VCC'] }
  };
  const PIN_INFO = p => p === 'VCC' ? '+5 V power' : p === 'GND' ? 'Ground (0 V)' : /Y$/.test(p) ? 'Output of gate ' + p[0] : 'Input of gate ' + p[0];

  function chipSvg(type, onPin, reveal) {
    const pins = CHIPS[type].pins; const svg = s('svg', { viewBox: '0 0 300 250', style: 'max-width:340px;margin:0 auto' });
    svg.append(s('rect', { x: 100, y: 14, width: 100, height: 222, rx: 10, fill: '#2b3a55', stroke: '#1A2E4A', 'stroke-width': 4 }), s('path', { d: 'M135 14 A15 15 0 0 0 165 14', fill: '#13243d' }), T(150, 120, type, { fill: '#fff', 'font-size': 15 }), T(150, 140, CHIPS[type].name.split(' ').slice(0, 2).join(' '), { fill: '#9fb2d1', 'font-size': 9 }));
    const labels = [];
    pins.forEach((p, k) => {
      const left = k < 7, y = left ? 36 + k * 29 : 36 + (13 - k) * 29, x = left ? 76 : 200;
      const g = s('g', { style: 'cursor:pointer' });
      g.append(s('rect', { x: left ? x : x, y: y - 9, width: 24, height: 18, rx: 4, fill: '#cfd6e2', stroke: '#1A2E4A', 'stroke-width': 2 }), T(left ? x + 12 : x + 12, y + 4, String(k + 1), { 'font-size': 10, fill: '#1A2E4A' }));
      const lb = T(left ? x - 8 : x + 32, y + 4, p, { 'text-anchor': left ? 'end' : 'start', 'font-size': 11, fill: p === 'VCC' ? '#d33' : p === 'GND' ? '#1A2E4A' : /Y$/.test(p) ? '#058a68' : '#2D6BE4', opacity: reveal ? 1 : 0 }); labels.push(lb);
      g.append(lb, s('rect', { x: left ? x - 40 : x, y: y - 14, width: 64, height: 28, fill: 'transparent' }));
      if (onPin) g.addEventListener('click', () => onPin(k + 1, p));
      svg.append(g);
    });
    svg.reveal = () => labels.forEach(l => l.setAttribute('opacity', 1));
    return svg;
  }

  /* ---- Chip safari ---- */
  EA.lab({
    id: 'chipsafari', unit: 6, title: 'Chip Safari', emoji: '🔬', blurb: 'Find the pins on real chips',
    run(ctx) {
      const types = Object.keys(CHIPS);
      const Q = [
        t => ({ p: 'Tap the pin that gets +5 V on this ' + t + '.', a: 14, why: 'Pin 14, in the corner opposite ground, is VCC: the +5 V power.' }),
        t => ({ p: 'Tap the GROUND pin on this ' + t + '.', a: 7, why: 'Pin 7 is ground (0 V). Pin 14 is +5 V.' }),
        t => ({ p: 'Tap pin 1 on this ' + t + '. (Hint: it is next to the notch.)', a: 1, why: 'Pin 1 is on the left, just below the notch. Pins count anti-clockwise.' }),
        t => ({ p: 'Tap the OUTPUT of the first gate (1Y) on this ' + t + '.', a: CHIPS[t].pins.indexOf('1Y') + 1, why: 'On the ' + t + ', 1Y is pin ' + (CHIPS[t].pins.indexOf('1Y') + 1) + '. The pin order is different on each chip: always check the datasheet!', l: 2 }),
        t => ({ p: 'Tap an INPUT of the second gate (2A) on this ' + t + '.', a: CHIPS[t].pins.indexOf('2A') + 1, why: '2A is pin ' + (CHIPS[t].pins.indexOf('2A') + 1) + ' on the ' + t + '.', l: 2 }),
        () => ({ p: 'On this 74HC02 latch: gate 1 makes Q on pin 1. Tap the pin Q must be wired to (an input of gate 2).', t: '74HC02', a: 6, why: 'Wire pin 1 to pin 6, and pin 4 to pin 3: each gate listens to the other. That makes the memory loop!', l: 3 })
      ];
      const pool = Q.filter(q => (q('74HC02').l || 1) <= ctx.lvl);
      const n = ctx.lvl === 1 ? 4 : 6;
      EA.rounds(ctx, n, (i, api) => {
        const base = pool[i % pool.length]; const type0 = EA.pick(types); const q = base(type0); const type = q.t || type0;
        const vis = h('div', { class: 'svgwrap' }); const svg = chipSvg(type, pin => api.answer(pin === q.a, q.why), false); vis.append(svg);
        return { prompt: q.p, visual: vis, why: q.why, after() { svg.reveal(); } };
      });
    }
  });

  /* ---- D flip-flop ---- */
  EA.lab({
    id: 'dff', unit: 6, title: 'Flip-Flop Lab', emoji: '🎚️', blurb: 'A memory that only listens at the clock click',
    run(ctx) {
      let D = 0, Q = 0, clockedSinceD = true;
      const tasks = EA.tasks([{ text: 'Set D = 1 and press CLOCK: Q copies D' }, { text: 'Set D back to 0 WITHOUT the clock: Q does not change!' }, { text: 'Press CLOCK again: now Q follows D' }]);
      const led = EA.led(false, 'green', true), msg = h('div', { class: 'feedback' });
      const tD = EA.toggle('D (data)', 0, v => { D = v; clockedSinceD = false; if (Q === 1 && D === 0) { tasks.mark(1); msg.textContent = 'D changed, but Q ignores it. It is waiting for the clock!'; msg.className = 'feedback good'; } else { msg.textContent = 'D changed. Q is still ' + Q + ' until the clock ticks.'; msg.className = 'feedback'; } });
      const clk = h('button', { class: 'btn big sun' }, '⏱ CLOCK');
      clk.onclick = () => { const old = Q; Q = D; clockedSinceD = true; EA.setLed(led, !!Q); EA.sfx.click(); msg.textContent = 'Tick! Q copied D. Q = ' + Q + '.'; msg.className = 'feedback'; if (D === 1) tasks.mark(0); if (old === 1 && D === 0 && tasks.count() >= 2) tasks.mark(2); if (tasks.all() && !clk.d) { clk.d = true; setTimeout(byteMode, 1000); } };
      const box = h('div', { class: 'stage center' }, tasks.el, h('div', { class: 'row', style: { justifyContent: 'center', gap: '18px' } }, tD, h('div', { class: 'chip' }, '74HC74'), h('div', null, led, h('div', { class: 'mono small' }, 'Q'))), h('div', { class: 'mt12' }, clk), msg);
      ctx.root.append(box);
      function byteMode() {
        box.remove(); const bits = 8; const d = Array(bits).fill(0), q = Array(bits).fill(0); const target = [5, 37, 66, 100, 12][EA.rand(5)];
        const dec = h('div', { class: 'chip mono', style: { fontSize: '1.2rem' } }, 'Stored value: 0');
        const dt = d.map((_, k) => EA.toggle(String(1 << (bits - 1 - k)), 0, v => { d[k] = v; }));
        const leds = q.map(() => EA.led(false, 'green', false));
        const c2 = h('button', { class: 'btn big sun' }, '⏱ CLOCK');
        let ok = false;
        c2.onclick = () => { d.forEach((v, k) => { q[k] = v; EA.setLed(leds[k], !!v); }); const val = q.reduce((t, v, k) => t + v * (1 << (bits - 1 - k)), 0); dec.textContent = 'Stored value: ' + val; EA.sfx.click();
          if (val === target && !ok) { ok = true; setTimeout(() => ctx.finish(3, 3, 'Eight flip-flops = one byte of memory!'), 800); } };
        ctx.root.append(h('div', { class: 'stage center' }, h('div', { class: 'prompt' }, 'Eight flip-flops make a BYTE. Store the number ' + target + ' by setting D and pressing CLOCK!'),
          h('div', { class: 'wrapx', style: { justifyContent: 'center', gap: '6px' } }, dt.map(t => { t.style.minWidth = '38px'; t.style.padding = '6px 4px'; return t; })),
          h('div', { class: 'row mt12', style: { justifyContent: 'center', gap: '4px', flexWrap: 'wrap' } }, leds), h('div', { class: 'mt8' }, dec), h('div', { class: 'mt12' }, c2),
          h('p', { class: 'small muted mt8' }, 'Each toggle is worth the number under it. Add them up!')));
      }
    }
  });

  /* ---- 555 + counter ---- */
  EA.lab({
    id: 'timer555', unit: 6, title: 'Blink & Chase', emoji: '⏲️', blurb: 'Change resistors and a capacitor to change the speed',
    run(ctx) {
      let r2 = 47, c = 10, tick = 0, timer = null; const R1 = 1;
      const tasks = EA.tasks([{ text: 'Make it blink about once a second (0.8–1.3 times per second)' }, { text: 'Make it blink FASTER than 5 times a second' }, { text: 'Make a SLOW chaser (under 1 per second)' }]);
      const hz = () => 1.44 / (((R1 + 2 * r2) * 1000) * (c * 1e-6));
      const led = EA.led(false, 'red', true), chase = Array.from({ length: 10 }, () => EA.led(false, 'yellow', false));
      const read = h('div', { class: 'chip mono', style: { fontSize: '.95rem' } });
      const s2 = h('input', { type: 'range', min: 5, max: 100, step: 1, value: r2, 'aria-label': 'Resistor R2' }), sc = h('input', { type: 'range', min: 0.1, max: 100, step: 0.1, value: c, 'aria-label': 'Capacitor' });
      const l2 = h('div', { class: 'small', style: { fontWeight: 800 } }), lc = h('div', { class: 'small', style: { fontWeight: 800 } });
      function restart() {
        clearInterval(timer); const f = hz(), period = Math.max(40, 1000 / f);
        timer = setInterval(() => { tick++; EA.setLed(led, tick % 2 === 0); EA.setLed(chase[(tick >> 1) % 10 === 0 && false ? 0 : Math.floor(tick / 2) % 10], true); chase.forEach((l, k) => { if (k !== Math.floor(tick / 2) % 10) EA.setLed(l, false); }); if (f < 12 && tick % 2 === 0) EA.sfx.beep(f < 3 ? 880 : 660, .03); }, period / 2);
        read.textContent = (f >= 10 ? f.toFixed(0) : f.toFixed(2)) + ' blinks per second' + (f > 20 ? ' (too fast to see!)' : '');
        l2.textContent = 'R2 resistor: ' + r2 + ' kΩ'; lc.textContent = 'Capacitor: ' + c + ' µF';
        if (f >= .8 && f <= 1.3) tasks.mark(0); if (f > 5) tasks.mark(1); if (f < 1) tasks.mark(2);
        if (tasks.all() && !restart.d) { restart.d = true; setTimeout(() => ctx.finish(3, 3, 'Bigger resistor or capacitor = slower blinking!'), 1200); }
      }
      EA.onLeave(() => clearInterval(timer));
      s2.oninput = () => { r2 = Number(s2.value); restart(); }; sc.oninput = () => { c = Number(sc.value); restart(); };
      ctx.root.append(h('div', { class: 'stage center' }, tasks.el, h('div', { class: 'row', style: { justifyContent: 'center', gap: '16px' } }, h('div', { class: 'chip' }, '555 timer'), '➜', led), h('div', { class: 'mt12 small muted' }, '…and the counter chip 4017 lights one LED at a time:'),
        h('div', { class: 'row mt8', style: { justifyContent: 'center', gap: '4px', flexWrap: 'wrap' } }, chase), h('div', { class: 'mt12' }, read),
        h('div', { style: { textAlign: 'left' } }, h('div', { class: 'mt12' }, l2, s2), h('div', { class: 'mt8' }, lc, sc)),
        ctx.lvl >= 2 ? h('p', { class: 'small mono muted mt12' }, 'f = 1.44 ÷ ((R1 + 2×R2) × C),  R1 = 1 kΩ') : null));
      restart();
    }
  });

  /* ---- half adder ---- */
  EA.lab({
    id: 'halfadder', unit: 6, title: 'Adding Machine', emoji: '➕', blurb: 'A half adder adds two one-bit numbers',
    run(ctx) {
      let a = 0, b = 0; const seen = new Set(); const tasks = EA.tasks([{ text: 'Try all four combinations of A and B' }]);
      const sumL = EA.led(false, 'green', true), carL = EA.led(false, 'yellow', true), res = h('div', { class: 'chip mono', style: { fontSize: '1.15rem' } });
      const upd = () => { const sum = a ^ b, car = a & b; EA.setLed(sumL, !!sum); EA.setLed(carL, !!car); res.textContent = a + ' + ' + b + ' = ' + car + '' + sum + ' (binary)  =  ' + (a + b) + ' in our numbers'; seen.add('' + a + b); if (seen.size === 4) { tasks.mark(0); if (!upd.d) { upd.d = true; setTimeout(quiz, 1100); } } };
      const tA = EA.toggle('A', 0, v => { a = v; upd(); }), tB = EA.toggle('B', 0, v => { b = v; upd(); });
      function quiz() {
        box.remove();
        EA.rounds(ctx, 3, i => [
          { prompt: 'In binary, what is 1 + 1?', choices: ['10', '2', '11', '0'], answer: 0, why: '1 + 1 = 10 in binary (that means two). The carry LED lights and the sum LED is off.' },
          { prompt: 'When does the CARRY light turn on?', choices: ['Only when A AND B are both 1', 'When either is 1', 'Never'], answer: 0, why: 'Carry is just an AND gate.' },
          { prompt: 'The SUM light is on when…', choices: ['exactly one of A or B is 1', 'both are 1', 'both are 0'], answer: 0, why: 'Sum is an XOR gate: it is 1 when the inputs are different.' }][i]);
      }
      const box = h('div', { class: 'stage center' }, tasks.el, h('div', { class: 'row', style: { justifyContent: 'center', gap: '18px', flexWrap: 'wrap' } }, tA, tB, h('div', { class: 'card flat', style: { margin: 0 } }, h('b', null, 'XOR'), h('div', { class: 'small muted' }, '(4 NANDs)'), h('div', { class: 'mt8' }, sumL, h('div', { class: 'mono small' }, 'SUM'))), h('div', { class: 'card flat', style: { margin: 0 } }, h('b', null, 'AND'), h('div', { class: 'small muted' }, '(1 NAND + NOT)'), h('div', { class: 'mt8' }, carL, h('div', { class: 'mono small' }, 'CARRY')))), h('div', { class: 'mt12' }, res),
        h('p', { class: 'small muted mt8' }, 'Five NAND gates in all. This is the circuit at the heart of every calculator!'));
      ctx.root.append(box); upd();
    }
  });

  /* =============== QUEST 7 =============== */

  /* ---- Sonar ---- */
  EA.lab({
    id: 'sonar', unit: 7, title: 'Sonar Explorer', emoji: '🦇', blurb: 'Time the echo to find the distance',
    run(ctx) {
      let cm = 100, busy = false; const SOUND = 343;
      const echoUs = d => Math.round(d * 58.31);
      const tasks = EA.tasks([{ text: 'Ping something CLOSE (under 30 cm)' }, { text: 'Ping something FAR (over 150 cm)' }]);
      const obj = h('div', { style: { fontSize: '3rem', position: 'absolute', top: '16px', transition: 'left .2s' } }, '🧱'); const bat = h('div', { style: { fontSize: '3rem', position: 'absolute', left: '6px', top: '16px' } }, '🦇');
      const wave = h('div', { style: { fontSize: '1.6rem', position: 'absolute', top: '26px', left: '56px', opacity: 0 } }, '🔊');
      const track = h('div', { style: { position: 'relative', height: '88px', background: '#e8f3ff', borderRadius: '16px', border: '3px solid #1A2E4A', overflow: 'hidden' } }, bat, wave, obj);
      const read = h('div', { class: 'chip mono', style: { fontSize: '.95rem', whiteSpace: 'normal', textAlign: 'center' } }, 'Press PING!');
      const slider = h('input', { type: 'range', min: 5, max: 300, value: cm, 'aria-label': 'Distance to the object' }); const lab = h('div', { style: { fontWeight: 800 } });
      const pos = () => (8 + (cm - 5) / 295 * 70) + '%';
      function place() { cm = Number(slider.value); obj.style.left = pos(); lab.textContent = 'Object is ' + cm + ' cm away'; }
      slider.oninput = place;
      const ping = h('button', { class: 'btn big mint' }, '📣 PING!');
      ping.onclick = () => {
        if (busy) return; busy = true; const us = echoUs(cm); const travel = 250 + (cm / 300) * 800;
        wave.style.transition = 'none'; wave.style.left = '56px'; wave.style.opacity = 1; void wave.offsetWidth; EA.tone(1300, .1, 'sine', .12);
        wave.style.transition = 'left ' + travel + 'ms linear'; wave.style.left = 'calc(' + pos() + ' - 8px)';
        read.textContent = 'Listening…';
        setTimeout(() => { wave.textContent = '🔉'; wave.style.transition = 'left ' + travel + 'ms linear'; wave.style.left = '56px'; }, travel);
        setTimeout(() => { EA.tone(1300, .1, 'sine', .08); wave.style.opacity = 0; wave.textContent = '🔊'; busy = false;
          read.innerHTML = 'Echo came back after <b>' + us.toLocaleString() + ' µs</b><br>' + (ctx.lvl >= 2 ? 'distance = ' + us + ' ÷ 58 = <b>' + Math.round(us / 58) + ' cm</b>' : 'Far away = a LONG wait');
          if (cm < 30) tasks.mark(0); if (cm > 150) tasks.mark(1); if (tasks.all() && !ping.d) { ping.d = true; setTimeout(challenge, 1300); } }, travel * 2);
      };
      function challenge() {
        box.remove(); const n = ctx.lvl === 1 ? 4 : 5;
        EA.rounds(ctx, n, () => {
          if (ctx.lvl === 1) { const d1 = 10 + EA.rand(40), d2 = 80 + EA.rand(150); const swap = EA.rand(2); const A = swap ? d2 : d1, B = swap ? d1 : d2;
            return { prompt: 'Echo A came back after ' + echoUs(A).toLocaleString() + ' µs. Echo B came back after ' + echoUs(B).toLocaleString() + ' µs. Which object is FARTHER away?', choices: ['Object A', 'Object B'], answer: A > B ? 0 : 1, why: 'A longer wait means the sound travelled farther.' }; }
          if (ctx.lvl === 2) { const d = [10, 20, 30, 50, 100, 150][EA.rand(6)]; const opts = EA.shuffle([d, d * 10, Math.max(1, d / 10)]).map(x => x + ' cm'); return { prompt: 'The echo took ' + (d * 58) + ' µs. About how far away is the object? (cm = µs ÷ 58)', choices: opts, answer: opts.indexOf(d + ' cm'), why: (d * 58) + ' ÷ 58 = ' + d + ' cm.' }; }
          const ms = [4, 6, 10, 12, 20][EA.rand(5)]; const d = Math.round(ms / 1000 * SOUND / 2 * 100); const opts = EA.shuffle([d, d * 2, Math.round(d / 2)]).map(x => x + ' cm');
          return { prompt: 'An echo comes back after ' + ms + ' milliseconds. Sound travels 343 m/s. How far is the object?', choices: opts, answer: opts.indexOf(d + ' cm'), why: 'distance = time × 343 ÷ 2 = ' + (ms / 1000) + ' × 343 ÷ 2 ≈ ' + d + ' cm. Divide by 2 because the sound goes there AND back.' };
        });
      }
      const box = h('div', { class: 'stage center' }, tasks.el, track, h('div', { class: 'mt8' }, lab), slider, h('div', { class: 'mt12' }, ping), h('div', { class: 'mt12' }, read));
      ctx.root.append(box); place();
    }
  });

  /* ---- Parking sensor ---- */
  EA.lab({
    id: 'parking', unit: 7, title: 'Parking Sensor', emoji: '🚗', blurb: 'The closer the wall, the faster the beeps',
    run(ctx) {
      let cm = 100, k = 5, on = false, beepT = null;
      const tasks = EA.tasks([{ text: 'Find a SLOW beep (more than half a second apart)' }, { text: 'Find a FAST beep (under 0.1 seconds apart)' }, { text: 'PARK in the green zone (8–15 cm from the wall)' }]);
      const car = h('div', { style: { fontSize: '3.2rem', position: 'absolute', top: '14px', transition: 'left .15s' } }, '🚗'); const wallEl = h('div', { style: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '34px', background: 'repeating-linear-gradient(0deg,#b86b45,#b86b45 14px,#9c5636 14px,#9c5636 16px)' } });
      const zone = h('div', { style: { position: 'absolute', right: '34px', top: 0, bottom: 0, width: '12%', background: 'rgba(61,220,151,.4)' } });
      const road = h('div', { style: { position: 'relative', height: '84px', background: '#dfe5ee', borderRadius: '16px', border: '3px solid #1A2E4A', overflow: 'hidden' } }, zone, wallEl, car);
      const bars = Array.from({ length: 5 }, () => EA.led(false, 'red', false)), buzz = h('span', { style: { fontSize: '2.4rem' } }, '🔈');
      const read = h('div', { class: 'chip mono', style: { fontSize: '.9rem' } }), code = h('div', { class: 'code mt12', style: { textAlign: 'left' } });
      const slider = h('input', { type: 'range', min: 3, max: 120, value: cm, 'aria-label': 'Distance to the wall' }), lab = h('div', { style: { fontWeight: 800 } });
      const mult = h('input', { type: 'range', min: 1, max: 10, value: k, 'aria-label': 'Delay multiplier' }), ml = h('div', { class: 'small', style: { fontWeight: 800 } });
      const startB = h('button', { class: 'btn big mint' }, '▶ Start sensor');
      const interval = () => cm < 6 ? 0 : Math.max(30, cm * k);
      function beepLoop() {
        clearTimeout(beepT); if (!on) return; const iv = interval();
        if (iv === 0) { EA.tone(1000, .25, 'square', .06); buzz.textContent = '🔊'; beepT = setTimeout(beepLoop, 220); return; }
        EA.tone(900, .05, 'square', .07); buzz.textContent = '🔊'; setTimeout(() => { buzz.textContent = '🔈'; }, Math.min(80, iv / 2)); beepT = setTimeout(beepLoop, iv);
      }
      EA.onLeave(() => { on = false; clearTimeout(beepT); });
      startB.onclick = () => { on = !on; startB.textContent = on ? '⏸ Stop sensor' : '▶ Start sensor'; if (on) beepLoop(); else buzz.textContent = '🔈'; };
      function upd() {
        cm = Number(slider.value); k = Number(mult.value); const iv = interval();
        car.style.left = (4 + (120 - cm) / 117 * 62) + '%'; lab.textContent = 'Car is ' + cm + ' cm from the wall'; ml.textContent = 'delay(cm × ' + k + ')';
        bars.forEach((l, i) => EA.setLed(l, cm < 100 - i * 22 + 2 && cm < 100));
        read.textContent = iv === 0 ? 'STOP! Constant tone' : 'Beep every ' + iv + ' ms (' + (1000 / iv).toFixed(1) + ' per second)';
        code.innerHTML = '<span class="cm">// what the Arduino does</span>\nif (cm &lt; 6) { tone on! }\nelse {\n  beep();\n  delay(<span class="hl">cm * ' + k + '</span>);   <span class="cm">// ' + cm + ' × ' + k + ' = ' + iv + ' ms</span>\n}';
        if (iv >= 500) tasks.mark(0); if (iv > 0 && iv < 100) tasks.mark(1); if (cm >= 8 && cm <= 15) tasks.mark(2);
        if (tasks.all() && !upd.d) { upd.d = true; setTimeout(() => ctx.finish(3, 3, 'You built a parking sensor brain!'), 1400); }
        if (on) beepLoop();
      }
      slider.oninput = upd; mult.oninput = upd;
      ctx.root.append(h('div', { class: 'stage center' }, tasks.el, road, h('div', { class: 'mt8' }, lab), slider, h('div', { class: 'row mt12', style: { justifyContent: 'center', gap: '14px' } }, h('div', { class: 'row', style: { gap: '3px' } }, bars), buzz), h('div', { class: 'mt8' }, read), h('div', { class: 'mt12' }, startB),
        ctx.lvl >= 2 ? h('div', { style: { textAlign: 'left' }, class: 'mt12' }, ml, mult, code) : null));
      upd();
    }
  });

  /* ---- Code detective ---- */
  EA.lab({
    id: 'codedetective', unit: 7, title: 'Code Detective', emoji: '🕵️', blurb: 'Fill in the missing piece of the code',
    run(ctx) {
      const P = [
        { l: 1, c: 'void loop() {\n  digitalWrite(LED, ___);   // turn the light ON\n  delay(1000);\n}', ch: ['HIGH', 'LOW', 'ON', '1000'], a: 0, why: 'HIGH means ON (5 volts). LOW means OFF.' },
        { l: 1, c: 'delay(___);   // wait half a second', ch: ['5', '50', '500', '5000'], a: 2, why: 'delay counts in milliseconds. 1000 is one second, so 500 is half a second.' },
        { l: 1, c: 'if (a ___ b) {      // only if BOTH buttons\n  digitalWrite(LED, HIGH);\n}', ch: ['&&', '||', '!', '=='], a: 0, why: '&& means AND: both must be true.' },
        { l: 1, c: 'if (a ___ b) {      // if EITHER button\n  digitalWrite(LED, HIGH);\n}', ch: ['&&', '||', '!', '+'], a: 1, why: '|| means OR: either one is enough.' },
        { l: 2, c: 'if (___a) {         // when a is NOT pressed\n  digitalWrite(LED, HIGH);\n}', ch: ['!', '&&', '||', '#'], a: 0, why: '! means NOT: it flips true and false.' },
        { l: 2, c: 'pinMode(TRIG, ___);   // TRIG sends the ping', ch: ['OUTPUT', 'INPUT', 'HIGH', 'ECHO'], a: 0, why: 'The Arduino sends the ping out, so TRIG is an OUTPUT.' },
        { l: 2, c: 'pinMode(ECHO, ___);   // ECHO listens', ch: ['OUTPUT', 'INPUT', 'LOW', 'TRIG'], a: 1, why: 'The Arduino listens for the echo, so ECHO is an INPUT.' },
        { l: 2, c: 'float cm = us / ___;   // microseconds to centimetres', ch: ['58.0', '5.8', '580', '2'], a: 0, why: 'Sound takes about 58 µs per centimetre of distance (there and back).' },
        { l: 2, c: 'if (cm ___ 20) {          // closer than 20 cm\n  digitalWrite(BUZZER, HIGH);\n}', ch: ['<', '>', '==', '!'], a: 0, why: '< means "is less than": a smaller distance means closer.' },
        { l: 3, c: '// Which line lights the LED only when NEITHER button is pressed?', ch: ['if (!a && !b)', 'if (!a || !b)', 'if (a && b)', 'if (a || b)'], a: 0, why: 'Neither pressed = NOT a AND NOT b. This is a NOR gate in code!' },
        { l: 3, c: '// Which line is a NAND: LED is OFF only when both buttons are pressed?', ch: ['if (!(a && b))', 'if (a && b)', 'if (!a && !b)', 'if (a || b)'], a: 0, why: 'NAND = NOT (a AND b).' },
        { l: 3, c: 'long us = pulseIn(ECHO, HIGH, 30000);\nif (us > ___) {            // ignore "no echo" readings\n  Serial.println(us / 58.0);\n}', ch: ['0', '30000', '58', '1000000'], a: 0, why: 'pulseIn gives 0 when no echo was heard, so we only use values greater than 0.' }
      ];
      const pool = EA.shuffle(P.filter(p => p.l <= ctx.lvl)); const n = ctx.lvl === 1 ? 4 : ctx.lvl === 2 ? 6 : 8;
      EA.rounds(ctx, Math.min(n, pool.length), (i) => {
        const p = pool[i]; const opts = p.ch.map((c, idx) => ({ c, ok: idx === p.a })); const sh = EA.shuffle(opts);
        const html = p.c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/___/g, '<span class="hl">&nbsp;&nbsp;?&nbsp;&nbsp;</span>').replace(/(\/\/.*)/g, '<span class="cm">$1</span>');
        return { prompt: p.c.includes('___') ? 'What goes in the blank?' : 'Which is the right line of code?', speak: 'What is the missing piece of code?', visual: h('div', { class: 'code', html }), choices: sh.map(o => o.c), answer: sh.findIndex(o => o.ok), why: p.why };
      });
    }
  });
})();
