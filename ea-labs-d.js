/* Electronics Adventure - labs for Quest 1B: Volts, Amps & Ohms (parts, water-slide model, V-I-R triangle,
 * resistor colours, LED resistors, voltage dividers, power and battery life). */
(function () {
  'use strict';
  const EA = window.EA, h = EA.h;
  const sv = html => { const d = h('div', { class: 'svgwrap' }); d.innerHTML = html; return d; };
  const uniq = (ans, cands) => { const out = []; cands.forEach(v => { if (v > 0 && v !== ans && out.indexOf(v) < 0) out.push(v); }); return out; };
  /* four answer strings (right one at a random place): returns { choices, answer } */
  function pack(ans, cands, fmt) {
    const wrong = EA.shuffle(uniq(ans, cands)).slice(0, 3);
    let k = 1; while (wrong.length < 3) { const v = ans + k * Math.max(1, Math.round(ans / 5)); if (v !== ans && wrong.indexOf(v) < 0) wrong.push(v); k++; }
    const all = EA.shuffle([ans].concat(wrong));
    return { choices: all.map(fmt), answer: all.indexOf(ans) };
  }
  const nm = p => p.id === 'led' ? 'LED' : p.name.charAt(0).toLowerCase() + p.name.slice(1);
  const chipEl = (t, bg) => h('span', { class: 'chip mono', style: { background: bg || '#fff3c4', fontSize: '1.15rem', margin: '3px', border: '3px solid #1A2E4A', fontWeight: 900 } }, t);

  /* ================= 1. Meet the Parts ================= */
  EA.lab({
    id: 'parts', unit: 8, title: 'Meet the Parts', emoji: '🔋', blurb: 'Name the parts that build every circuit',
    run(ctx) {
      const lvl = ctx.lvl, pool = EA.partsForLevel(lvl);
      let last = null;
      EA.rounds(ctx, 8, (i, api) => {
        let t; do { t = EA.pick(pool); } while (t === last && pool.length > 1); last = t;
        if (lvl === 1) {
          const opts = EA.shuffle([t].concat(EA.shuffle(pool.filter(p => p !== t)).slice(0, 2)));
          const vis = h('div', { class: 'row', style: { justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px' } });
          opts.forEach(o => {
            const b = h('button', { class: 'choice', style: { padding: '8px', width: '31%', minWidth: '96px' }, 'aria-label': o.name }, EA.partArt(o.id, 84));
            b.onclick = () => { const ok = o === t; b.classList.add(ok ? 'good' : 'bad'); api.answer(ok, ok ? t.speak : 'That one is the ' + nm(o) + '. Look for the ' + nm(t) + '.'); };
            vis.append(b);
          });
          return { prompt: 'Find the ' + nm(t) + '!', speak: 'Find the ' + t.name, visual: vis, why: t.job };
        }
        const names = EA.shuffle([t].concat(EA.shuffle(pool.filter(p => p !== t)).slice(0, 3)));
        if (lvl >= 3 && EA.rand(2) === 0) {
          return { prompt: 'Which part? "' + t.job + '"', choices: names.map(n => n.name), answer: names.indexOf(t), why: t.name + ': ' + t.job };
        }
        return { prompt: 'What is this part?', visual: h('div', { class: 'center' }, EA.partArt(t.id, 110), h('p', { class: 'muted small' }, 'Clue: ' + t.clue)), speak: 'What is this part?',
          choices: names.map(n => n.name), answer: names.indexOf(t), why: t.name + ': ' + t.job };
      });
    }
  });

  /* ================= 2. Water Slide model ================= */
  EA.lab({
    id: 'water', unit: 8, title: 'Water Slide Park', emoji: '🌊', blurb: 'Push, flow and squeeze: how electricity behaves',
    run(ctx) {
      const lvl = ctx.lvl;
      const list = [{ text: 'Make the water RUSH' }, { text: 'Make it just a trickle' }, { text: 'Make it rush with a SMALL push' }];
      if (lvl >= 2) list.push({ text: 'Make exactly 10 mA flow' });
      const tasks = EA.tasks(list);
      let V = 4.5, R = 500;
      const holder = h('div', { class: 'svgwrap' }), meter = h('div', { class: 'chip mono', style: { fontSize: '1rem' } }, ''), bar = h('div', { class: 'bar' }, h('i', { style: { width: '0%', background: '#2D6BE4' } }));
      const vs = h('input', { type: 'range', min: 1, max: 9, step: .5, value: V, 'aria-label': 'Push (volts)' });
      const rs = h('input', { type: 'range', min: 100, max: 1000, step: 50, value: R, 'aria-label': 'Squeeze (ohms)' });
      const lv1 = lvl === 1;
      function update() {
        V = Number(vs.value); R = Number(rs.value);
        const I = V / R * 1000;
        const gap = 34 - (R - 100) / 900 * 28, top = 108 - gap / 2, bot = 108 + gap / 2, water = 20 + V / 9 * 70;
        const dur = EA.clamp(2.4 - I / 40, .12, 2.4);
        holder.innerHTML = '<svg viewBox="0 0 300 160" role="img" aria-label="a water tank with a pipe that narrows">' +
          '<rect x="8" y="14" width="62" height="110" rx="6" fill="#fff" stroke="#1A2E4A" stroke-width="4"/><rect x="11" y="' + (122 - water) + '" width="56" height="' + water + '" fill="#7cc3ff"/>' +
          '<text x="39" y="142" font-size="12" font-weight="800" text-anchor="middle" fill="#1A2E4A">' + (lv1 ? 'push' : V + ' V') + '</text>' +
          '<path d="M70 90 H120 L150 ' + top + ' H190 L220 90 H290 V126 H220 L190 ' + bot + ' H150 L120 126 H70 Z" fill="#cdeaff" stroke="#1A2E4A" stroke-width="4" stroke-linejoin="round"/>' +
          '<line x1="74" y1="108" x2="286" y2="108" stroke="#2D6BE4" stroke-width="6" stroke-dasharray="6 18" stroke-linecap="round" style="animation:dash ' + dur + 's linear infinite"/>' +
          '<text x="170" y="150" font-size="12" font-weight="800" text-anchor="middle" fill="#1A2E4A">' + (lv1 ? 'squeeze' : R + ' Ω') + '</text><text x="272" y="82" font-size="26">🏊</text></svg>';
        bar.firstChild.style.width = EA.clamp(I / 90 * 100, 2, 100) + '%';
        meter.textContent = lv1 ? (I < 6 ? 'A trickle' : I < 25 ? 'A steady stream' : 'Rushing!') : 'Flow I = V ÷ R = ' + V + ' ÷ ' + R + ' = ' + I.toFixed(1) + ' mA';
        if (I >= 40) tasks.mark(0); if (I <= 6) tasks.mark(1); if (I >= 25 && V <= 3) tasks.mark(2); if (lvl >= 2 && Math.abs(I - 10) < .35) tasks.mark(3);
        if (tasks.all() && !update.done) { update.done = true; setTimeout(() => ctx.finish(3, 3, 'More push = more flow. More squeeze = less flow. That is Ohm’s Law: I = V ÷ R.'), 700); }
      }
      vs.oninput = rs.oninput = update;
      ctx.root.append(h('div', { class: 'stage center' }, tasks.el, holder, h('div', { class: 'mt8' }, meter), bar,
        h('label', { class: 'lbl' }, lv1 ? '🔋 Push (battery strength)' : '🔋 Push: voltage (V)'), vs,
        h('label', { class: 'lbl' }, lv1 ? '🤏 Squeeze (how narrow the pipe is)' : '🤏 Squeeze: resistance (Ω)'), rs,
        h('p', { class: 'muted small mt8' }, 'Volts = push. Amps (current) = flow. Ohms = squeeze.')));
      update();
    }
  });

  /* ================= 3. V-I-R triangle ================= */
  EA.lab({
    id: 'ohmtri', unit: 8, title: 'Cover the Triangle', emoji: '🔺', blurb: 'Find V, I or R with the Ohm’s Law triangle',
    run(ctx) {
      const lvl = ctx.lvl;
      ctx.root.append(h('div', { class: 'card flat center', style: { margin: '0 0 10px' } }, h('b', null, 'Very Important Rule: cover what you want to find.'),
        h('p', { class: 'small muted mt8' }, 'V = I × R   ·   I = V ÷ R   ·   R = V ÷ I')));
      EA.rounds(ctx, 10, (i, api) => {
        let I, R, V, uV = 'V', uI = 'A', uR = 'Ω', target;
        if (lvl >= 3) { uI = 'mA'; uR = 'kΩ'; I = EA.rand(9) + 1; R = EA.rand(5) + 1; }
        else { I = EA.rand(5) + 1; R = EA.rand(lvl === 1 ? 5 : 9) + 1; }
        V = I * R;
        target = lvl === 1 ? 'V' : EA.pick(['V', 'I', 'R']);
        const ans = { V, I, R }[target], unit = { V: uV, I: uI, R: uR }[target];
        const known = ['V', 'I', 'R'].filter(k => k !== target).map(k => ({ V, I, R }[k] + ' ' + { V: uV, I: uI, R: uR }[k]));
        const names = { V: 'voltage', I: 'current', R: 'resistance' };
        const tri = h('div', { class: 'center' }); tri.innerHTML = EA.triangleSvg(target, 150);
        const vis = h('div', { class: 'center' }, tri, h('div', null, known.map(k => chipEl(k))));
        const wrong = target === 'V' ? [I + R, V + I, Math.abs(V - R), V * 2] : target === 'I' ? [V * R, V - R, ans + 1, ans * 2] : [V * I, V - I, ans + 1, ans * 2];
        const p = pack(ans, [ans + 1, ans - 1, ans * 2].concat(wrong), v => v + ' ' + unit);
        const f = target === 'V' ? 'V = I × R = ' + I + ' × ' + R : target === 'I' ? 'I = V ÷ R = ' + V + ' ÷ ' + R : 'R = V ÷ I = ' + V + ' ÷ ' + I;
        return { prompt: 'Find the ' + names[target] + ' (' + target + ')', speak: 'Find the ' + names[target], visual: vis, choices: p.choices, answer: p.answer, why: f + ' = ' + ans + ' ' + unit + '.' + (lvl >= 3 ? ' (mA × kΩ gives V.)' : '') };
      });
    }
  });

  /* ================= 4. Resistor colours ================= */
  EA.lab({
    id: 'colorcode', unit: 8, title: 'Resistor Colour Code', emoji: '🌈', blurb: 'Read the stripes to find the ohms',
    run(ctx) {
      const lvl = ctx.lvl;
      const basic = [100, 220, 330, 470, 1000, 2200, 4700, 10000], more = [10, 47, 150, 680, 22000, 47000, 100000, 1000000];
      const pool = lvl === 1 ? basic : basic.concat(more);
      const legend = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '4px', justifyContent: 'center' } });
      EA.COLORS.forEach(c => legend.append(h('span', { class: 'chip', style: { background: '#fff', padding: '3px 8px', fontSize: '.78rem' } }, h('i', { style: { width: '14px', height: '14px', borderRadius: '50%', background: c.c, border: '2px solid #1A2E4A', display: 'inline-block' } }), c.d + ' ' + c.n)));
      ctx.root.append(h('div', { class: 'card flat center', style: { margin: '0 0 10px' } },
        h('b', null, 'Big Brown Rabbits Often Yell “Get Back, Very Grumpy Wolf!”'), h('p', { class: 'small muted mt8' }, 'Black Brown Red Orange Yellow Green Blue Violet Grey White = 0 to 9. Bands 1 and 2 are digits, band 3 says how many zeros, gold = ±5%.'), lvl <= 2 ? legend : null));
      EA.rounds(ctx, 8, (i, api) => {
        const v = EA.pick(pool), b = EA.bandsFor(v), col = k => EA.COLORS[k].n.toLowerCase();
        const cands = [v * 10, v / 10, EA.bandsFor(v)[0] * 100 + b[1] * 10, v * 100].filter(x => x >= 10 && pool.concat(basic, more).indexOf(x) >= 0);
        const rest = EA.shuffle(pool.filter(x => x !== v)).slice(0, 3);
        const p = pack(v, cands.concat(rest), EA.fmtOhms);
        return { prompt: 'What is this resistor?', visual: h('div', { class: 'center' }, sv(EA.resistorSvg(v, 240))), speak: 'What is this resistor?', choices: p.choices, answer: p.answer,
          why: col(b[0]) + ' = ' + b[0] + ', ' + col(b[1]) + ' = ' + b[1] + ', then ' + (b[2] < 0 ? 'gold' : col(b[2])) + ' = ×10' + (b[2] > 0 ? ' (' + b[2] + ' zero' + (b[2] > 1 ? 's' : '') + ')' : '') + ' → ' + EA.fmtOhms(v) + '.' };
      });
    }
  });

  /* ================= 5. LED resistor ================= */
  const E12 = [47, 100, 150, 220, 330, 470, 680, 1000, 2200, 4700, 10000];
  const LEDS = [{ n: 'Red', vf: 2.0, c: '#FF4B4B' }, { n: 'Yellow', vf: 2.1, c: '#FFD21F' }, { n: 'Green', vf: 2.2, c: '#2ED573' }, { n: 'Blue', vf: 3.0, c: '#3D8BFF' }, { n: 'White', vf: 3.0, c: '#f4f4f4' }];
  EA.lab({
    id: 'ledres', unit: 8, title: 'Pick the LED Resistor', emoji: '🔴', blurb: 'Use Ohm’s Law to keep an LED bright and safe',
    run(ctx) {
      const lvl = ctx.lvl;
      let Vs = 5, led = LEDS[0], R = 4700, burnt = false;
      const list = [{ text: 'Red LED, 5 V: make it bright AND safe' }, { text: 'Pretend-burn one: pick a very small resistor' }, { text: 'Now run it on a 9 V battery, safely' }];
      if (lvl >= 2) list.push({ text: 'Blue LED at 5 V: bright and safe' });
      if (lvl >= 3) list.push({ text: 'Red LED at 12 V: the SMALLEST standard resistor that stays under 20 mA' });
      const tasks = EA.tasks(list);
      const lamp = h('div', { style: { width: '74px', height: '74px', borderRadius: '50%', margin: '6px auto', border: '4px solid #1A2E4A', transition: 'all .2s' } });
      const status = h('div', { class: 'feedback' }), math = h('div', { class: 'code mono small', style: { textAlign: 'left' } }), bar = h('div', { class: 'bar' }, h('i', { style: { width: '0%' } }));
      const vRow = h('div', { class: 'wrapx', style: { justifyContent: 'center' } }), cRow = h('div', { class: 'wrapx', style: { justifyContent: 'center' } });
      const rSel = h('select', { class: 'inp', 'aria-label': 'Resistor value' }, E12.map(r => h('option', { value: r, selected: r === R }, EA.fmtOhms(r))));
      const I = () => Math.max(0, (Vs - led.vf) / R * 1000);
      const smallestSafe12 = () => E12.find(r => (12 - 2.0) / r * 1000 <= 20);
      function update() {
        const i = I(); burnt = i > 30;
        lamp.style.background = burnt ? '#444' : led.c; lamp.style.opacity = burnt ? 1 : EA.clamp(.12 + i / 18, .12, 1); lamp.style.boxShadow = burnt ? 'none' : '0 0 ' + Math.round(EA.clamp(i, 0, 25) * 1.4) + 'px ' + led.c;
        lamp.textContent = burnt ? '💨' : ''; lamp.style.fontSize = '2.2rem'; lamp.style.lineHeight = '66px';
        const safe = i >= 8 && i <= 22;
        status.textContent = burnt ? '💥 Too much flow! The LED would burn out.' : i < 3 ? 'Very dim: the resistor squeezes too much.' : safe ? '✅ Bright and safe!' : i < 8 ? 'Safe, but a bit dim.' : 'Getting too hot: use a bigger resistor.';
        status.className = 'feedback ' + (burnt ? 'bad' : safe ? 'good' : '');
        bar.firstChild.style.width = EA.clamp(i / 40 * 100, 1, 100) + '%'; bar.firstChild.style.background = burnt ? '#e24b4b' : safe ? '#06D6A0' : '#F29B38';
        math.textContent = lvl === 1 ? 'Bigger resistor = smaller flow.' : 'R = (Vs − Vf) ÷ I\nI = (' + Vs + ' − ' + led.vf + ') ÷ ' + R + ' = ' + (i / 1000).toFixed(4) + ' A = ' + i.toFixed(1) + ' mA';
        math.style.whiteSpace = 'pre-wrap';
        if (led === LEDS[0] && Vs === 5 && safe) tasks.mark(0);
        if (burnt) tasks.mark(1);
        if (Vs === 9 && safe) tasks.mark(2);
        if (lvl >= 2 && led.n === 'Blue' && Vs === 5 && safe) tasks.mark(3);
        if (lvl >= 3 && led === LEDS[0] && Vs === 12 && R === smallestSafe12()) tasks.mark(4);
        if (tasks.all() && !update.done) { update.done = true; setTimeout(() => ctx.finish(3, 3, 'R = (supply − LED voltage) ÷ current. Aim for about 10 to 20 mA.'), 700); }
      }
      const drawBtns = () => {
        vRow.innerHTML = ''; [3, 4.5, 5, 9, 12].forEach(v => vRow.append(h('button', { class: 'btn' + (v === Vs ? '' : ' ghost'), onclick: () => { Vs = v; drawBtns(); update(); } }, v + ' V')));
        cRow.innerHTML = ''; LEDS.forEach(l => cRow.append(h('button', { class: 'btn' + (l === led ? '' : ' ghost'), onclick: () => { led = l; drawBtns(); update(); } }, l.n)));
      };
      rSel.onchange = () => { R = Number(rSel.value); update(); };
      ctx.root.append(h('div', { class: 'stage center' }, tasks.el, lamp, status, bar,
        h('label', { class: 'lbl' }, 'Battery'), vRow, h('label', { class: 'lbl' }, 'LED colour'), cRow, h('label', { class: 'lbl' }, 'Resistor'), rSel, h('div', { class: 'mt12' }, math),
        h('p', { class: 'muted small mt8' }, 'Different LED colours use up different amounts of voltage (red ≈ 2 V, blue ≈ 3 V).')));
      drawBtns(); update();
    }
  });

  /* ================= 6. Knob dimmer (voltage divider) ================= */
  EA.lab({
    id: 'divider', unit: 8, title: 'Knob Dimmer', emoji: '🎛️', blurb: 'A turning resistor shares out the voltage',
    run(ctx) {
      const lvl = ctx.lvl, Vs = 5;
      let pos = 90, Rf = 0;
      const list = [{ text: 'Make the bulb glow just a little (about 1 V)' }, { text: 'Find exactly half the voltage (2.5 V)' }, { text: 'Turn it to full brightness (5 V)' }];
      if (lvl >= 3) list.push({ text: 'Add a 10 kΩ fixed resistor and still find 2.5 V' });
      const tasks = EA.tasks(list);
      const bulb = h('div', { style: { fontSize: '4.4rem', transition: 'all .15s' } }, '💡'), meter = h('div', { class: 'chip mono', style: { fontSize: '1rem' } }), math = h('div', { class: 'code mono small', style: { textAlign: 'left', whiteSpace: 'pre-wrap' } });
      const knob = h('input', { type: 'range', min: 0, max: 100, step: 1, value: pos, 'aria-label': 'Knob position' });
      const rfSel = h('select', { class: 'inp', 'aria-label': 'Fixed resistor' }, [['0', 'None'], ['10000', '10 kΩ'], ['4700', '4.7 kΩ']].map(a => h('option', { value: a[0] }, a[1])));
      function update() {
        pos = Number(knob.value); Rf = lvl >= 3 ? Number(rfSel.value) : 0;
        const Rp = 10000 * pos / 100, Rtop = 10000 * (100 - pos) / 100 + Rf, Vout = Rp + Rtop === 0 ? 0 : Vs * Rp / (Rp + Rtop);
        bulb.style.filter = 'brightness(' + (.35 + Vout / Vs * 1.1) + ') grayscale(' + (1 - Vout / Vs) * .8 + ')'; bulb.style.transform = 'scale(' + (.8 + Vout / Vs * .4) + ')';
        meter.textContent = lvl === 1 ? (Vout < .4 ? 'Dark' : Vout < 2 ? 'Dim' : Vout < 4 ? 'Medium' : 'Bright') : 'Output = ' + Vout.toFixed(2) + ' V';
        math.textContent = lvl === 1 ? 'The knob splits the 5 V between two parts.' : 'Vout = Vs × R2 ÷ (R1 + R2)\n= 5 × ' + (Rp / 1000).toFixed(1) + 'k ÷ (' + (Rtop / 1000).toFixed(1) + 'k + ' + (Rp / 1000).toFixed(1) + 'k)';
        if (Math.abs(Vout - 1) < .15) tasks.mark(0); if (Math.abs(Vout - 2.5) < .1) tasks.mark(1); if (Vout >= 4.95) tasks.mark(2);
        if (lvl >= 3 && Rf === 10000 && Math.abs(Vout - 2.5) < .1) tasks.mark(3);
        if (tasks.all() && !update.done) { update.done = true; setTimeout(() => ctx.finish(3, 3, 'A knob (potentiometer) shares out the voltage, so Vout goes from 0 V to the full supply.'), 700); }
      }
      knob.oninput = update; rfSel.onchange = update;
      ctx.root.append(h('div', { class: 'stage center' }, tasks.el, bulb, meter, h('label', { class: 'lbl' }, '🎛️ Turn the knob'), knob,
        lvl >= 3 ? h('div', null, h('label', { class: 'lbl' }, 'Fixed resistor on top'), rfSel) : null, h('div', { class: 'mt12' }, math)));
      update();
    }
  });

  /* ================= 7. Power and battery life ================= */
  const DEV = [{ n: 'LED', e: '🔴', ma: 15 }, { n: 'Buzzer', e: '🔔', ma: 30 }, { n: 'Little bulb', e: '💡', ma: 100 }, { n: 'Toy motor', e: '🌀', ma: 150 }, { n: 'Arduino', e: '🧠', ma: 50 }, { n: 'Sonar sensor', e: '🦇', ma: 15 }];
  EA.lab({
    id: 'power', unit: 8, title: 'Power & Battery Life', emoji: '🔋', blurb: 'Watts, and how long a battery lasts',
    run(ctx) {
      const lvl = ctx.lvl;
      EA.rounds(ctx, 8, (i, api) => {
        if (lvl === 1) {
          const two = EA.shuffle(DEV).slice(0, 2); if (two[0].ma === two[1].ma) two[1] = DEV.find(d => d.ma !== two[0].ma);
          const big = two[0].ma > two[1].ma ? 0 : 1;
          return { prompt: 'Which one uses MORE electricity (more flow)?', visual: h('div', { class: 'center' }, two.map(d => chipEl(d.e + ' ' + d.n + ': ' + d.ma + ' mA'))),
            choices: two.map(d => d.n), answer: big, why: two[big].n + ' draws ' + two[big].ma + ' mA, so it empties a battery faster.' };
        }
        if (lvl === 2) {
          const V = EA.pick([3, 5, 6, 9, 12]), I = EA.pick([1, 2, 3]), P = V * I;
          const p = pack(P, [P + V, P - I, V + I, P * 2, Math.round(P / 2)], v => v + ' W');
          return { prompt: V + ' V device, ' + I + ' A of current. Power?', visual: h('div', { class: 'center' }, chipEl('P = V × I')), choices: p.choices, answer: p.answer, why: 'P = V × I = ' + V + ' × ' + I + ' = ' + P + ' W.' };
        }
        const cap = EA.pick([1000, 2000, 2400]), d = EA.pick([10, 20, 50, 100, 200]), hrs = cap / d;
        const p = pack(hrs, [hrs * 2, hrs / 2, hrs + 5, hrs * 10, hrs / 10], v => v + ' hours');
        return { prompt: 'A ' + cap + ' mAh battery runs a device that draws ' + d + ' mA. How long?', visual: h('div', { class: 'center' }, chipEl('hours = mAh ÷ mA')), choices: p.choices, answer: p.answer, why: cap + ' ÷ ' + d + ' = ' + hrs + ' hours.' };
      });
    }
  });
})();
