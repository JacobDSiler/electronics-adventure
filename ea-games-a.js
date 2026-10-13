/*! Electronics Games pack A: circuits, conductors, logic gates, truth tables, binary.
 * Plugins for ea-games.js + ea-game-kit.js. Every round is built from a seeded RNG, so all modes
 * (solo, teamwork, face-off, race) work with no extra code.
 */
(function (root) {
  'use strict';
  var G = root.EAGames, K = G && G.kit;
  if (!K) throw new Error('Load ea-games.js and ea-game-kit.js before ea-games-a.js');
  var NAVY = '#1A2E4A', SUN = '#FFD166', MINT = '#06D6A0', CORAL = '#FF6B6B', BLUE = '#2D6BE4';

  /* ---------- shared art helpers (strings built only from numbers and fixed text) ---------- */
  function svg(w, h, inner, label) {
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + (label || 'diagram') + '" style="max-width:100%">' + inner + '</svg>';
  }
  function ln(x1, y1, x2, y2, c, w) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || NAVY) + '" stroke-width="' + (w || 4) + '" stroke-linecap="round"/>'; }
  function tx(x, y, t, size, c, anchor) { return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 14) + '" font-weight="800" fill="' + (c || NAVY) + '" text-anchor="' + (anchor || 'middle') + '" font-family="Nunito,system-ui,sans-serif">' + t + '</text>'; }
  function bulb(x, y, on) {
    return (on ? '<circle cx="' + x + '" cy="' + y + '" r="26" fill="' + SUN + '" opacity=".45"/>' : '') +
      '<circle cx="' + x + '" cy="' + y + '" r="15" fill="' + (on ? SUN : '#e5e7eb') + '" stroke="' + NAVY + '" stroke-width="3"/>' +
      '<path d="M' + (x - 7) + ' ' + (y + 5) + ' l4 -8 l3 6 l3 -6 l4 8" fill="none" stroke="' + NAVY + '" stroke-width="2"/>';
  }
  function battery(x, y) {
    return ln(x - 12, y - 10, x + 12, y - 10, NAVY, 4) + ln(x - 6, y + 4, x + 6, y + 4, NAVY, 7) + tx(x + 22, y - 6, '+', 14, CORAL, 'start');
  }
  function swt(x, y, closed) {
    return '<circle cx="' + (x - 16) + '" cy="' + y + '" r="3.5" fill="' + NAVY + '"/><circle cx="' + (x + 16) + '" cy="' + y + '" r="3.5" fill="' + NAVY + '"/>' +
      (closed ? ln(x - 16, y, x + 16, y, MINT, 5) : ln(x - 16, y, x + 12, y - 15, CORAL, 5)) +
      tx(x, y + 20, closed ? 'ON' : 'OFF', 11, closed ? '#0a8f70' : '#c23b3b');
  }
  function chip(label, c) { return '<span style="display:inline-block;padding:4px 12px;border-radius:999px;border:3px solid ' + NAVY + ';background:' + (c || '#fff') + ';font-weight:900;font-size:1.05rem;margin:2px">' + label + '</span>'; }
  G.art = { svg: svg, ln: ln, tx: tx, bulb: bulb, battery: battery, swt: swt, chip: chip, NAVY: NAVY, SUN: SUN, MINT: MINT, CORAL: CORAL, BLUE: BLUE };

  /* ======================== 1. Closed Circuit ======================== */
  K.choiceGame({
    id: 'circuit', name: 'Closed Circuit', emoji: '💡', blurb: 'Will the bulb light?', grades: 'Quest 1 · all ages',
    prompt: 'Does the bulb light up?',
    levels: [null,
      { label: 'Loop or gap', ms: 14000 },
      { label: 'One switch', ms: 14000 },
      { label: 'Two switches in a row', ms: 15000 },
      { label: 'Two switches side by side', ms: 16000 }
    ],
    makeSpec: function (rng, cfg, level) {
      var on, inner, why;
      var frame = ln(30, 100, 210, 100) + ln(30, 100, 30, 66) + ln(210, 100, 210, 78) + battery(30, 52) + ln(30, 40, 30, 20) + ln(210, 46, 210, 20);
      if (level === 1) {
        var gap = rng.int(0, 1) === 1; on = !gap;
        inner = frame + (gap ? ln(30, 20, 100, 20) + ln(140, 20, 210, 20) + '<circle cx="100" cy="20" r="4" fill="' + CORAL + '"/><circle cx="140" cy="20" r="4" fill="' + CORAL + '"/>' + tx(120, 12, 'gap', 12, '#c23b3b') : ln(30, 20, 210, 20));
        why = on ? 'The loop is complete, so the electricity can flow all the way round.' : 'There is a gap. Electricity needs a complete loop.';
      } else if (level === 2) {
        var c1 = rng.int(0, 1) === 1; on = c1;
        inner = frame + ln(30, 20, 104, 20) + ln(136, 20, 210, 20) + swt(120, 20, c1);
        why = on ? 'The switch is closed, so the loop is complete.' : 'The switch is open, so the loop is broken.';
      } else if (level === 3) {
        var a = rng.int(0, 1) === 1, b = rng.int(0, 1) === 1; on = a && b;
        inner = frame + ln(30, 20, 74, 20) + ln(106, 20, 134, 20) + ln(166, 20, 210, 20) + swt(90, 20, a) + swt(150, 20, b);
        why = on ? 'Both switches are closed, so the loop is complete.' : 'In a row (series), BOTH switches must be closed.';
      } else {
        var p = rng.int(0, 1) === 1, q = rng.int(0, 1) === 1; on = p || q;
        inner = frame + ln(30, 20, 104, 20) + ln(136, 20, 210, 20) + swt(120, 20, p) +
          ln(70, 20, 70, 58) + ln(170, 20, 170, 58) + ln(70, 58, 104, 58) + ln(136, 58, 170, 58) + swt(120, 58, q);
        why = on ? 'At least one road is open, so the electricity gets through.' : 'Side by side (parallel): you need at least ONE closed switch.';
      }
      return {
        question: 'Will the bulb light?',
        visual: svg(240, 120, inner + bulb(210, 62, false), 'a battery, wires, a bulb and switches'),
        choices: [{ v: 'yes', label: '💡 Yes' }, { v: 'no', label: '🌑 No' }],
        answer: on ? 'yes' : 'no', cols: 2, big: true, explain: why
      };
    }
  });

  /* ======================== 2. Conductor or Insulator ======================== */
  var STUFF = [
    { n: 'Nail', e: '🔩', c: 1, l: 1, w: 'Metal lets electricity flow.' },
    { n: 'Coin', e: '🪙', c: 1, l: 1, w: 'Coins are metal.' },
    { n: 'Key', e: '🔑', c: 1, l: 1, w: 'Keys are metal.' },
    { n: 'Spoon', e: '🥄', c: 1, l: 1, w: 'A metal spoon is a conductor.' },
    { n: 'Wooden stick', e: '🪵', c: 0, l: 1, w: 'Dry wood is an insulator.' },
    { n: 'Rubber glove', e: '🧤', c: 0, l: 1, w: 'Rubber is a great insulator.' },
    { n: 'Plastic bottle', e: '🧴', c: 0, l: 1, w: 'Plastic is an insulator.' },
    { n: 'Paper', e: '📄', c: 0, l: 1, w: 'Dry paper is an insulator.' },
    { n: 'Glass', e: '🥂', c: 0, l: 2, w: 'Glass does not let electricity flow.' },
    { n: 'Scissor blades', e: '✂️', c: 1, l: 2, w: 'The blades are metal. The handles are plastic!' },
    { n: 'Wool sock', e: '🧦', c: 0, l: 2, w: 'Wool is an insulator.' },
    { n: 'Brick', e: '🧱', c: 0, l: 2, w: 'Dry brick is an insulator.' },
    { n: 'Pencil lead (graphite)', e: '✏️', c: 1, l: 3, w: 'Graphite is a surprise conductor!' },
    { n: 'Salty water', e: '💧', c: 1, l: 3, w: 'Salt makes water carry electricity. Never mix water and mains power!' },
    { n: 'Aluminium foil', e: '🧻', c: 1, l: 3, w: 'Foil is metal.' },
    { n: 'Rubber band', e: '〰️', c: 0, l: 3, w: 'Rubber is an insulator.' },
    { n: 'Gold ring', e: '💍', c: 1, l: 3, w: 'Gold is a very good conductor.' },
    { n: 'Dry air', e: '🌬️', c: 0, l: 3, w: 'Air is an insulator. That is why we need wires.' }
  ];
  K.choiceGame({
    id: 'conductor', name: 'Conductor or Insulator', emoji: '🔩', blurb: 'Does electricity flow through it?', grades: 'Quest 1 · all ages',
    prompt: 'Conductor or insulator?',
    levels: [null, { label: 'Everyday things', ms: 11000 }, { label: 'A few tricky ones', ms: 11000 }, { label: 'Surprises', ms: 12000 }],
    makeSpec: function (rng, cfg, level) {
      var pool = STUFF.filter(function (x) { return x.l <= level; }), it = rng.pick(pool);
      return {
        question: it.n,
        visual: '<div class="ek-big" style="font-size:4.2rem">' + it.e + '</div>',
        choices: [{ v: 'c', label: '⚡ Conductor' }, { v: 'i', label: '🛑 Insulator' }],
        answer: it.c ? 'c' : 'i', cols: 2, big: false, explain: it.w
      };
    }
  });

  /* ======================== 3. Gate Guesser ======================== */
  var GATES = {
    NOT: function (a) { return a ? 0 : 1; },
    AND: function (a, b) { return a & b; }, OR: function (a, b) { return a | b; },
    NAND: function (a, b) { return (a & b) ? 0 : 1; }, NOR: function (a, b) { return (a | b) ? 0 : 1; },
    XOR: function (a, b) { return a ^ b; }, XNOR: function (a, b) { return (a ^ b) ? 0 : 1; }
  };
  var GATE_HINT = {
    NOT: 'NOT flips the signal.', AND: 'AND is 1 only when BOTH inputs are 1.', OR: 'OR is 1 when AT LEAST ONE input is 1.',
    NAND: 'NAND is AND, flipped: 0 only when both are 1.', NOR: 'NOR is OR, flipped: 1 only when both are 0.',
    XOR: 'XOR is 1 when the inputs are DIFFERENT.', XNOR: 'XNOR is 1 when the inputs are the SAME.'
  };
  G.gates = GATES; G.gateHint = GATE_HINT;
  function gateBox(name, ins) {
    return '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center">' +
      '<div>' + ins.map(function (v, i) { return chip((ins.length > 1 ? 'AB'.charAt(i) : 'A') + ' = ' + v, v ? SUN : '#fff'); }).join('<br>') + '</div>' +
      '<div style="font-size:1.6rem">➡</div>' +
      '<div style="min-width:110px;text-align:center;padding:14px 12px;border:4px solid ' + NAVY + ';border-radius:16px 38px 38px 16px;background:' + BLUE + ';color:#fff;font-weight:900;font-size:1.5rem">' + name + '</div>' +
      '<div style="font-size:1.6rem">➡</div>' + chip('OUT = ?', MINT) + '</div>';
  }
  K.choiceGame({
    id: 'gates', name: 'Gate Guesser', emoji: '🚪', blurb: 'What comes out of the logic gate?', grades: 'Quests 2 and 4',
    prompt: 'What is the output?',
    levels: [null,
      { label: 'NOT gate', ms: 11000, set: ['NOT'] },
      { label: 'AND and OR', ms: 12000, set: ['AND', 'OR'] },
      { label: 'NAND and NOR', ms: 13000, set: ['AND', 'OR', 'NAND', 'NOR'] },
      { label: 'All the gates + XOR', ms: 14000, set: ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'] },
      { label: 'Two gates together', ms: 18000, combo: true }
    ],
    makeSpec: function (rng, cfg) {
      var name, a = rng.int(0, 1), b = rng.int(0, 1), out;
      if (cfg.combo) {
        var c = rng.int(0, 1), kinds = [['AND', 'OR'], ['OR', 'AND'], ['NAND', 'OR'], ['NOR', 'AND'], ['XOR', 'AND']], k = rng.pick(kinds), mid = GATES[k[0]](a, b);
        out = GATES[k[1]](mid, c);
        return {
          question: '(A ' + k[0] + ' B) ' + k[1] + ' C',
          visual: '<div>' + chip('A = ' + a, a ? SUN : '#fff') + chip('B = ' + b, b ? SUN : '#fff') + chip('C = ' + c, c ? SUN : '#fff') + '</div>',
          choices: [{ v: 0, label: '0' }, { v: 1, label: '1' }], answer: out, cols: 2, big: true,
          explain: 'Brackets first: A ' + k[0] + ' B = ' + mid + '. Then ' + mid + ' ' + k[1] + ' ' + c + ' = ' + out + '.'
        };
      }
      name = rng.pick(cfg.set);
      out = name === 'NOT' ? GATES.NOT(a) : GATES[name](a, b);
      return {
        question: 'What does the ' + name + ' gate output?',
        visual: gateBox(name, name === 'NOT' ? [a] : [a, b]),
        choices: [{ v: 0, label: '0' }, { v: 1, label: '1' }], answer: out, cols: 2, big: true, explain: GATE_HINT[name]
      };
    }
  });

  /* ======================== 4. Which Gate? (truth tables) ======================== */
  function table(rows) {
    var cell = 'style="border:3px solid ' + NAVY + ';padding:4px 14px;font-family:JetBrains Mono,monospace;font-weight:900;font-size:1.2rem;text-align:center"';
    var th = 'style="border:3px solid ' + NAVY + ';padding:4px 14px;background:' + NAVY + ';color:#fff;font-weight:900"';
    return '<table style="border-collapse:collapse;background:#fff"><tr><th ' + th + '>A</th><th ' + th + '>B</th><th ' + th + '>OUT</th></tr>' +
      rows.map(function (r) { return '<tr><td ' + cell + '>' + r[0] + '</td><td ' + cell + '>' + r[1] + '</td><td ' + cell + '>' + r[2] + '</td></tr>'; }).join('') + '</table>';
  }
  K.choiceGame({
    id: 'whichgate', name: 'Which Gate?', emoji: '🕵️', blurb: 'Read the truth table, name the gate', grades: 'Quests 2 and 4',
    prompt: 'Which gate makes this table?',
    levels: [null,
      { label: 'AND or OR', ms: 16000, set: ['AND', 'OR'] },
      { label: 'Plus NAND and NOR', ms: 17000, set: ['AND', 'OR', 'NAND', 'NOR'] },
      { label: 'Plus XOR', ms: 18000, set: ['AND', 'OR', 'NAND', 'NOR', 'XOR'] }
    ],
    makeSpec: function (rng, cfg) {
      var name = rng.pick(cfg.set), rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (r) { return [r[0], r[1], GATES[name](r[0], r[1])]; });
      return {
        question: 'Which gate is this?', visual: table(rows),
        choices: cfg.set.map(function (n) { return { v: n, label: n }; }), answer: name, cols: cfg.set.length > 4 ? 3 : 2, big: false,
        explain: name + ': ' + GATE_HINT[name]
      };
    }
  });

  /* ======================== 5. Binary Buddy ======================== */
  function bitsHtml(n, bits, showVals) {
    var out = '<div style="display:flex;gap:8px;justify-content:center">', i, v;
    for (i = bits - 1; i >= 0; i--) {
      v = (n >> i) & 1;
      out += '<div style="text-align:center"><div style="width:44px;height:44px;border-radius:50%;border:4px solid ' + NAVY + ';background:' + (v ? SUN : '#e5e7eb') + ';box-shadow:' + (v ? '0 0 14px ' + SUN : 'none') + '"></div>' +
        (showVals ? '<div style="font-weight:900;font-size:.95rem;margin-top:2px">' + (1 << i) + '</div>' : '') + '</div>';
    }
    return out + '</div>';
  }
  function binStr(n, bits) { var s = n.toString(2); while (s.length < bits) s = '0' + s; return s; }
  K.choiceGame({
    id: 'binary', name: 'Binary Buddy', emoji: '🔢', blurb: 'Read the lights as a number', grades: 'Quest 2 · ages 6+',
    prompt: 'What number do the lights show?',
    levels: [null,
      { label: '2 lights', ms: 14000, bits: 2, vals: true, rev: 0 },
      { label: '3 lights', ms: 15000, bits: 3, vals: true, rev: 0.25 },
      { label: '4 lights', ms: 17000, bits: 4, vals: true, rev: 0.3 },
      { label: '4 lights, no hints', ms: 17000, bits: 4, vals: false, rev: 0.3 },
      { label: '5 lights', ms: 20000, bits: 5, vals: false, rev: 0.35 }
    ],
    makeSpec: function (rng, cfg) {
      var max = (1 << cfg.bits) - 1, n = rng.int(0, max), ch, i, set, m;
      if (rng() < cfg.rev) {
        set = [binStr(n, cfg.bits)];
        for (i = 0; i < 40 && set.length < 4; i++) { m = binStr(rng.int(0, max), cfg.bits); if (set.indexOf(m) < 0) set.push(m); }
        ch = set.sort().map(function (s) { return { v: s, label: s }; });
        return {
          question: 'Which lights show ' + n + '?',
          visual: cfg.vals ? '<div style="font-weight:800">Light values: ' + Array.apply(null, Array(cfg.bits)).map(function (_, k) { return 1 << (cfg.bits - 1 - k); }).join(' · ') + '</div>' : '',
          choices: ch, answer: binStr(n, cfg.bits), cols: 2, big: false, explain: n + ' is ' + binStr(n, cfg.bits) + ' in binary (1 = light on).'
        };
      }
      return {
        question: 'What number is this?', visual: bitsHtml(n, cfg.bits, cfg.vals),
        choices: G.numberChoices(rng, n, 4, 0, max), answer: n, big: true,
        explain: binStr(n, cfg.bits) + ' in binary is ' + n + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
