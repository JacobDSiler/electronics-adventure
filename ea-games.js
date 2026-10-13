/*! Electronics Adventure Games engine (forked from Math Adventure ma-games.js) v0.3.0
 * -----------------------------------------------------------------------------
 * One plain <script> (no build step). Owns everything that is NOT game-specific:
 *   - game registry + level/adaptive-difficulty rules
 *   - seeded RNG so every device generates the same rounds from one room seed
 *   - modes: solo, coop (teamwork), versus (face-off), race
 *   - rooms (Firebase Realtime Database, compat SDK) + local solo transport
 *   - menu / lobby / HUD / results UI in a full-screen overlay
 *
 * Wire-up in Math Adventure (see ea-games-demo.html):
 *
 *   EAGames.configure({
 *     db: firebase.database(),                 // homeschool-math DB; omit = solo only
 *     getFamilyCode: function(){ return 'WORD-1234'; },
 *     getPlayers:    function(){ return [{id:'p1', name:'Ailbhe', avatar:'🦊'}]; },
 *     getCurrentPlayer: function(){ return null; },   // return a player to skip "Who's playing?"
 *     progress: { load:function(pid,gameId){...}, save:function(pid,gameId,level){...} }, // optional
 *     onResult: function(r){ ... }              // award stars / XP in Math Adventure
 *   });
 *   EAGames.open();                  // or EAGames.open({game:'blockcount'})
 *
 * Realtime DB layout (all ephemeral):
 *   elecGameRooms/{CODE}/{meta, players, state, answers/{round}/{playerId}, progress}
 *   elecGameRoomsByFamily/{familyCode}/{CODE}  -> {game, mode, host, t}   (open-room list)
 * Suggested rules while prototyping (codes are random + rooms are short-lived):
 *   "gameRooms":{"$c":{".read":true,".write":true}},
 *   "elecGameRoomsByFamily":{"$f":{".read":true,".write":true}}
 *
 * Game plugin contract (see ma-game-blockcount.js):
 *   EAGames.register({ id,name,emoji,blurb,grades, modes, rounds, maxLevel, maxDurationMs,
 *     levelLabel(level), makeRound(rng, level, roundIndex) -> spec{ durationMs, ... },
 *     create(el, host) -> { ready(spec), go(startAtServerMs), reveal(info), destroy() } })
 *   host = { now(), answer(ok), sfx, mode }
 */
