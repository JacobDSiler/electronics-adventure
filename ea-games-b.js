/*! Electronics Games pack B: transistors, latches (memory), Ohm's law, sonar, chip pins.
 * Plugins for ea-games.js + ea-game-kit.js (seeded rounds: every mode works with no extra code).
 */
(function (root) {
  'use strict';
  var G = root.EAGames, K = G && G.kit, A = G && G.art;
  if (!K || !A) throw new Error('Load ea-games.js, ea-game-kit.js and ea-games-a.js before ea-games-b.js');
  var NAVY = A.NAVY, SUN = A.SUN, MINT = A.MINT, CORAL = A.CORAL, BLUE = A.BLUE, ln = A.ln, tx = A.tx, svg = A.svg, chip = A.chip;

  /* numeric answer buttons: the right answer plus plausible slips, sorted */
  function opts(rng, ans, cands, unit, n) {
    var set = [ans], pool = rng.shuffle(cands), i, v, step = Math.max(1, Math.round(ans / 4));
    for (i = 0; i < pool.length && set.length < (n || 4); i++) { v = pool[i]; if (v > 0 && set.indexOf(v) < 0 && (Number.isInteger(v) || !Number.isInteger(ans))) set.push(v); }
    for (i = 1; set.length < (n || 4); i++) { v = ans + step * i; if (set.indexOf(v) < 0) set.push(v); }
    return set.sort(function (a, b) { return a - b; }).map(function (x) { return { v: x, label: x + (unit ? ' ' + unit : '') }; });
  }
  function yn(yes, no) { return [{ v: 'yes', label: yes || '💡 Yes' }, { v: 'no', label: no || '🌑 No' }]; }

  /* ======================== 6. Transistor Switch ======================== */
  function transSvg(baseTxt, mode, on) {
    var top = mode === 'lamp'
      ? ln(130, 14, 130, 31) + A.bulb(130, 46, on) + ln(130, 61, 130, 78)
      : ln(130, 14, 130, 28) + '<rect x="121" y="28" width="18" height="34" rx="3" fill="#fff" stroke="' + NAVY + '" stroke-width="3"/>' + ln(130, 62, 130, 78) + ln(130, 78, 188, 78) + tx(206, 83, 'OUT', 14, NAVY, 'start') + tx(150, 50, 'resistor', 11, NAVY, 'start');
    return svg(260, 170,
      tx(130, 11, '+5 V', 13, '#c23b3b') + top +
      ln(130, 78, 90, 100) + ln(90, 92, 90, 128) + ln(90, 120, 130, 142) + '<polygon points="130,142 120,141 126,132" fill="' + NAVY + '"/>' +
      ln(30, 110, 90, 110) + ln(130, 142, 130, 152) + ln(114, 156, 146, 156) + ln(120, 162, 140, 162) +
      '<rect x="4" y="82" width="62" height="26" rx="13" fill="' + SUN + '" stroke="' + NAVY + '" stroke-width="3"/>' + tx(35, 100, baseTxt, 13) +
      tx(78, 126, 'B', 12) + tx(142, 94, 'C', 12) + tx(142, 140, 'E', 12), 'an NPN transistor switch');
  }
  K.choiceGame({
    id: 'transistor', name: 'Transistor Switch', emoji: '🔀', blurb: 'A tiny signal switches a bigger one', grades: 'Quest 3 · ages 6+',
    prompt: 'Look at the base. What happens?',
    levels: [null,
      { label: 'Base on or off', ms: 14000, kind: 'onoff' },
      { label: 'Base voltage', ms: 16000, kind: 'volts' },
      { label: 'The inverter', ms: 16000, kind: 'inv' },
      { label: 'Current gain', ms: 20000, kind: 'gain' }
    ],
    makeSpec: function (rng, cfg) {
      var v, on, b;
      if (cfg.kind === 'onoff') {
        on = rng.int(0, 1) === 1;
        return { question: 'Is the lamp on?', visual: transSvg(on ? '5 V' : '0 V', 'lamp', false), choices: yn(), answer: on ? 'yes' : 'no', cols: 2, big: true,
          explain: on ? 'Power at the base turns the transistor ON, so current flows through the lamp.' : 'No power at the base: the transistor is OFF, so the lamp stays dark.' };
      }
      if (cfg.kind === 'volts') {
        v = rng.pick([0, 0.2, 0.4, 0.6, 0.65, 0.8, 1.2, 3, 5]); on = v >= 0.7;
        return { question: 'Is the lamp on?', visual: transSvg(v + ' V', 'lamp', false), choices: yn(), answer: on ? 'yes' : 'no', cols: 2, big: true,
          explain: 'A silicon transistor needs about 0.7 V at the base. ' + v + ' V is ' + (on ? 'enough.' : 'not enough.') };
      }
      if (cfg.kind === 'inv') {
        b = rng.int(0, 1);
        return { question: 'Input is ' + b + '. What is OUT?', visual: transSvg(b ? '5 V (1)' : '0 V (0)', 'inv', false),
          choices: [{ v: 0, label: '0' }, { v: 1, label: '1' }], answer: b ? 0 : 1, cols: 2, big: true,
          explain: b ? 'The transistor turns ON and pulls OUT down to ground: 0.' : 'The transistor is OFF, so the resistor pulls OUT up to 5 V: 1. A NOT gate!' };
      }
      var hfe = rng.pick([50, 100, 200]), ib = rng.pick([0.1, 0.2, 0.5, 1]), ic = Math.round(hfe * ib * 10) / 10;
      return {
        question: 'Gain ' + hfe + '. Base current ' + ib + ' mA. Collector current?',
        visual: transSvg(ib + ' mA', 'lamp', true),
        choices: opts(rng, ic, [ic * 2, ic / 2, ic + 5, ic + 10, ic * 10, ic / 10], 'mA'), answer: ic, big: false,
        explain: 'Collector current = gain × base current = ' + hfe + ' × ' + ib + ' = ' + ic + ' mA.'
      };
    }
  });

  /* ======================== 7. Latch Lock (memory) ======================== */
  K.choiceGame({
    id: 'latch', name: 'Latch Lock', emoji: '🧠', blurb: 'A latch remembers. Can you?', grades: 'Quest 5 · ages 6+',
    prompt: 'What is Q after the last step?',
    levels: [null,
      { label: 'One or two presses', ms: 15000, len: [1, 2], idle: 0 },
      { label: 'Remember when idle', ms: 18000, len: [3, 4], idle: 0.4 },
      { label: 'Long sequences', ms: 22000, len: [5, 6], idle: 0.5 },
      { label: 'Q and the opposite Q', ms: 24000, len: [5, 6], idle: 0.5, both: true }
    ],
    makeSpec: function (rng, cfg) {
      var n = rng.int(cfg.len[0], cfg.len[1]), q = 0, seq = [], i, e, html = '';
      for (i = 0; i < n; i++) {
        e = rng() < cfg.idle ? '-' : (rng() < 0.5 ? 'S' : 'R');
        if (i === 0 && e === '-') e = 'S';
        seq.push(e); if (e === 'S') q = 1; else if (e === 'R') q = 0;
      }
      html = '<div style="font-weight:800;margin-bottom:6px">Q starts at 0 (off)</div><div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">' +
        seq.map(function (x) { return x === 'S' ? chip('🟢 SET', '#c9f7e8') : x === 'R' ? chip('🔴 RESET', '#ffd9d9') : chip('⚪ hands off', '#fff'); }).join('<span style="align-self:center">→</span>') + '</div>';
      var why = 'SET makes Q = 1. RESET makes Q = 0. Hands off? The latch REMEMBERS. ';
      if (cfg.both) {
        return { question: 'What are Q and the opposite output?', visual: html,
          choices: [{ v: '1,0', label: 'Q 1 · opposite 0' }, { v: '0,1', label: 'Q 0 · opposite 1' }, { v: '1,1', label: 'Both 1' }, { v: '0,0', label: 'Both 0' }],
          answer: q + ',' + (q ? 0 : 1), cols: 2, big: false, explain: why + 'The two outputs are always opposites: Q = ' + q + '.' };
      }
      return { question: 'What is Q now?', visual: html, choices: [{ v: 1, label: '💡 Q = 1' }, { v: 0, label: '🌑 Q = 0' }], answer: q, cols: 2, big: true, explain: why + 'So Q = ' + q + '.' };
    }
  });

  /* ======================== 8. Ohm's Law Dash ======================== */
  function resBox(label) { return '<span style="display:inline-block;padding:6px 14px;border:4px solid ' + NAVY + ';border-radius:10px;background:#fff;font-weight:900;font-family:JetBrains Mono,monospace;margin:3px">' + label + '</span>'; }
  K.choiceGame({
    id: 'ohm', name: "Ohm's Law Dash", emoji: '🧮', blurb: 'Volts, amps and ohms', grades: 'Quest 1B · ages 8+',
    prompt: 'Work it out!',
    levels: [null,
      { label: 'Add resistors in a row', ms: 16000, kind: 'sum' },
      { label: 'Find the current', ms: 20000, kind: 'amps' },
      { label: 'Find the voltage', ms: 20000, kind: 'volts' },
      { label: 'Pick the LED resistor', ms: 26000, kind: 'led' }
    ],
    makeSpec: function (rng, cfg) {
      var a, b, r, v, i, vf, R;
      if (cfg.kind === 'sum') {
        a = rng.int(1, 8) * 100; b = rng.int(1, 8) * 100; r = a + b;
        return { question: 'Two resistors in a row. Total?', visual: resBox(a + ' Ω') + '<b>+</b>' + resBox(b + ' Ω'),
          choices: opts(rng, r, [r + 100, r - 100, r + 200, r - 200, a, b], 'Ω'), answer: r, big: false, explain: 'In a row (series) resistances add: ' + a + ' + ' + b + ' = ' + r + ' Ω.' };
      }
      if (cfg.kind === 'amps') {
        R = rng.pick([1, 2, 3]); i = rng.int(1, 4); v = R * i;
        return { question: 'Current in mA?', visual: resBox(v + ' V') + '<b>across</b>' + resBox(R + ' kΩ'),
          choices: opts(rng, i, [i + 1, i - 1, i * 2, v, R], 'mA'), answer: i, big: false, explain: 'I = V ÷ R = ' + v + ' ÷ ' + R + ' = ' + i + ' mA (volts ÷ kilo-ohms gives milliamps).' };
      }
      if (cfg.kind === 'volts') {
        R = rng.pick([1, 2, 3, 4]); i = rng.int(1, 5); v = R * i;
        return { question: 'Voltage in V?', visual: resBox(i + ' mA') + '<b>through</b>' + resBox(R + ' kΩ'),
          choices: opts(rng, v, [v + 1, v - 1, v * 2, i + R, v + 2], 'V'), answer: v, big: false, explain: 'V = I × R = ' + i + ' × ' + R + ' = ' + v + ' V.' };
      }
      vf = rng.pick([2, 3]); i = rng.pick([10, 20]); R = Math.round((5 - vf) / (i / 1000));
      return { question: 'Which resistor protects the LED?',
        visual: resBox('5 V supply') + resBox('LED drops ' + vf + ' V') + resBox(i + ' mA wanted'),
        choices: opts(rng, R, [R * 2, R / 2, R + 100, R * 3, R + 50, 1000], 'Ω'), answer: R, big: false,
        explain: 'The resistor must drop 5 − ' + vf + ' = ' + (5 - vf) + ' V at ' + i + ' mA: R = ' + (5 - vf) + ' ÷ 0.0' + (i / 10) + ' = ' + R + ' Ω.' };
    }
  });

  /* ======================== 9. Sonar Sums ======================== */
  K.choiceGame({
    id: 'sonar', name: 'Sonar Sums', emoji: '🦇', blurb: 'Turn echo time into distance', grades: 'Quest 7 · ages 6+',
    prompt: 'Think like a bat!',
    levels: [null,
      { label: 'Closer or farther?', ms: 12000, kind: 'near' },
      { label: 'Echo to centimetres (round)', ms: 18000, kind: 'easy' },
      { label: 'Echo to centimetres', ms: 22000, kind: 'cm' },
      { label: 'Distance to echo time', ms: 24000, kind: 'back' }
    ],
    makeSpec: function (rng, cfg) {
      var a, b, cm, us, k;
      if (cfg.kind === 'near') {
        a = rng.int(2, 20) * 100; do { b = rng.int(2, 20) * 100; } while (b === a);
        return { question: 'Which object is CLOSER?', visual: chip('🔴 A: echo in ' + a + ' µs', '#ffd9d9') + chip('🔵 B: echo in ' + b + ' µs', '#d6e6ff'),
          choices: [{ v: 'a', label: 'A' }, { v: 'b', label: 'B' }], answer: a < b ? 'a' : 'b', cols: 2, big: true, explain: 'A short echo time means a short trip: the object is close.' };
      }
      if (cfg.kind === 'easy') {
        cm = rng.pick([5, 10, 15, 20, 30, 40, 50]); us = cm * 58;
        return { question: 'Echo took ' + us + ' µs. How far in cm?', visual: '<div class="ek-big">🦇 → 🧱 → 🦇</div><div style="font-weight:800">cm = µs ÷ 58</div>',
          choices: opts(rng, cm, [cm * 2, cm / 2, cm + 5, cm + 10, cm - 5], 'cm'), answer: cm, big: false, explain: us + ' ÷ 58 = ' + cm + ' cm.' };
      }
      if (cfg.kind === 'cm') {
        k = rng.int(3, 60); us = k * 58;
        return { question: 'Echo took ' + us + ' µs. Distance?', visual: '<div style="font-weight:800">cm = µs ÷ 58</div>',
          choices: opts(rng, k, [k + 1, k - 1, k + 5, k * 2, Math.round(k / 2)], 'cm'), answer: k, big: false, explain: us + ' ÷ 58 = ' + k + ' cm.' };
      }
      cm = rng.int(5, 60); us = cm * 58;
      return { question: 'Wall at ' + cm + ' cm. How long is the echo?', visual: '<div style="font-weight:800">µs = cm × 58</div>',
        choices: opts(rng, us, [us * 2, Math.round(us / 2), us + 58, us - 58, us + 580], 'µs'), answer: us, big: false, explain: cm + ' × 58 = ' + us + ' µs.' };
    }
  });

  /* ======================== 10. Chip Safari (pins) ======================== */
  function dip(hi) {
    var out = '<rect x="62" y="8" width="96" height="214" rx="8" fill="#2a3f5f" stroke="' + NAVY + '" stroke-width="3"/><path d="M99 8 a11 11 0 0 0 22 0" fill="#fdf6ee" stroke="' + NAVY + '" stroke-width="3"/>' + tx(110, 120, '14-pin chip', 12, '#fff'), i, y, c;
    for (i = 0; i < 7; i++) {
      y = 28 + i * 28;
      c = hi === i + 1 ? CORAL : '#cdd6e4';
      out += '<rect x="36" y="' + (y - 8) + '" width="26" height="16" rx="3" fill="' + c + '" stroke="' + NAVY + '" stroke-width="2"/>';
      c = hi === 14 - i ? CORAL : '#cdd6e4';
      out += '<rect x="158" y="' + (y - 8) + '" width="26" height="16" rx="3" fill="' + c + '" stroke="' + NAVY + '" stroke-width="2"/>';
    }
    if (hi) { var idx = hi <= 7 ? hi - 1 : 14 - hi; out += tx(hi <= 7 ? 22 : 202, 28 + idx * 28 + 5, '?', 16, '#c23b3b'); }
    return svg(224, 232, out, 'a 14 pin chip with the notch at the top');
  }
  var GP = {
    '74HC04': { name: '74HC04 (six NOT gates)', pins: { 'input of gate 1': 1, 'output of gate 1': 2 }, note: 'Each NOT gate: input on the odd pin, output on the next.' },
    '74HC00': { name: '74HC00 (four NAND gates)', pins: { 'first input of gate 1': 1, 'second input of gate 1': 2, 'output of gate 1': 3 }, note: 'NAND: inputs 1 and 2, output 3.' },
    '74HC02': { name: '74HC02 (four NOR gates)', pins: { 'output of gate 1': 1, 'first input of gate 1': 2, 'second input of gate 1': 3 }, note: 'Careful! The NOR chip puts the OUTPUT first (pin 1), the opposite of the NAND chip.' }
  };
  K.choiceGame({
    id: 'chips', name: 'Chip Safari', emoji: '🦶', blurb: 'Find your way around a chip', grades: 'Quest 6 · ages 7+',
    prompt: 'Pin 1 is next to the notch. Count anticlockwise!',
    levels: [null,
      { label: 'Corner pins', ms: 15000, kind: 'corner' },
      { label: 'Count the pins', ms: 18000, kind: 'any' },
      { label: 'Power pins', ms: 16000, kind: 'power' },
      { label: 'Gate pins', ms: 22000, kind: 'gate' }
    ],
    makeSpec: function (rng, cfg) {
      var n, p, key, g, keys, ans;
      if (cfg.kind === 'corner') {
        n = rng.pick([1, 7, 8, 14]);
        return { question: 'Which pin is lit up?', visual: dip(n), choices: [1, 7, 8, 14], answer: n, big: true, explain: 'Pin 1 is top-left by the notch. Count down the left (1 to 7), then up the right (8 to 14).' };
      }
      if (cfg.kind === 'any') {
        n = rng.int(1, 14);
        return { question: 'Which pin is lit up?', visual: dip(n), choices: G.numberChoices(rng, n, 4, 1, 14), answer: n, big: true, explain: 'Left side counts down 1 to 7, right side counts up 8 to 14: this is pin ' + n + '.' };
      }
      if (cfg.kind === 'power') {
        p = rng.int(0, 1) === 1;
        return { question: p ? 'Which pin gets +5 V (VCC)?' : 'Which pin is ground (GND)?', visual: dip(0), choices: [1, 7, 8, 14], answer: p ? 14 : 7, big: true,
          explain: 'On most 14-pin logic chips: GND is pin 7 (bottom left), +5 V is pin 14 (top right).' };
      }
      key = rng.pick(Object.keys(GP)); g = GP[key]; keys = Object.keys(g.pins); p = rng.pick(keys); ans = g.pins[p];
      return { question: key + ': which pin is the ' + p + '?', visual: dip(0), choices: [1, 2, 3, 4], answer: ans, big: true, explain: g.note };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
