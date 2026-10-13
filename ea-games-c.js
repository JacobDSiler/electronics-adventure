/*! Electronics Games pack C: Part Match and Colour Code Challenge (Quest 1B). Needs ea-parts.js. */
(function (root) {
  'use strict';
  var G = root.EAGames, K = G && G.kit, EA = root.EA;
  if (!K || !EA || !EA.PART_LIST) throw new Error('Load ea-games.js, ea-game-kit.js and ea-parts.js before ea-games-c.js');

  /* ---- Part Match ---- */
  K.choiceGame({
    id: 'partmatch', name: 'Part Match', emoji: '🔋', blurb: 'Name the part, know its job', grades: 'Quest 1B · all ages',
    prompt: 'What is this part?',
    levels: [null,
      { label: 'Everyday parts', ms: 12000, tier: 1, kind: 'name' },
      { label: 'Plus resistors and sensors', ms: 13000, tier: 2, kind: 'name' },
      { label: 'Name it from its job', ms: 17000, tier: 2, kind: 'job' },
      { label: 'All the parts', ms: 17000, tier: 3, kind: 'job' }
    ],
    makeSpec: function (rng, cfg) {
      var pool = EA.PART_LIST.filter(function (p) { return p.tier <= cfg.tier; }), t = rng.pick(pool), i, names = [t], p;
      var others = rng.shuffle(pool.filter(function (p) { return p !== t; }));
      for (i = 0; i < others.length && names.length < 4; i++) names.push(others[i]);
      names = names.sort(function (a, b) { return a.name < b.name ? -1 : 1; });
      var ch = names.map(function (n) { return { v: n.id, label: n.name }; });
      if (cfg.kind === 'job') {
        return { question: 'Which part: “' + t.job + '”', visual: '', choices: ch, answer: t.id, cols: 2, big: false, explain: t.name + ': ' + t.job };
      }
      return { question: 'What is this part?', visual: '<div style="width:110px;height:110px">' + EA.partSvg(t.id) + '</div><div style="font-weight:800">Clue: ' + t.clue + '</div>', choices: ch, answer: t.id, cols: 2, big: false, explain: t.name + ': ' + t.job };
    }
  });

  /* ---- Colour Code Challenge ---- */
  var BASIC = [100, 220, 330, 470, 1000, 2200, 4700, 10000], MORE = [10, 47, 150, 680, 22000, 47000, 100000, 1000000];
  K.choiceGame({
    id: 'colorcode', name: 'Colour Code Challenge', emoji: '🌈', blurb: 'Read resistor stripes fast', grades: 'Quest 1B · ages 7+',
    prompt: 'How many ohms?',
    levels: [null,
      { label: 'Common values', ms: 18000, pool: BASIC },
      { label: 'All the values', ms: 20000, pool: BASIC.concat(MORE) },
      { label: 'Quick fire', ms: 12000, pool: BASIC.concat(MORE) }
    ],
    makeSpec: function (rng, cfg) {
      var v = rng.pick(cfg.pool), b = EA.bandsFor(v), set = [v], tries = 0, c, all = BASIC.concat(MORE);
      var seeds = [v * 10, v / 10, v * 100].filter(function (x) { return all.indexOf(x) >= 0; });
      seeds.forEach(function (x) { if (set.length < 4 && set.indexOf(x) < 0) set.push(x); });
      while (set.length < 4 && tries++ < 50) { c = rng.pick(cfg.pool); if (set.indexOf(c) < 0) set.push(c); }
      set.sort(function (a, b2) { return a - b2; });
      var cn = function (k) { return EA.COLORS[k].n.toLowerCase(); };
      return { question: 'What does this resistor read?', visual: EA.resistorSvg(v, 230),
        choices: set.map(function (x) { return { v: x, label: EA.fmtOhms(x) }; }), answer: v, cols: 2, big: false,
        explain: cn(b[0]) + ' ' + b[0] + ', ' + cn(b[1]) + ' ' + b[1] + ', then ' + (b[2] < 0 ? 'gold' : cn(b[2])) + ' → ' + EA.fmtOhms(v) + '.' };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