(function (root) {
  'use strict';

  var EAGames = root.EAGames = { version: '0.3.0', games: {}, cfg: {}, _logic: {} };
  var GAP = 1800;     // pause before a round starts (ms)
  var REVEAL = 1800;  // how long the answer is shown before moving on (ms)
  var GRACE = 2500;   // extra wait for slow / vanished players (ms)

  /* ============================== helpers ============================== */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k === 'style') el.style.cssText = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  /* ---------- seeded RNG: same seed string -> same numbers everywhere ---------- */
  function xmur3(str) {
    var i, hh = 1779033703 ^ str.length;
    for (i = 0; i < str.length; i++) { hh = Math.imul(hh ^ str.charCodeAt(i), 3432918353); hh = (hh << 13) | (hh >>> 19); }
    return function () {
      hh = Math.imul(hh ^ (hh >>> 16), 2246822507);
      hh = Math.imul(hh ^ (hh >>> 13), 3266489909);
      return (hh ^= hh >>> 16) >>> 0;
    };
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  EAGames.rng = function (seed) {
    var r = mulberry32(xmur3(String(seed))());
    r.int = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    r.pick = function (arr) { return arr[Math.floor(r() * arr.length)]; };
    r.shuffle = function (arr) {
      var a = arr.slice(), i, j, t;
      for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    };
    return r;
  };

  /* answer buttons: the right answer + near misses, sorted so positions are predictable */
  EAGames.numberChoices = function (rng, answer, n, lo, hi) {
    var set = [answer], tries = 0, v;
    while (set.length < n && tries++ < 80) {
      v = answer + rng.int(-3, 3);
      if (v >= lo && v <= hi && set.indexOf(v) < 0) set.push(v);
    }
    for (v = lo; set.length < n && v <= hi; v++) if (set.indexOf(v) < 0) set.push(v);
    return set.sort(function (a, b) { return a - b; });
  };

  /* ============================== sound ============================== */
  var ac = null, muted = false;
  function beep(freq, dur, type, vol, delay) {
    if (muted) return;
    try {
      ac = ac || new (root.AudioContext || root.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + (delay || 0);
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
    } catch (e) { /* audio is a nice-to-have */ }
  }
  EAGames.sfx = {
    ok: function () { beep(660, 0.12); beep(880, 0.2, 'sine', 0.15, 0.1); },
    no: function () { beep(200, 0.28, 'triangle', 0.18); },
    step: function () { beep(320, 0.04, 'square', 0.035); },
    win: function () { beep(523, 0.14); beep(659, 0.14, 'sine', 0.15, 0.14); beep(784, 0.3, 'sine', 0.15, 0.28); },
    toggle: function () { muted = !muted; return muted; }
  };

  /* ============================== registry ============================== */
  EAGames.configure = function (c) { for (var k in c) EAGames.cfg[k] = c[k]; return EAGames; };

  EAGames.register = function (def) {
    if (!def || !def.id || !def.makeRound || !def.create) throw new Error('EAGames.register: id, makeRound and create are required');
    def.rounds = def.rounds || 10;
    def.maxLevel = def.maxLevel || 1;
    def.modes = def.modes || ['solo', 'coop', 'versus', 'race'];
    def.maxDurationMs = def.maxDurationMs || 10000;
    EAGames.games[def.id] = def;
    return def;
  };

  /* ============================== identity & progress ============================== */
  function familyCode() { return (EAGames.cfg.getFamilyCode && EAGames.cfg.getFamilyCode()) || 'GUEST'; }
  // which family's room list this device looks at: an override chosen on this device, else the app's family code
  function lobbyFamily() {
    try { var o = localStorage.getItem('eagames.lobbyFam'); if (o) return o; } catch (e) { /* ignore */ }
    return String(familyCode()).trim().toUpperCase();
  }
  function setLobbyFamily(c) {
    c = String(c || '').trim().toUpperCase();
    try { if (c) localStorage.setItem('eagames.lobbyFam', c); else localStorage.removeItem('eagames.lobbyFam'); } catch (e) { /* ignore */ }
  }
  function listPlayers() { return (EAGames.cfg.getPlayers && EAGames.cfg.getPlayers()) || []; }
  function safeId(s) { return String(s).replace(/[.$#\[\]\/\s]/g, '_'); }
  function mkPlayer(p) {
    return { id: safeId(familyCode() + '_' + p.id), pid: p.id, fam: familyCode(), name: p.name || 'Player', avatar: p.avatar || '🙂', level: 1 };
  }
  function loadLevel(gid, pid) {
    try {
      var p = EAGames.cfg.progress;
      var v = p && p.load ? p.load(pid, gid) : parseInt(root.localStorage.getItem('eagames.lv.' + pid + '.' + gid), 10);
      return v > 0 ? v : 1;
    } catch (e) { return 1; }
  }
  function saveLevel(gid, pid, lv) {
    try {
      var p = EAGames.cfg.progress;
      if (p && p.save) p.save(pid, gid, lv); else root.localStorage.setItem('eagames.lv.' + pid + '.' + gid, String(lv));
    } catch (e) { /* ignore */ }
  }
  function newSeed() { return Math.random().toString(36).slice(2, 10); }
  function makeCode() {
    var L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', s = '', i;
    for (i = 0; i < 4; i++) s += L.charAt(Math.floor(Math.random() * L.length));
    return s;
  }

  /* ============================== pure game logic (unit-testable) ============================== */
  var L = EAGames._logic;

  L.pts = function (a) { return 10 + Math.round(5 * (a.left || 0)); };

  // Has this round finished for the whole room? Every client computes the same answer from the same data.
  L.resolveRound = function (mode, room, i, now, graceMs) {
    var ans = (room.answers && room.answers[i]) || {};
    var ids = Object.keys(ans);
    var n = Object.keys(room.players || {}).length;
    var allOk = ids.length >= n && ids.length > 0 && ids.every(function (id) { return ans[id].ok; });
    var r = { done: false, winner: null, allOk: allOk, timedOut: false };
    if (mode === 'versus') {
      var w = ids.filter(function (id) { return ans[id].ok; })
        .sort(function (a, b) { return (ans[a].t - ans[b].t) || (a < b ? -1 : 1); });
      if (w.length) { r.done = true; r.winner = w[0]; return r; }
    }
    if (ids.length >= n) { r.done = true; return r; }
    if (now > ((room.state && room.state.roundStartAt) || 0) + graceMs) { r.done = true; r.timedOut = true; }
    return r;
  };

  // Scores after `count` finished rounds.
  L.tally = function (mode, room, count) {
    var ids = Object.keys(room.players || {}), scores = {}, perfect = 0, i, sum = 0;
    ids.forEach(function (id) { scores[id] = 0; });
    if (mode === 'race') {
      var pr = room.progress || {};
      ids.forEach(function (id) { scores[id] = (pr[id] && pr[id].score) || 0; sum += scores[id]; });
      return { scores: scores, perfect: 0, team: sum };
    }
    for (i = 0; i < count; i++) {
      var ans = (room.answers && room.answers[i]) || {};
      var res = L.resolveRound(mode, room, i, Infinity, 0);
      if (mode === 'versus') {
        if (res.winner && scores[res.winner] != null) scores[res.winner] += 1;
      } else {
        Object.keys(ans).forEach(function (id) { if (ans[id].ok && scores[id] != null) scores[id] += L.pts(ans[id]); });
        if (res.allOk) perfect++;
      }
    }
    ids.forEach(function (id) { sum += scores[id]; });
    return { scores: scores, perfect: perfect, team: sum + perfect * 5 };
  };

  /* ============================== transports ============================== */
  function LocalTransport() { this.room = null; this.cb = null; }
  LocalTransport.prototype = {
    now: function () { return Date.now(); },
    emit: function () { var s = this; if (s.cb) setTimeout(function () { if (s.cb) s.cb(JSON.parse(JSON.stringify(s.room))); }, 0); },
    create: function (meta, player) {
      this.room = { meta: meta, players: {}, state: { phase: 'lobby', round: -1 }, answers: {}, progress: {} };
      this.room.players[player.id] = player;
      return Promise.resolve('LOCAL');
    },
    join: function () { return Promise.reject(new Error('Local games cannot be joined')); },
    listen: function (cb) { this.cb = cb; this.emit(); return function () { }; },
    setPlayer: function (id, patch) { Object.assign(this.room.players[id], patch); this.emit(); return Promise.resolve(); },
    start: function () { this.room.state = { phase: 'play', round: 0, roundStartAt: Date.now() + GAP + 600 }; this.emit(); return Promise.resolve(); },
    submit: function (i, id, data) {
      var a = this.room.answers; a[i] = a[i] || {};
      if (!a[i][id]) { a[i][id] = Object.assign({ t: Date.now() }, data); this.emit(); }
      return Promise.resolve();
    },
    advance: function (from, patch) {
      if (this.room.state.round !== from) return Promise.resolve(false);
      this.room.state = patch; this.emit(); return Promise.resolve(true);
    },
    progress: function (id, data) { this.room.progress[id] = data; this.emit(); return Promise.resolve(); },
    restart: function (seed) {
      this.room.meta.seed = seed; this.room.answers = {}; this.room.progress = {};
      this.room.state = { phase: 'play', round: 0, roundStartAt: Date.now() + GAP + 600 };
      this.emit(); return Promise.resolve();
    },
    leave: function () { this.cb = null; return Promise.resolve(); }
  };

  function FirebaseTransport(db, family) {
    var s = this;
    s.db = db; s.family = family; s.offset = 0; s.ref = null; s.code = null; s.off = null;
    try { db.ref('.info/serverTimeOffset').on('value', function (sn) { s.offset = sn.val() || 0; }); } catch (e) { /* ignore */ }
  }
  FirebaseTransport.prototype = {
    now: function () { return Date.now() + this.offset; },
    attach: function (code, player) {
      this.code = code; this.ref = this.db.ref('elecGameRooms/' + code);
      // if a device drops off, remove them so rounds never wait on a ghost
      this.ref.child('players/' + player.id).onDisconnect().remove();
    },
    create: function (meta, player) {
      var s = this, TS = root.firebase.database.ServerValue.TIMESTAMP, code = makeCode();
      meta.family = s.family;
      var ref = s.db.ref('elecGameRooms/' + code);
      return ref.child('meta').once('value').then(function (sn) {
        if (sn.exists()) return s.create(meta, player); // code collision: roll again
        var room = { meta: meta, players: {}, state: { phase: 'lobby', round: -1 }, createdAt: TS };
        room.players[player.id] = player;
        return ref.set(room).then(function () {
          s.attach(code, player);
          var ix = s.db.ref('elecGameRoomsByFamily/' + s.family + '/' + code);
          ix.set({ game: meta.game, mode: meta.mode, host: player.name, hostAvatar: player.avatar || '', n: 1, t: TS });
          ix.onDisconnect().remove();
          if (meta.public !== false) { // also listed for every family; harmless if the public list is not enabled yet
            var px = s.db.ref('elecGameRoomsPublic/' + code);
            px.set({ game: meta.game, mode: meta.mode, host: player.name, hostAvatar: player.avatar || '', n: 1, t: TS, fam: s.family }).catch(function () { });
            px.onDisconnect().remove();
          }
          return code;
        });
      });
    },
    join: function (code, player) {
      var s = this; code = String(code || '').toUpperCase().trim();
      var ref = s.db.ref('elecGameRooms/' + code);
      return ref.once('value').then(function (sn) {
        var r = sn.val();
        if (!r) throw new Error('No room with that code');
        if (r.state && r.state.phase === 'done' && !(r.players && r.players[player.id])) throw new Error('That game just finished. Ask the host to play again.');
        s.attach(code, player);
        return ref.child('players/' + player.id).set(player).then(function () { return { code: code, meta: r.meta }; });
      });
    },
    listen: function (cb) {
      var s = this, fn = s.ref.on('value', function (sn) { cb(sn.val()); });
      s.off = function () { s.ref.off('value', fn); };
      return s.off;
    },
    setPlayer: function (id, patch) { return this.ref.child('players/' + id).update(patch); },
    closeIndex: function () {
      this.db.ref('elecGameRoomsPublic/' + this.code).remove().catch(function () { });
      return this.db.ref('elecGameRoomsByFamily/' + this.family + '/' + this.code).remove();
    },
    setCount: function (n) {
      var s = this;
      s.db.ref('elecGameRoomsPublic/' + s.code + '/n').set(n).catch(function () { });
      return s.db.ref('elecGameRoomsByFamily/' + s.family + '/' + s.code + '/n').set(n);
    },
    start: function () {
      var s = this;
      s.db.ref('elecGameRoomsByFamily/' + s.family + '/' + s.code + '/started').set(true);
      s.db.ref('elecGameRoomsPublic/' + s.code + '/started').set(true).catch(function () { });
      return s.ref.child('state').transaction(function (st) {
        if (st && st.phase === 'lobby') return { phase: 'play', round: 0, roundStartAt: s.now() + GAP + 600 };
        return undefined;
      });
    },
    submit: function (i, id, data) {
      data.t = root.firebase.database.ServerValue.TIMESTAMP;
      return this.ref.child('answers/' + i + '/' + id).set(data);
    },
    // Any client may advance; the transaction lets exactly one win.
    advance: function (from, patch) {
      return this.ref.child('state').transaction(function (st) {
        if (st && st.phase === 'play' && st.round === from) return patch;
        return undefined;
      });
    },
    progress: function (id, data) { return this.ref.child('progress/' + id).set(data); },
    restart: function (seed) {
      return this.ref.update({
        'meta/seed': seed, answers: null, progress: null,
        state: { phase: 'play', round: 0, roundStartAt: this.now() + GAP + 600 }
      });
    },
    leave: function (id, isHost) {
      var ref = this.ref, s = this;
      if (s.off) s.off();
      if (!ref) return Promise.resolve();
      if (isHost) { s.db.ref('elecGameRoomsByFamily/' + s.family + '/' + s.code).remove(); s.db.ref('elecGameRoomsPublic/' + s.code).remove().catch(function () { }); }
      ref.child('players/' + id).onDisconnect().cancel();
      return ref.child('players/' + id).remove()
        .then(function () { return ref.child('players').once('value'); })
        .then(function (sn) { if (!sn.exists()) return ref.remove(); }); // last one out turns off the lights
    }
  };
  // open rooms = this family's list + the public list (all families), merged by room code
  FirebaseTransport.watchFamily = function (db, fam, cb) {
    var famRooms = {}, pubRooms = {}, offs = [];
    function parse(v, out, pub) {
      Object.keys(v || {}).forEach(function (k) {
        var r = v[k];
        if (r && r.game && Date.now() - (r.t || 0) < 6 * 3600e3) out[k] = { code: k, game: r.game, mode: r.mode, host: r.host, avatar: r.hostAvatar, n: r.n || 1, t: r.t || 0, started: !!r.started, fam: r.fam || fam, pub: pub };
      });
    }
    function emit() {
      var all = {}, k;
      for (k in pubRooms) all[k] = pubRooms[k];
      for (k in famRooms) all[k] = famRooms[k];
      var out = Object.keys(all).map(function (c) { return all[c]; });
      out.sort(function (a, b) { return b.t - a.t; });
      cb(out);
    }
    var fref = db.ref('elecGameRoomsByFamily/' + fam), pref = db.ref('elecGameRoomsPublic');
    var ff = fref.on('value', function (sn) { famRooms = {}; parse(sn.val(), famRooms, false); emit(); }, function () { });
    var pf = pref.on('value', function (sn) { pubRooms = {}; parse(sn.val(), pubRooms, true); emit(); }, function () { /* public list not enabled yet */ });
    return function () { fref.off('value', ff); pref.off('value', pf); };
  };

  /* ============================== Match: one play-through ============================== */
  function Match(S, g, mode, me, t, isHost) {
    var M = this;
    M.S = S; M.g = g; M.mode = mode; M.me = me; M.t = t; M.isHost = isHost;
    M.kind = mode === 'solo' ? 'race' : mode;     // solo is a race against nobody
    M.level = me.level || 1; M.streak = 0; M.misses = 0;
    M.stats = { correct: 0, total: 0 };
    M.round = -1; M.revealedRound = -1; M.seed = null; M.room = null;
    M.finished = false; M.uiBuilt = false; M.answered = true; M.roundLive = false;
    M.host = {
      now: function () { return t.now(); },
      sfx: EAGames.sfx,
      mode: M.kind,
      answer: function (ok, info) { M.answer(ok, info); }
    };
  }

  Match.prototype.create = function () {
    var M = this, g = M.g;
    M.level = M.me.level = loadLevel(g.id, M.me.pid);
    var meta = { game: g.id, mode: M.mode, seed: newSeed(), hostId: M.me.id, rounds: g.rounds };
    M.t.create(meta, M.me).then(function () { M.run(); },
      function (e) { M.S.toast('Could not start: ' + (e && e.message || e)); });
  };

  Match.prototype.run = function () {
    var M = this;
    M.unlisten = M.t.listen(function (room) { M.onRoom(room); });
    M.poll = setInterval(function () { M.checkResolve(); }, 400);
  };

  Match.prototype.clearTimers = function () {
    clearTimeout(this.startT); clearTimeout(this.timeoutT); clearTimeout(this.advT);
  };

  Match.prototype.destroy = function () {
    var M = this;
    M.clearTimers(); clearInterval(M.poll);
    if (M.ctl) { M.ctl.destroy(); M.ctl = null; }
    if (M.unlisten) M.unlisten();
    M.t.leave(M.me.id, M.isHost);
  };

  Match.prototype.say = function (txt) { if (this.bannerEl) this.bannerEl.textContent = txt || '\u00a0'; };

  Match.prototype.resetForSeed = function (seed) {
    var M = this;
    M.seed = seed; M.finished = false; M.uiBuilt = false; M.round = -1; M.revealedRound = -1;
    M.raceStarted = false; M.resultSent = false; M.stats = { correct: 0, total: 0 };
    M.clearTimers();
    if (M.ctl) { M.ctl.destroy(); M.ctl = null; }
  };

  Match.prototype.onRoom = function (room) {
    var M = this, S = M.S;
    if (!room) { S.toast('That room closed'); return S.picker(); }
    M.room = room;
    var st = room.state || {};
    if (!M.mode) { M.mode = room.meta.mode; M.kind = M.mode === 'solo' ? 'race' : M.mode; M.host.mode = M.kind; }
    if (st.phase === 'lobby') {
      var cnt = Object.keys(room.players || {}).length;
      if (M.isHost && M.t.setCount && cnt !== M._cnt) { M._cnt = cnt; M.t.setCount(cnt); }
      return M.renderLobby(room);
    }
    if (M.isHost && M.t.setCount && st.phase === 'play') { var c2 = Object.keys(room.players || {}).length; if (c2 !== M._cnt) { M._cnt = c2; M.t.setCount(c2); } }
    if (room.meta.seed !== M.seed) M.resetForSeed(room.meta.seed);
    if (M.finished) return;
    if (M.kind === 'race') {
      if (!M.uiBuilt) M.buildPlayUI();
      if (!M.raceStarted) { M.raceStarted = true; M.raceRound = 0; M.raceScore = 0; M.armRace(); }
      M.renderScores(room);
      var pr = room.progress || {}, ids = Object.keys(room.players || {});
      if (ids.length && ids.every(function (id) { return pr[id] && pr[id].done; })) M.finish();
      return;
    }
    if (st.phase === 'done') { if (M.isHost && M.t.closeIndex && !M._closed) { M._closed = true; M.t.closeIndex(); } return M.finish(); }
    if (!M.uiBuilt) M.buildPlayUI();
    M.renderScores(room);
    if (st.round !== M.round) M.startSyncRound(st);
  };

  /* ---------- lobby ---------- */
  var MODE_NAME = { solo: 'Solo', coop: 'Teamwork', versus: 'Face-off', race: 'Race' };

  Match.prototype.setLevel = function (lv) {
    var M = this;
    M.level = clamp(lv, 1, M.g.maxLevel);
    M.t.setPlayer(M.me.id, { level: M.level });
  };

  Match.prototype.renderLobby = function (room) {
    var M = this, g = M.g, S = M.S, P = room.players || {}, ids = Object.keys(P);
    var lv = P[M.me.id] ? P[M.me.id].level : M.level;
    S.title.textContent = g.name;
    var nodes = [
      h('div', { class: 'eag-em big', text: g.emoji || '🎲' }),
      h('h2', { class: 'eag-h', text: MODE_NAME[M.mode] || '' }),
      h('div', { class: 'eag-sub', text: g.name + (M.mode === 'solo' ? '' : ' · everyone plays this game') })
    ];
    if (M.mode !== 'solo') {
      nodes.push(
        h('div', { class: 'eag-sub', text: 'Room code' }),
        h('div', { class: 'eag-code', text: M.t.code || '' }),
        h('div', { class: 'eag-sub', text: 'Everyone can find this under Find a game, or type the code.' })
      );
    }
    nodes.push(h('div', { class: 'eag-chips' }, ids.map(function (id) {
      return h('div', { class: 'eag-chip' + (id === M.me.id ? ' me' : '') }, [P[id].avatar + ' ' + P[id].name + ' · L' + (P[id].level || 1)]);
    })));
    nodes.push(h('div', { class: 'eag-lvl' }, [
      h('button', { class: 'eag-icon big', text: '−', 'aria-label': 'Easier', onclick: function () { M.setLevel(lv - 1); } }),
      h('div', { class: 'eag-lvt' }, [
        h('div', { class: 'eag-sub', text: 'Starting level' }),
        h('div', { class: 'eag-cn', text: lv + ' · ' + (g.levelLabel ? g.levelLabel(lv) : '') })
      ]),
      h('button', { class: 'eag-icon big', text: '+', 'aria-label': 'Harder', onclick: function () { M.setLevel(lv + 1); } })
    ]));
    nodes.push(h('div', { class: 'eag-sub', text: 'The game adjusts as you play: 3 right in a row goes up, 2 misses goes down.' }));
    if (M.isHost) {
      var alone = M.mode !== 'solo' && ids.length < 2;
      var go = h('button', { class: 'eag-btn', text: M.mode === 'solo' ? "Let's go!" : 'Start the game', onclick: function () { if (!alone) M.t.start(); } });
      if (alone) { go.disabled = true; go.setAttribute('aria-disabled', 'true'); }
      nodes.push(go);
      if (alone) nodes.push(h('div', { class: 'eag-sub', text: 'Waiting for another player to join. Share the code above, or they can tap Find a game.' }));
    }
    else nodes.push(h('div', { class: 'eag-sub', text: 'Waiting for the host to start…' }));
    nodes.push(h('button', { class: 'eag-btn alt', text: 'Back', onclick: function () { S.picker(); } }));
    S.set(nodes);
  };

  /* ---------- play ---------- */
  Match.prototype.buildPlayUI = function () {
    var M = this;
    M.hudRound = h('div', { class: 'eag-sub' });
    M.hudScores = h('div', { class: 'eag-chips' });
    M.bannerEl = h('div', { class: 'eag-banner', text: '\u00a0' });
    M.gameEl = h('div', { class: 'eag-game' });
    M.S.set([M.hudRound, M.hudScores, M.bannerEl, M.gameEl]);
    M.ctl = M.g.create(M.gameEl, M.host);
    M.uiBuilt = true;
  };

  Match.prototype.renderScores = function (room) {
    var M = this, st = room.state || {}, P = room.players || {}, ids = Object.keys(P), n = 0;
    if (M.kind !== 'race') n = st.phase === 'done' ? M.g.rounds : (M.revealedRound === st.round ? st.round + 1 : st.round);
    var T = L.tally(M.kind, room, n), chips = [];
    if (M.kind === 'coop') chips.push(h('div', { class: 'eag-chip team' }, ['⭐ Team ' + T.team]));
    ids.forEach(function (id) {
      chips.push(h('div', { class: 'eag-chip' + (id === M.me.id ? ' me' : '') }, [P[id].avatar + ' ' + P[id].name + ' ' + (T.scores[id] || 0)]));
    });
    M.hudScores.innerHTML = '';
    chips.forEach(function (c) { M.hudScores.appendChild(c); });
    var k = M.kind === 'race' ? (M.raceRound || 0) + 1 : (st.round || 0) + 1;
    M.hudRound.textContent = 'Round ' + Math.min(k, M.g.rounds) + ' of ' + M.g.rounds;
  };

  Match.prototype.armRound = function (i, spec, startAt) {
    var M = this;
    M.clearTimers();
    M.round = i; M.spec = spec; M.startAt = startAt; M.answered = false; M.roundLive = false;
    M.ctl.ready(spec);
    var wait = Math.max(0, startAt - M.t.now());
    M.startT = setTimeout(function () { M.roundLive = true; M.ctl.go(startAt); }, wait);
    M.timeoutT = setTimeout(function () { if (!M.answered) M.answer(false, { timeout: true }); }, wait + spec.durationMs);
  };

  Match.prototype.startSyncRound = function (st) {
    var M = this;
    M.revealedRound = -1;
    var spec = M.g.makeRound(EAGames.rng(M.seed + '|' + st.round + '|' + M.me.id), M.level, st.round);
    M.armRound(st.round, spec, st.roundStartAt);
    M.say('');
  };

  Match.prototype.adapt = function (ok) {
    var M = this;
    if (ok) {
      M.streak++; M.misses = 0;
      if (M.streak >= 3 && M.level < M.g.maxLevel) { M.level++; M.streak = 0; M.S.toast('⭐ Level up!'); }
    } else {
      M.streak = 0; M.misses++;
      if (M.misses >= 2 && M.level > 1) { M.level--; M.misses = 0; M.S.toast('Let’s try a little easier'); }
    }
  };

  Match.prototype.answer = function (ok, info) {
    var M = this;
    if (M.answered || !M.roundLive) return;
    M.answered = true; M.roundLive = false;
    var left = clamp(1 - (M.t.now() - M.startAt) / M.spec.durationMs, 0, 1);
    var data = { ok: !!ok, left: Math.round(left * 100) / 100 };
    if (info && info.timeout) data.timeout = true;
    M.stats.total++; if (ok) M.stats.correct++;
    M.adapt(ok);
    if (ok) EAGames.sfx.ok(); else EAGames.sfx.no();
    if (M.kind === 'race') return M.raceAnswered(ok, left);
    M.t.submit(M.round, M.me.id, data);
    if (M.kind === 'versus') M.say(ok ? 'Locked in! Did you beat them?' : 'Not quite, you are out this round');
    else M.say(ok ? 'Nice! Waiting for the team…' : 'Not quite. Waiting for the team…');
  };

  /* race / solo: each player runs their own clock, same seed */
  Match.prototype.armRace = function () {
    var M = this, g = M.g, i = M.raceRound;
    if (i >= g.rounds) {
      M.t.progress(M.me.id, { score: M.raceScore, round: g.rounds, done: true });
      return M.say('Finished! Waiting for the others…');
    }
    var spec = g.makeRound(EAGames.rng(M.seed + '|' + i), M.level, i);
    M.armRound(i, spec, M.t.now() + (i === 0 ? GAP : 600));
    M.say('');
  };

  Match.prototype.raceAnswered = function (ok, left) {
    var M = this, i = M.round, pts = ok ? L.pts({ left: left }) : 0;
    M.raceScore += pts;
    M.ctl.reveal({ round: i, kind: 'race', mine: { ok: ok, left: left } });
    M.say(ok ? '+' + pts + ' ⭐' : 'Not quite!');
    M.t.progress(M.me.id, { score: M.raceScore, round: i + 1, done: false });
    M.advT = setTimeout(function () { M.raceRound++; M.armRace(); }, REVEAL);
  };

  /* teamwork / face-off: the room resolves each round the same way on every device */
  Match.prototype.checkResolve = function () {
    var M = this, room = M.room;
    if (M.kind === 'race' || M.finished || !room || !M.ctl) return;
    var st = room.state;
    if (!st || st.phase !== 'play' || M.round !== st.round || M.revealedRound === st.round) return;
    var res = L.resolveRound(M.kind, room, st.round, M.t.now(), M.g.maxDurationMs + GRACE);
    if (!res.done) return;
    var i = st.round, P = room.players || {}, ans = (room.answers && room.answers[i]) || {};
    M.revealedRound = i; M.answered = true; M.roundLive = false; clearTimeout(M.timeoutT);
    M.ctl.reveal({ round: i, kind: M.kind, result: res, answers: ans, players: P, me: M.me.id, mine: ans[M.me.id] || null });
    if (M.kind === 'versus') {
      if (res.winner) { EAGames.sfx.win(); M.say(res.winner === M.me.id ? '🏆 You were first!' : '🏆 ' + (P[res.winner] ? P[res.winner].name : 'Someone') + ' was first!'); }
      else M.say('Nobody got it that time');
    } else {
      M.say(res.allOk ? '🎉 The whole team got it!' : 'So close. Keep going!');
      if (res.allOk) EAGames.sfx.win();
    }
    M.renderScores(room);
    var total = M.g.rounds;
    M.advT = setTimeout(function () {
      var n = i + 1;
      M.t.advance(i, n >= total ? { phase: 'done', round: n, roundStartAt: 0 } : { phase: 'play', round: n, roundStartAt: M.t.now() + GAP });
    }, REVEAL + Math.random() * 300);
  };

  /* ---------- results ---------- */
  Match.prototype.finish = function () {
    var M = this, g = M.g, S = M.S, room = M.room;
    if (M.finished) return;
    M.finished = true; M.clearTimers();
    if (M.ctl) { M.ctl.destroy(); M.ctl = null; }
    M.uiBuilt = false;
    var P = room.players || {}, T = L.tally(M.kind, room, g.rounds);
    var ids = Object.keys(P).sort(function (a, b) { return (T.scores[b] || 0) - (T.scores[a] || 0); });
    saveLevel(g.id, M.me.pid, M.level);
    if (!M.resultSent) {
      M.resultSent = true;
      try {
        if (EAGames.cfg.onResult) EAGames.cfg.onResult({
          game: g.id, mode: M.mode, playerId: M.me.pid, familyCode: M.me.fam, level: M.level,
          correct: M.stats.correct, total: M.stats.total, score: T.scores[M.me.id] || 0,
          team: T.team, players: ids.map(function (id) { return { id: P[id].pid, name: P[id].name, score: T.scores[id] || 0 }; })
        });
      } catch (e) { /* host app errors must not break the results screen */ }
    }
    var head;
    if (M.kind === 'coop') head = '🎉 Team score ' + T.team;
    else if (ids.length > 1 && T.scores[ids[0]] === T.scores[ids[1]]) head = "It's a tie!";
    else if (ids.length > 1) head = '🏆 ' + P[ids[0]].name + ' wins!';
    else head = 'Great playing!';
    var ratio = M.stats.total ? M.stats.correct / M.stats.total : 0;
    var stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    EAGames.sfx.win();
    var nodes = [
      h('h2', { class: 'eag-h', text: head }),
      h('div', { class: 'eag-stars', text: '⭐'.repeat(stars) + '☆'.repeat(3 - stars) }),
      h('div', { class: 'eag-sub', text: 'You got ' + M.stats.correct + ' of ' + M.stats.total + ' right' }),
      h('div', { class: 'eag-list' }, ids.map(function (id, k) {
        return h('div', { class: 'eag-row2' + (id === M.me.id ? ' me' : '') },
          [h('span', { text: (k + 1) + '. ' + P[id].avatar + ' ' + P[id].name }), h('b', { text: String(T.scores[id] || 0) })]);
      }))
    ];
    if (M.isHost) nodes.push(h('button', { class: 'eag-btn', text: 'Play again', onclick: function () { M.t.restart(newSeed()); } }));
    else nodes.push(h('div', { class: 'eag-sub', text: 'The host can start another round.' }));
    nodes.push(h('button', { class: 'eag-btn alt', text: 'More games', onclick: function () { S.picker(); } }));
    S.set(nodes);
  };

  /* ============================== Shell: menus in a full-screen overlay ============================== */
  function Shell() {
    var S = this;
    S.title = h('div', { class: 'eag-ttl', text: 'Electronics Games' });
    S.mute = h('button', { class: 'eag-icon', text: '🔊', 'aria-label': 'Sound', onclick: function () { S.mute.textContent = EAGames.sfx.toggle() ? '🔇' : '🔊'; } });
    S.body = h('div', { class: 'eag-body' });
    S.ov = h('div', { class: 'eag-ov' }, [
      h('div', { class: 'eag-top' }, [h('button', { class: 'eag-icon', text: '✕', 'aria-label': 'Close', onclick: function () { S.close(); } }), S.title, S.mute]),
      S.body
    ]);
    document.body.appendChild(S.ov);
  }
  Shell.prototype.set = function (nodes) {
    var b = this.body; b.innerHTML = '';
    nodes.forEach(function (n) { if (n) b.appendChild(n); });
    b.scrollTop = 0;
  };
  Shell.prototype.toast = function (txt) {
    var el = h('div', { class: 'eag-toast', text: txt });
    this.ov.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1900);
  };
  Shell.prototype.endMatch = function () {
    if (this.match) { this.match.destroy(); this.match = null; }
    if (this.unwatch) { this.unwatch(); this.unwatch = null; }
  };
  Shell.prototype.close = function () {
    if (this.unwatch) { this.unwatch(); this.unwatch = null; }
    this.endMatch();
    if (this.ov.parentNode) this.ov.parentNode.removeChild(this.ov);
    EAGames._shell = null;
    if (EAGames.cfg.onClose) EAGames.cfg.onClose();
  };

  function card(emoji, name, sub, tag, fn, wide) {
    return h('button', { class: 'eag-card' + (wide ? ' wide' : ''), onclick: fn }, [
      h('div', { class: 'eag-em', text: emoji }),
      h('div', { class: 'eag-ct' }, [h('div', { class: 'eag-cn', text: name }), sub ? h('div', { class: 'eag-cs', text: sub }) : null, tag ? h('div', { class: 'eag-tag', text: tag }) : null])
    ]);
  }

  Shell.prototype.picker = function () {
    var S = this; S.endMatch(); S.title.textContent = 'Electronics Games';
    var cards = Object.keys(EAGames.games).map(function (id) {
      var g = EAGames.games[id];
      return card(g.emoji || '🎲', g.name, g.blurb, g.grades, function () { S.who(g); });
    });
    var nodes = [h('h2', { class: 'eag-h', text: 'Pick a game!' })];
    if (S.unwatch) { S.unwatch(); S.unwatch = null; }
    if (EAGames.cfg.db) {
      var find = h('button', { class: 'eag-btn', text: '🔎 Find a game to join', onclick: function () { S.findGames(); } });
      nodes.push(find);
      S.unwatch = FirebaseTransport.watchFamily(EAGames.cfg.db, lobbyFamily(), function (rooms) {
        find.textContent = rooms.length ? '🔎 Find a game to join (' + rooms.length + ' open)' : '🔎 Find a game to join';
      });
    }
    nodes.push(h('div', { class: 'eag-grid' }, cards));
    S.set(nodes);
  };

  // the lobby: every open room in the family, whatever the game
  Shell.prototype.findGames = function () {
    var S = this;
    if (!S.me) return S.who(null, function () { S.findGames(); });
    var err = h('div', { class: 'eag-err' }), list = h('div', { class: 'eag-list' });
    var input = h('input', { class: 'eag-input code', maxlength: '4', placeholder: 'ABCD', autocapitalize: 'characters' });
    if (S.unwatch) S.unwatch();
    S.title.textContent = 'Game lobby';
    S.unwatch = FirebaseTransport.watchFamily(EAGames.cfg.db, lobbyFamily(), function (rooms) {
      list.innerHTML = '';
      rooms.forEach(function (r) {
        var g = EAGames.games[r.game]; if (!g) return;
        list.appendChild(card(g.emoji || '🎲', (r.host || 'Someone') + '’s ' + (MODE_NAME[r.mode] || r.mode), g.name + ' · ' + r.n + (r.n === 1 ? ' player' : ' players') + (r.started ? ' · already playing' : ' waiting') + (r.fam && r.fam !== lobbyFamily() ? ' · another family' : ''), r.started ? 'Jump in' : 'Join', function () { S.confirmJoin(r.code); }, true));
      });
      if (!list.children.length) list.appendChild(h('div', { class: 'eag-sub', text: 'No open games right now. Start one from any game and it shows up here for every family.' }));
    });
    var fam = lobbyFamily(), famIn = h('input', { class: 'eag-input code', maxlength: '24', placeholder: 'MA-1234', value: fam === 'GUEST' ? '' : fam });
    var famBox = h('div', { class: 'eag-row' }, [famIn, h('button', { class: 'eag-btn alt', text: 'Change', onclick: function () {
      var v = famIn.value.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,24}$/.test(v)) return S.toast('Family codes look like MA-1234');
      setLobbyFamily(v); S.findGames();
    } })]);
    S.set([
      h('h2', { class: 'eag-h', text: 'Open games' }),
      h('div', { class: 'eag-sub', text: 'Games from every family show here. ' + (fam === 'GUEST' ? 'This device is not linked to a family yet: type your family code to keep your own family at the top.' : 'Your family: ' + fam) }),
      famBox,
      list,
      h('div', { class: 'eag-sub', text: 'Playing with someone outside the family? Type their room code.' }),
      h('div', { class: 'eag-row' }, [input, h('button', { class: 'eag-btn alt', text: 'Look up', onclick: function () { S.confirmJoin(input.value, err); } })]),
      err,
      h('button', { class: 'eag-btn alt', text: 'Back', onclick: function () { S.picker(); } })
    ]);
  };

  // always show exactly which game and mode you are about to join
  Shell.prototype.confirmJoin = function (code, err, picked) {
    var S = this, db = EAGames.cfg.db; code = String(code || '').toUpperCase().trim();
    err = err || h('div', { class: 'eag-err' });
    if (!/^[A-Z]{4}$/.test(code)) { err.textContent = 'Room codes are 4 letters'; return; }
    err.textContent = '';
    db.ref('elecGameRooms/' + code).once('value').then(function (sn) {
      var r = sn.val();
      if (!r || !r.meta) throw new Error('No room with that code');
      var g = EAGames.games[r.meta.game];
      if (!g) throw new Error("This device doesn't have that game yet");
      if (r.state && r.state.phase === 'done' && !(r.players && r.players[S.me.id])) throw new Error('That game just finished. Ask the host to play again.');
      if (S.unwatch) { S.unwatch(); S.unwatch = null; }
      var P = r.players || {}, who = Object.keys(P).map(function (k) { return h('div', { class: 'eag-chip' }, [(P[k].avatar || '🙂') + ' ' + P[k].name]); });
      var nodes = [
        h('div', { class: 'eag-em big', text: g.emoji || '🎲' }),
        h('h2', { class: 'eag-h', text: g.name }),
        h('div', { class: 'eag-sub', text: MODE_NAME[r.meta.mode] + ' · room ' + code }),
        h('div', { class: 'eag-chips' }, who)
      ];
      if (picked && (picked.game !== g.id || picked.mode !== r.meta.mode)) {
        nodes.push(h('div', { class: 'eag-err', text: 'You picked ' + EAGames.games[picked.game].name + ' (' + MODE_NAME[picked.mode] + '), but this room is playing ' + g.name + ' (' + MODE_NAME[r.meta.mode] + ').' }));
      }
      nodes.push(
        r.state && r.state.phase === 'play' ? h('div', { class: 'eag-sub', text: 'This game is already going. You will jump in at the current question.' }) : null,
        h('button', { class: 'eag-btn', text: r.state && r.state.phase === 'play' ? 'Jump in' : 'Join this game', onclick: function () { S.joinRoom(code, err); } }),
        err,
        h('button', { class: 'eag-btn alt', text: 'Back', onclick: function () { S.findGames(); } })
      );
      S.set(nodes);
    }).catch(function (e) { err.textContent = e.message || String(e); });
  };

  Shell.prototype.who = function (g, after) {
    var S = this, cur = EAGames.cfg.getCurrentPlayer && EAGames.cfg.getCurrentPlayer();
    var go = after || function () { S.modes(g); };
    if (cur) { S.me = mkPlayer(cur); return go(); }
    var ps = listPlayers();
    var cards = ps.map(function (p) { return card(p.avatar || '🙂', p.name, '', '', function () { S.me = mkPlayer(p); go(); }); });
    cards.push(card('👋', 'Someone else', 'Visiting? Type a name', '', function () { S.guest(g, go); }));
    S.set([h('h2', { class: 'eag-h', text: "Who's playing?" }), h('div', { class: 'eag-grid' }, cards),
      h('button', { class: 'eag-btn alt', text: 'Back', onclick: function () { S.picker(); } })]);
  };

  Shell.prototype.guest = function (g, go) {
    var S = this, avatar = '🐱', AV = ['🐱', '🐶', '🦄', '🚀', '🐸', '🌟', '🎈', '🐼'];
    var input = h('input', { class: 'eag-input', maxlength: '14', placeholder: 'Your name' });
    var row = h('div', { class: 'eag-chips' }, AV.map(function (a) {
      var b = h('button', { class: 'eag-icon big' + (a === avatar ? ' sel' : ''), text: a, onclick: function () {
        avatar = a; Array.prototype.forEach.call(row.children, function (c) { c.classList.toggle('sel', c.textContent === a); });
      } });
      return b;
    }));
    S.set([h('h2', { class: 'eag-h', text: "What's your name?" }), input, row,
      h('button', { class: 'eag-btn', text: 'Next', onclick: function () {
        var n = input.value.trim(); if (!n) return S.toast('Type a name first');
        S.me = mkPlayer({ id: 'guest' + Math.random().toString(36).slice(2, 6), name: n, avatar: avatar }); go();
      } }),
      h('button', { class: 'eag-btn alt', text: 'Back', onclick: function () { S.who(g, go); } })]);
  };

  Shell.prototype.modes = function (g) {
    var S = this, online = !!EAGames.cfg.db; S.title.textContent = g.name;
    var defs = [
      ['solo', '🙋', 'Play solo', 'Just you, at your own pace'],
      ['coop', '🤝', 'Teamwork', 'Everyone answers before the blocks land'],
      ['versus', '⚡', 'Face-off', 'First correct answer wins the round'],
      ['race', '🏁', 'Race', 'Same questions. Who scores the most?']
    ];
    var cards = defs.filter(function (m) { return g.modes.indexOf(m[0]) >= 0 && (m[0] === 'solo' || online); })
      .map(function (m) { return card(m[1], m[2], m[3], '', function () { m[0] === 'solo' ? S.startSolo(g) : S.together(g, m[0]); }, true); });
    var nodes = [h('div', { class: 'eag-em big', text: g.emoji || '🎲' }), h('h2', { class: 'eag-h', text: g.name })].concat(cards);
    if (!online) nodes.push(h('div', { class: 'eag-sub', text: 'Playing together turns on once the app is connected to the internet database.' }));
    nodes.push(h('button', { class: 'eag-btn alt', text: 'Back', onclick: function () { S.picker(); } }));
    S.set(nodes);
  };

  Shell.prototype.startSolo = function (g) {
    var S = this;
    S.match = new Match(S, g, 'solo', S.me, new LocalTransport(), true);
    S.match.create();
  };

  Shell.prototype.together = function (g, mode) {
    var S = this, db = EAGames.cfg.db, fam = lobbyFamily();
    var err = h('div', { class: 'eag-err' });
    var list = h('div', { class: 'eag-list' });
    var input = h('input', { class: 'eag-input code', maxlength: '4', placeholder: 'ABCD', autocapitalize: 'characters' });
    if (S.unwatch) S.unwatch();
    S.unwatch = FirebaseTransport.watchFamily(db, fam, function (rooms) {
      list.innerHTML = '';
      rooms.filter(function (r) { return r.game === g.id && r.mode === mode; }).forEach(function (r) {
        list.appendChild(h('button', { class: 'eag-btn alt', text: (r.host || 'Someone') + '’s ' + MODE_NAME[mode] + ' · ' + r.n + (r.n === 1 ? ' player' : ' players') + (r.started ? ' · playing' : ''), onclick: function () { S.confirmJoin(r.code, err, { game: g.id, mode: mode }); } }));
      });
      if (!list.children.length) list.appendChild(h('div', { class: 'eag-sub', text: 'No open ' + MODE_NAME[mode] + ' games of ' + g.name + ' right now.' }));
    });
    S.set([
      h('h2', { class: 'eag-h', text: MODE_NAME[mode] }),
      h('button', { class: 'eag-btn', text: 'Start a new room', onclick: function () {
        if (S.unwatch) { S.unwatch(); S.unwatch = null; }
        S.me.level = loadLevel(g.id, S.me.pid);
        S.match = new Match(S, g, mode, S.me, new FirebaseTransport(db, fam), true);
        S.match.create();
      } }),
      h('div', { class: 'eag-sub', text: 'or join a ' + MODE_NAME[mode] + ' game of ' + g.name }), list,
      h('div', { class: 'eag-row' }, [input, h('button', { class: 'eag-btn alt', text: 'Join', onclick: function () { S.confirmJoin(input.value, err, { game: g.id, mode: mode }); } })]),
      err,
      h('button', { class: 'eag-btn alt', text: 'Back', onclick: function () { if (S.unwatch) { S.unwatch(); S.unwatch = null; } S.modes(g); } })
    ]);
  };

  Shell.prototype.joinRoom = function (code, err) {
    var S = this, db = EAGames.cfg.db, t = new FirebaseTransport(db, lobbyFamily());
    err.textContent = '';
    // level is set once we know which game the room is for
    t.db.ref('elecGameRooms/' + String(code || '').toUpperCase().trim() + '/meta').once('value').then(function (sn) {
      var meta = sn.val();
      if (!meta) throw new Error('No room with that code');
      var g = EAGames.games[meta.game];
      if (!g) throw new Error("This device doesn't have that game yet");
      S.me.level = loadLevel(g.id, S.me.pid);
      return t.join(code, S.me).then(function () { return { g: g, meta: meta }; });
    }).then(function (r) {
      if (S.unwatch) { S.unwatch(); S.unwatch = null; }
      S.match = new Match(S, r.g, r.meta.mode, S.me, t, false);
      S.match.level = S.me.level;
      S.match.run();
    }).catch(function (e) { err.textContent = e.message || String(e); });
  };

  /* ============================== styles ============================== */
  var CSS = [
    '.eag-ov{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;background:#ffe9c7;color:#1b2a49;font-family:ui-rounded,"Arial Rounded MT Bold","Nunito","Segoe UI",system-ui,sans-serif;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);-webkit-tap-highlight-color:transparent}',
    '.eag-ov *{box-sizing:border-box}',
    '.eag-top{display:flex;align-items:center;gap:8px;padding:10px 12px}',
    '.eag-ttl{flex:1;text-align:center;font-weight:900;font-size:1.15rem}',
    '.eag-icon{font:inherit;font-size:1.2rem;font-weight:900;width:44px;height:44px;border-radius:50%;border:3px solid #1b2a49;background:#fff;color:#1b2a49;cursor:pointer;box-shadow:0 3px 0 #1b2a49}',
    '.eag-icon.big{width:52px;height:52px;font-size:1.5rem}.eag-icon.sel{background:#ffd23f}',
    '.eag-icon:active{transform:translateY(3px);box-shadow:none}',
    '.eag-body{flex:1;overflow:auto;width:100%;max-width:640px;margin:0 auto;padding:6px 16px 28px;display:flex;flex-direction:column;gap:14px}',
    '.eag-h{margin:4px 0;text-align:center;font-size:1.7rem;font-weight:900}',
    '.eag-sub{text-align:center;font-size:.95rem;opacity:.8}',
    '.eag-em{font-size:2.4rem;text-align:center}.eag-em.big{font-size:3.4rem}',
    '.eag-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}',
    '.eag-card{font:inherit;color:inherit;background:#fff;border:3px solid #1b2a49;border-radius:20px;box-shadow:0 5px 0 #1b2a49;padding:14px 12px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}',
    '.eag-card:active{transform:translateY(4px);box-shadow:0 1px 0 #1b2a49}',
    '.eag-card.wide{flex-direction:row;text-align:left;gap:14px;padding:12px 16px}.eag-card.wide .eag-em{font-size:2rem}',
    '.eag-cn{font-weight:900;font-size:1.15rem}.eag-cs{font-size:.9rem;opacity:.75}',
    '.eag-tag{display:inline-block;margin-top:4px;padding:2px 10px;border-radius:999px;background:#3ddc97;border:2px solid #1b2a49;font-size:.78rem;font-weight:800}',
    '.eag-btn{font:inherit;font-weight:900;font-size:1.25rem;padding:14px 18px;border-radius:16px;border:3px solid #1b2a49;background:#ffd23f;color:#1b2a49;box-shadow:0 5px 0 #1b2a49;cursor:pointer;touch-action:manipulation}',
    '.eag-btn:active{transform:translateY(4px);box-shadow:0 1px 0 #1b2a49}.eag-btn.alt{background:#fff}',
    '.eag-btn:disabled{background:#cfd6e0;color:#7b879b;border-color:#7b879b;box-shadow:0 5px 0 #7b879b;cursor:not-allowed;transform:none}',
    '.eag-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}',
    '.eag-chip{background:#fff;border:3px solid #1b2a49;border-radius:999px;padding:3px 12px;font-weight:800}',
    '.eag-chip.me{background:#ffd23f}.eag-chip.team{background:#3ddc97}',
    '.eag-code{font-size:3rem;letter-spacing:.3em;padding-left:.3em;font-weight:900;text-align:center;background:#fff;border:3px dashed #1b2a49;border-radius:16px}',
    '.eag-lvl{display:flex;align-items:center;justify-content:center;gap:14px}.eag-lvt{text-align:center;min-width:170px}',
    '.eag-list{display:flex;flex-direction:column;gap:10px}',
    '.eag-row{display:flex;gap:10px}.eag-row .eag-input{flex:1}',
    '.eag-input{font:inherit;font-size:1.3rem;font-weight:800;padding:12px 14px;border-radius:14px;border:3px solid #1b2a49;background:#fff;color:#1b2a49;min-width:0}',
    '.eag-input.code{text-transform:uppercase;letter-spacing:.3em;text-align:center}',
    '.eag-err{color:#b3261e;font-weight:800;text-align:center;min-height:1.2em}',
    '.eag-banner{min-height:1.6em;text-align:center;font-weight:900;font-size:1.1rem}',
    '.eag-game{display:flex;flex-direction:column;align-items:center;gap:12px}',
    '.eag-stars{font-size:2.6rem;text-align:center;letter-spacing:.1em}',
    '.eag-row2{display:flex;justify-content:space-between;background:#fff;border:3px solid #1b2a49;border-radius:14px;padding:10px 14px;font-weight:800}',
    '.eag-row2.me{background:#ffd23f}',
    '.eag-toast{position:absolute;left:50%;top:70px;transform:translateX(-50%);background:#1b2a49;color:#fff;padding:10px 18px;border-radius:999px;font-weight:800;z-index:3;box-shadow:0 4px 0 rgba(0,0,0,.25)}',
    '@media (prefers-reduced-motion:reduce){.eag-ov *{transition:none!important;animation:none!important}}',
    '.eag-ov button:focus-visible,.eag-ov input:focus-visible{outline:4px solid #3a86ff;outline-offset:2px}'
  ].join('\n');

  function ensureCss() {
    if (document.getElementById('eag-css')) return;
    var s = document.createElement('style'); s.id = 'eag-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ============================== public entry ============================== */
  EAGames.open = function (opts) {
    opts = opts || {};
    ensureCss();
    if (EAGames._shell) EAGames._shell.close();
    var S = EAGames._shell = new Shell();
    var g = opts.game && EAGames.games[opts.game];
    if (g) S.who(g); else if (opts.find && EAGames.cfg.db) S.findGames(); else S.picker();
    return S;
  };

  // exposed for tests / future games
  EAGames._LocalTransport = LocalTransport;
  EAGames._FirebaseTransport = FirebaseTransport;
})(typeof window !== 'undefined' ? window : globalThis);
