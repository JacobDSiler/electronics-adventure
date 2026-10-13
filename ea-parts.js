/* Electronics Adventure - the parts catalogue, component pictures, the V-I-R triangle and the Little Sparks "name the part" toy.
 * Shared by Quest 1B labs, the games, and the unit page. Pictures are plain SVG strings built from fixed text. */
(function () {
  'use strict';
  const EA = window.EA, h = EA.h;
  const N = '#1A2E4A';
  const st = (c, w) => ' stroke="' + (c || N) + '" stroke-width="' + (w || 3) + '" stroke-linecap="round" stroke-linejoin="round"';
  const leg = (x, y1, y2) => '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '"' + st('#9aa5b8', 3) + '/>';
  const wrap = body => '<svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">' + body + '</svg>';

  /* each art() draws on a 100 x 100 canvas */
  const ART = {
    battery: () => '<rect x="42" y="12" width="16" height="10" rx="2" fill="#cfd6e2"' + st() + '/><rect x="28" y="20" width="44" height="70" rx="8" fill="#FFD166"' + st() + '/><rect x="28" y="62" width="44" height="28" rx="8" fill="#1A2E4A"/><text x="50" y="49" font-size="22" font-weight="900" text-anchor="middle" fill="#1A2E4A" font-family="Nunito,sans-serif">+</text><text x="50" y="83" font-size="22" font-weight="900" text-anchor="middle" fill="#fff" font-family="Nunito,sans-serif">−</text>',
    wire: () => '<path d="M12 72 C 30 18, 62 96, 88 30" fill="none"' + st('#FF6B6B', 8) + '/><path d="M12 72 C 30 18, 62 96, 88 30" fill="none"' + st('#ffd0d0', 2) + '/><circle cx="12" cy="72" r="5" fill="#e0a458"' + st() + '/><circle cx="88" cy="30" r="5" fill="#e0a458"' + st() + '/>',
    switch: () => '<rect x="10" y="62" width="80" height="22" rx="6" fill="#cfd6e2"' + st() + '/><circle cx="28" cy="62" r="5" fill="#e0a458"' + st() + '/><circle cx="72" cy="62" r="5" fill="#e0a458"' + st() + '/><line x1="28" y1="62" x2="66" y2="30"' + st('#FF6B6B', 7) + '/>',
    bulb: () => '<circle cx="50" cy="40" r="26" fill="#FFE8A3"' + st() + '/><path d="M40 52 l6 -14 l4 10 l4 -10 l6 14" fill="none"' + st('#c98a00', 3) + '/><rect x="38" y="64" width="24" height="16" rx="3" fill="#9aa5b8"' + st() + '/><rect x="42" y="80" width="16" height="9" rx="3" fill="#6b768a"' + st() + '/>',
    led: () => '<path d="M30 60 V36 a20 20 0 0 1 40 0 V60 Z" fill="#FF6B6B"' + st() + '/><rect x="26" y="60" width="48" height="7" rx="2" fill="#e24b4b"' + st() + '/>' + leg(40, 67, 94) + leg(60, 67, 82) + '<text x="22" y="92" font-size="14" font-weight="900" fill="#1A2E4A" font-family="Nunito,sans-serif">+</text>',
    buzzer: () => '<circle cx="50" cy="48" r="30" fill="#2a3f5f"' + st() + '/><circle cx="50" cy="48" r="7" fill="#0e1a2b"/><path d="M82 30 q8 18 0 36" fill="none"' + st('#06D6A0', 4) + '/><path d="M90 22 q14 26 0 52" fill="none"' + st('#06D6A0', 4) + '/>' + leg(38, 78, 94) + leg(62, 78, 94),
    motor: () => '<rect x="22" y="26" width="48" height="48" rx="10" fill="#cfd6e2"' + st() + '/><rect x="70" y="42" width="18" height="16" fill="#9aa5b8"' + st() + '/><circle cx="90" cy="50" r="4" fill="#FF6B6B"' + st() + '/><rect x="10" y="38" width="12" height="8" fill="#e0a458"' + st() + '/><rect x="10" y="56" width="12" height="8" fill="#e0a458"' + st() + '/><text x="46" y="57" font-size="22" font-weight="900" text-anchor="middle" fill="#1A2E4A" font-family="Nunito,sans-serif">M</text>',
    button: () => '<rect x="16" y="50" width="68" height="34" rx="8" fill="#cfd6e2"' + st() + '/><circle cx="50" cy="44" r="22" fill="#FF6B6B"' + st() + '/><ellipse cx="42" cy="36" rx="8" ry="5" fill="#ffd0d0"/>',
    resistor: () => '<line x1="6" y1="50" x2="26" y2="50"' + st('#9aa5b8', 4) + '/><line x1="74" y1="50" x2="94" y2="50"' + st('#9aa5b8', 4) + '/><rect x="24" y="34" width="52" height="32" rx="14" fill="#e8d3a8"' + st() + '/><rect x="34" y="34" width="6" height="32" fill="#a0522d"/><rect x="46" y="34" width="6" height="32" fill="#1A2E4A"/><rect x="58" y="34" width="6" height="32" fill="#e24b4b"/>',
    ldr: () => '<circle cx="50" cy="42" r="30" fill="#e8c28a"' + st() + '/><path d="M28 36 H72 M28 46 H72 M32 56 H68" fill="none"' + st('#8a5a1a', 4) + '/>' + leg(40, 72, 94) + leg(60, 72, 94) + '<text x="86" y="22" font-size="18">☀️</text>',
    pot: () => '<circle cx="50" cy="44" r="30" fill="#2D6BE4"' + st() + '/><circle cx="50" cy="44" r="18" fill="#cfd6e2"' + st() + '/><line x1="50" y1="44" x2="62" y2="30"' + st('#1A2E4A', 5) + '/>' + leg(30, 74, 94) + leg(50, 74, 94) + leg(70, 74, 94),
    capacitor: () => '<rect x="30" y="16" width="40" height="58" rx="8" fill="#2D6BE4"' + st() + '/><rect x="30" y="16" width="12" height="58" rx="4" fill="#b8cdf5"/><text x="56" y="52" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" font-family="Nunito,sans-serif">100µ</text>' + leg(40, 74, 94) + leg(60, 74, 86),
    transistor: () => '<path d="M26 74 V44 a24 24 0 0 1 48 0 V74 Z" fill="#2a3f5f"' + st() + '/><text x="50" y="62" font-size="11" font-weight="900" text-anchor="middle" fill="#cfd6e2" font-family="JetBrains Mono,monospace">BC547</text>' + leg(36, 74, 95) + leg(50, 74, 95) + leg(64, 74, 95),
    chip: () => { let p = ''; for (let i = 0; i < 7; i++) { p += '<rect x="6" y="' + (14 + i * 11) + '" width="16" height="6" rx="1.5" fill="#cfd6e2"/><rect x="78" y="' + (14 + i * 11) + '" width="16" height="6" rx="1.5" fill="#cfd6e2"/>'; } return p + '<rect x="20" y="8" width="60" height="84" rx="6" fill="#2a3f5f"' + st() + '/><path d="M42 8 a8 8 0 0 0 16 0" fill="#fdf6ee"' + st() + '/><text x="50" y="56" font-size="13" font-weight="900" text-anchor="middle" fill="#cfd6e2" font-family="JetBrains Mono,monospace">74HC</text>'; }
  };

  /* name, kid-sized job, one more clue, tier (1 = everyone, 2 = makers, 3 = engineers), what it looks like on a circuit diagram */
  EA.PART_LIST = [
    { id: 'battery', name: 'Battery', tier: 1, job: 'It pushes electricity round the circuit.', clue: 'It has a + end and a − end.', speak: 'This is a battery. It gives the push.' },
    { id: 'wire', name: 'Wire', tier: 1, job: 'It is the road that electricity travels along.', clue: 'Metal inside, plastic outside.', speak: 'This is a wire. Electricity runs along it.' },
    { id: 'switch', name: 'Switch', tier: 1, job: 'It opens or closes the loop: on and off.', clue: 'Flip it to turn things on.', speak: 'This is a switch. It turns things on and off.' },
    { id: 'bulb', name: 'Light bulb', tier: 1, job: 'It makes light when electricity flows through it.', clue: 'It glows!', speak: 'This is a light bulb. It glows.' },
    { id: 'led', name: 'LED', tier: 1, job: 'A tiny light that needs a resistor. It only works one way round.', clue: 'The long leg is plus.', speak: 'This is an L E D. A tiny light.' },
    { id: 'buzzer', name: 'Buzzer', tier: 1, job: 'It turns electricity into a beep.', clue: 'It makes a sound.', speak: 'This is a buzzer. It beeps.' },
    { id: 'motor', name: 'Motor', tier: 1, job: 'It turns electricity into spinning.', clue: 'It has a shaft that goes round.', speak: 'This is a motor. It spins.' },
    { id: 'button', name: 'Push button', tier: 1, job: 'A switch that is only on while you press it.', clue: 'Press it and let go.', speak: 'This is a push button. Press it!' },
    { id: 'resistor', name: 'Resistor', tier: 2, job: 'It squeezes the flow so parts do not get too much.', clue: 'Coloured stripes tell its size.', speak: 'This is a resistor. It squeezes the flow.' },
    { id: 'ldr', name: 'Light sensor (LDR)', tier: 2, job: 'Its resistance changes with light: it can tell light from dark.', clue: 'Squiggly track on top.', speak: 'This is a light sensor.' },
    { id: 'pot', name: 'Potentiometer (knob)', tier: 2, job: 'A resistor you can turn: a volume or dimmer knob.', clue: 'Three legs and a knob.', speak: 'This is a knob that changes the squeeze.' },
    { id: 'capacitor', name: 'Capacitor', tier: 2, job: 'A tiny rechargeable store that fills up and empties out.', clue: 'One leg is shorter, and it has a stripe.', speak: 'This is a capacitor. It stores a little electricity.' },
    { id: 'transistor', name: 'Transistor', tier: 3, job: 'A switch with no moving parts: a tiny signal controls a bigger flow.', clue: 'Three legs: base, collector, emitter.', speak: 'This is a transistor. An electric switch.' },
    { id: 'chip', name: 'Chip (IC)', tier: 3, job: 'Many tiny transistors in one package, like logic gates.', clue: 'Notch at one end, pin 1 beside it.', speak: 'This is a chip. Full of tiny switches.' }
  ];
  EA.partById = id => EA.PART_LIST.find(p => p.id === id);
  EA.partSvg = id => wrap(ART[id]());
  EA.partArt = (id, size) => { const d = h('div', { class: 'partart', style: { width: (size || 90) + 'px', height: (size || 90) + 'px' }, 'aria-label': (EA.partById(id) || {}).name }); d.innerHTML = EA.partSvg(id); return d; };
  EA.partsForLevel = lvl => EA.PART_LIST.filter(p => p.tier <= (lvl >= 3 ? 3 : lvl >= 2 ? 2 : 1));

  /* ---------- resistor colour code ---------- */
  EA.COLORS = [
    { n: 'Black', c: '#111111', d: 0 }, { n: 'Brown', c: '#8B4513', d: 1 }, { n: 'Red', c: '#E24B4B', d: 2 }, { n: 'Orange', c: '#F29B38', d: 3 }, { n: 'Yellow', c: '#F5D327', d: 4 },
    { n: 'Green', c: '#2EAD5B', d: 5 }, { n: 'Blue', c: '#2D6BE4', d: 6 }, { n: 'Violet', c: '#8E4EC6', d: 7 }, { n: 'Grey', c: '#8c94a3', d: 8 }, { n: 'White', c: '#f4f4f4', d: 9 }
  ];
  EA.fmtOhms = v => v >= 1e6 ? (v / 1e6) + ' MΩ' : v >= 1000 ? (v / 1000) + ' kΩ' : v + ' Ω';
  /* value -> [digit1, digit2, multiplierExponent] (e.g. 4700 -> 4,7,2) */
  EA.bandsFor = v => { let e = 0, m = v; while (m >= 100) { m /= 10; e++; } if (m < 10) { m *= 10; e--; } return [Math.floor(m / 10), Math.round(m) % 10, e]; };
  EA.resistorSvg = function (value, w) {
    const b = EA.bandsFor(value), cols = [EA.COLORS[b[0]].c, EA.COLORS[b[1]].c, b[2] < 0 ? '#d4af37' : EA.COLORS[b[2]].c, '#d4af37'];
    const xs = [38, 52, 66, 86];
    return '<svg viewBox="0 0 130 56" width="' + (w || 220) + '" role="img" aria-label="resistor with four colour bands"><line x1="4" y1="28" x2="30" y2="28"' + st('#9aa5b8', 4) + '/><line x1="100" y1="28" x2="126" y2="28"' + st('#9aa5b8', 4) + '/><rect x="26" y="8" width="78" height="40" rx="18" fill="#e8d3a8"' + st() + '/>' +
      xs.map((x, i) => '<rect x="' + x + '" y="8" width="8" height="40" fill="' + cols[i] + '" stroke="' + N + '" stroke-width="1"/>').join('') + '</svg>';
  };

  /* ---------- the V-I-R triangle ---------- */
  EA.triangleSvg = function (hide, w) {
    const cell = (k, x, y) => '<text x="' + x + '" y="' + y + '" font-size="34" font-weight="900" text-anchor="middle" fill="' + (hide === k ? '#c23b3b' : N) + '" font-family="Baloo 2,Nunito,sans-serif">' + (hide === k ? '?' : k) + '</text>';
    return '<svg viewBox="0 0 200 170" width="' + (w || 200) + '" role="img" aria-label="Ohm\'s law triangle: V on top, I and R at the bottom"><polygon points="100,8 192,158 8,158" fill="#fff3c4"' + st(N, 5) + '/><line x1="38" y1="106" x2="162" y2="106"' + st(N, 4) + '/><line x1="100" y1="106" x2="100" y2="156"' + st(N, 4) + '/>' +
      cell('V', 100, 90) + cell('I', 66, 146) + cell('R', 134, 146) +
      (hide ? '<circle cx="' + (hide === 'V' ? 100 : hide === 'I' ? 66 : 134) + '" cy="' + (hide === 'V' ? 78 : 134) + '" r="26" fill="none" stroke="#c23b3b" stroke-width="3" stroke-dasharray="5 4"/>' : '') + '</svg>';
  };
  EA.mnemonicCard = function (u) {
    const m = u.mnemonic, d = h('div', { class: 'tri' });
    d.innerHTML = EA.triangleSvg(null, 150);
    return h('div', { class: 'card mnemo' }, h('h3', null, '🧠 Remember it!'),
      h('div', { class: 'row', style: { alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' } }, d,
        h('div', { style: { flex: 1, minWidth: '180px' } }, m.lines.map(l => h('p', { class: 'mt8' }, l)))),
      h('p', { class: 'mt8' }, h('b', null, m.phrase), ' ', EA.sayBtn(m.phrase)));
  };

  /* ---------- Little Sparks toy: find the part ---------- */
  EA.SPROUT_TOYS.parts = {
    emoji: '🔋', title: 'Find the Part', color: '#6BA539', run(stage) {
      const pool = EA.PART_LIST.filter(p => p.tier === 1 && ['battery', 'switch', 'bulb', 'buzzer', 'motor', 'wire'].indexOf(p.id) >= 0);
      let round = 0;
      function show() {
        stage.innerHTML = '';
        const target = EA.pick(pool), others = EA.shuffle(pool.filter(p => p !== target)).slice(0, 2), opts = EA.shuffle([target].concat(others));
        const say = h('div', { class: 'prompt', style: { fontSize: '1.8rem' } }, 'Find the ' + target.name.toLowerCase() + '!');
        EA.say('Find the ' + target.name);
        const grid = h('div', { class: 'row', style: { justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '14px' } });
        opts.forEach(o => {
          const b = h('button', { class: 'choice', style: { padding: '8px', width: '30%', minWidth: '96px' }, 'aria-label': o.name }, EA.partArt(o.id, 90));
          b.onclick = () => {
            if (o === target) { EA.sfx.ok(); EA.say(target.speak); EA.confetti && EA.confetti(); say.textContent = '⭐ ' + target.name + '!'; round++; setTimeout(show, 2200); }
            else { EA.sfx.bad(); b.style.opacity = .4; EA.say('Try again'); }
          };
          grid.append(b);
        });
        stage.append(say, grid);
      }
      show();
    }
  };
})();
