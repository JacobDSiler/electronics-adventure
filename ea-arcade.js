/* Electronics Adventure - Games hub: wires the EAGames engine (ea-games.js + game packs) into the app.
 * Solo works offline. Rooms (teamwork, face-off, race, "find a game", all families) need the Realtime Database,
 * loaded lazily; add ?mp=0 to the address to force solo only. */
(function () {
  'use strict';
  const EA = window.EA, h = EA.h, G = window.EAGames;
  if (!G) { EA.screens.games = () => h('div', { class: 'card' }, h('p', null, 'Games engine missing.')); return; }

  const BAND_LEVEL = { sprout: 1, spark: 1, maker: 2, engineer: 3 };
  const cur = () => { const p = EA.P(); return p ? { id: String(p.id), name: p.name, avatar: p.avatar } : null; };
  G.configure({
    getFamilyCode: () => (EA.D().fam || 'GUEST'),
    getPlayers: () => EA.D().profiles.map(p => ({ id: String(p.id), name: p.name, avatar: p.avatar })),
    getCurrentPlayer: cur,
    progress: {
      load: (pid, gid) => {
        let v = NaN; try { v = parseInt(localStorage.getItem('eagames.lv.' + pid + '.' + gid), 10); } catch (e) { }
        if (v > 0) return v;
        const p = EA.D().profiles.find(x => String(x.id) === String(pid));
        return BAND_LEVEL[(p || {}).band] || 1;
      },
      save: (pid, gid, lv) => { try { localStorage.setItem('eagames.lv.' + pid + '.' + gid, String(lv)); } catch (e) { } }
    },
    onResult: r => {
      const ratio = r.total ? r.correct / r.total : 0;
      EA.recordGame(r.game, ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1, r.correct, r.total);
    },
    onClose: () => { if (location.hash.indexOf('#/games') === 0) EA.render(); }
  });

  /* Realtime Database (compat SDK, same project as Math and Words), loaded once, only when the hub is opened. */
  let mpState = 0; // 0 = not tried, 1 = loading, 2 = ready, 3 = failed / off
  function loadScript(src) { return new Promise((ok, no) => { const el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = no; document.head.appendChild(el); }); }
  function loadMultiplayer() {
    if (mpState || /[?&]mp=0(&|$)/.test(location.search) || !navigator.onLine) return;
    mpState = 1;
    const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
    loadScript(base + 'firebase-app-compat.js').then(() => loadScript(base + 'firebase-database-compat.js')).then(() => {
      const cfg = Object.assign({}, EA.FIREBASE, { databaseURL: 'https://homeschool-math-default-rtdb.europe-west1.firebasedatabase.app' });
      const app = window.firebase.apps.find(a => a.name === 'ea-games') || window.firebase.initializeApp(cfg, 'ea-games');
      G.configure({ db: app.database() });
      mpState = 2;
    }).catch(() => { mpState = 3; });
  }

  EA.screens.games = function () {
    loadMultiplayer();
    const wrap = h('div', null);
    const pr = EA.PR() || { games: {} };
    wrap.append(EA.topbar('🎮 Electronics Games', '/', EA.starPill()));
    wrap.append(h('div', { class: 'card center' },
      h('div', { class: 'bigem' }, '🕹️'),
      h('h2', null, 'Pick a game!'),
      h('p', { class: 'muted mt8' }, 'Play on your own, or with family and friends: Teamwork, Face-off and Race.'),
      h('button', { class: 'btn big mint wide mt12', onclick: () => G.open() }, '🎮 Open the arcade'),
      h('button', { class: 'btn big wide mt12', onclick: () => G.open({ find: true }) }, '🔎 Find a game to join')));
    const grid = h('div', { class: 'agrid mt16' });
    Object.keys(G.games).forEach(id => {
      const g = G.games[id], st = (pr.games || {})[id], stars = st ? st.stars : 0;
      grid.append(h('button', { class: 'acard', onclick: () => G.open({ game: id }) },
        h('span', { class: 'em' }, g.emoji), h('b', null, g.name), h('span', { class: 'muted small' }, g.blurb),
        h('span', { class: 'astars' }, '⭐'.repeat(stars) + '☆'.repeat(3 - stars))));
    });
    wrap.append(grid);
    wrap.append(h('p', { class: 'muted small center mt16' }, 'Games get a little harder when you are on a roll, and easier if you are stuck. Ask a grown-up to help with the new words.'));
    return wrap;
  };
})();
