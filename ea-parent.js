/* Electronics Adventure - parent area: progress, lesson plan, parts checklist, safety, settings. */
(function () {
  'use strict';
  const EA = window.EA, h = EA.h;
  const D = () => EA.D();
  const UNLOCK_MS = 10 * 60 * 1000;
  let tab = 'progress';

  function unlocked() {
    try {
      if (EA.fromHarbor && sessionStorage.getItem('ea_harbor_parent')) return true;
      const t = Number(sessionStorage.getItem('ea_unlock') || 0);
      return Date.now() - t < UNLOCK_MS;
    } catch (e) { return false; }
  }
  const unlock = () => { try { sessionStorage.setItem('ea_unlock', String(Date.now())); } catch (e) { } };

  function gate() {
    const d = D(); const real = d.pin || d.famPin;
    const wrap = h('div', null, EA.topbar('🔒 Parents', '/'));
    const msg = h('div', { class: 'feedback' });
    const inp = h('input', { class: 'inp mono', type: 'password', inputmode: 'numeric', maxlength: 4, placeholder: '••••', style: { textAlign: 'center', fontSize: '1.6rem', letterSpacing: '8px', maxWidth: '220px', margin: '0 auto', display: 'block' } });
    if (!real) {
      wrap.append(h('div', { class: 'card center' }, h('div', { class: 'bigem' }, '🔑'), h('h3', null, 'Set a parent PIN'), h('p', { class: 'muted small mt8' }, 'Four digits. It keeps the lesson plans and settings for grown-ups.'), h('div', { class: 'mt12' }, inp), msg,
        h('button', { class: 'btn mint mt12', onclick: () => { if (!/^\d{4}$/.test(inp.value)) { msg.textContent = 'Please use exactly 4 digits.'; msg.className = 'feedback bad'; return; } d.pin = inp.value; EA.save(); unlock(); EA.render(); } }, 'Save PIN')));
      return wrap;
    }
    const tryIt = () => {
      if (inp.value === d.pin || inp.value === d.famPin) { unlock(); EA.render(); }
      else if (inp.value.length === 4) { msg.textContent = 'That is not the PIN.'; msg.className = 'feedback bad'; inp.value = ''; EA.sfx.bad(); }
    };
    inp.addEventListener('input', tryIt);
    wrap.append(h('div', { class: 'card center' }, h('div', { class: 'bigem' }, '🔒'), h('h3', null, 'Grown-ups only'), h('p', { class: 'muted small mt8' }, 'Enter the parent PIN. If you joined a family code, the family PIN from Math Adventure also works.'), h('div', { class: 'mt12' }, inp), msg));
    setTimeout(() => inp.focus(), 50);
    return wrap;
  }

  function progressTab() {
    const d = D(); const box = h('div', null);
    d.profiles.forEach(p => {
      const pr = EA.PR(p.id);
      const rows = EA.units.map(u => {
        const st = EA.unitStatus(u, p.id);
        return h('tr', null, h('td', null, u.emoji + ' ' + EA.qnum(u)), h('td', null, st.labsDone + '/' + st.labsTotal), h('td', null, st.quizBest == null ? '—' : st.quizBest + '%'), h('td', null, st.mDone + '/' + st.mTotal), h('td', null, st.badge ? u.badge.emoji : '·'));
      });
      const bandSel = h('select', { class: 'inp', style: { width: 'auto', padding: '6px 10px' }, onchange: e => { p.band = e.target.value; EA.save(); EA.toast('Level changed'); } },
        EA.BANDS.map(b => h('option', { value: b.id, selected: b.id === p.band }, b.name + ' (' + b.ages + ')')));
      box.append(h('div', { class: 'card' },
        h('div', { class: 'row' }, h('span', { style: { fontSize: '2.2rem' } }, p.avatar), h('div', { style: { flex: 1 } }, h('b', null, p.name), h('div', { class: 'small muted' }, '⭐ ' + EA.totalStars(p.id) + ' stars · ' + Object.keys(pr.badges).length + '/7 badges')), bandSel),
        h('table', { class: 'plain mt12' }, h('thead', null, h('tr', null, ['Quest', 'Labs', 'Quiz', 'Missions', 'Badge'].map(x => h('th', null, x)))), h('tbody', null, rows))));
    });
    return box;
  }

  function planTab() {
    const d = D(); const box = h('div', null);
    box.append(h('p', { class: 'muted small' }, '35 sessions, about two a week. Predict, build, test, explain. Tap a name to tick a mission done for that explorer.'));
    EA.units.forEach(u => {
      box.append(h('h3', { class: 'sec', style: { color: u.color } }, u.emoji + ' ' + EA.qname(u) + ': ' + u.title));
      box.append(h('p', { class: 'small' }, h('b', null, 'Big question: '), u.bigQuestion, h('br'), h('b', null, 'They discover: '), u.answer));
      u.sessions.forEach((m, i) => {
        const key = 'u' + u.id + 's' + i;
        const chips = h('div', { class: 'wrapx mt8 noprint' });
        d.profiles.forEach(p => {
          const done = !!EA.PR(p.id).missions[key];
          const c = h('button', { class: 'chip btnlike', style: { background: done ? '#b9f3df' : '#eef2fb' } }, p.avatar + ' ' + p.name + (done ? ' ✔' : ''));
          c.onclick = () => { const pr = EA.PR(p.id); if (pr.missions[key]) delete pr.missions[key]; else pr.missions[key] = true; EA.save(); EA.render(); };
          chips.append(c);
        });
        box.append(h('details', { class: 'sess' }, h('summary', null, (i + 1) + '. ' + m.title),
          h('div', { class: 'in' }, h('p', { class: 'small' }, m.parent), m.parts ? h('div', { class: 'parts' }, m.parts.map(x => h('span', null, x))) : null,
            m.sprout ? h('p', { class: 'small mt8' }, '🌱 ', h('b', null, 'Sprouts corner: '), m.sprout) : null, chips)));
      });
    });
    box.append(h('h3', { class: 'sec' }, '🎓 Capstones & Demo Day'));
    EA.CAPSTONES.forEach(c => box.append(h('p', { class: 'small mt8' }, h('b', null, c.band + ': '), c.idea)));
    box.append(h('p', { class: 'small mt12' }, h('b', null, 'Demo Day. '), 'Each girl shows the family what it does, how it works, and one thing that went wrong and how she fixed it. Present the badges and take photos for the notebooks.'));
    box.append(h('button', { class: 'btn ghost mt16 noprint', onclick: () => document.querySelectorAll('details.sess').forEach(x => x.open = true) }, 'Open all'), ' ', h('button', { class: 'btn ghost mt16 noprint', onclick: () => { document.querySelectorAll('details.sess').forEach(x => x.open = true); window.print(); } }, '🖨 Print lesson plan'));
    return box;
  }

  function partsTab() {
    const d = D(); const box = h('div', null);
    box.append(h('p', { class: 'muted small' }, 'Tick what you have. Prices are rough guesses to budget with, not quotes. Use the part number (for example "74HC02") when searching. Anything labelled 74HC works on 5 V.'));
    const have = p => d.parts[p.id] != null ? d.parts[p.id] : p.have;
    const tbody = h('tbody', null);
    EA.PARTS.forEach(p => {
      const cb = h('input', { type: 'checkbox', checked: have(p) ? true : null, style: { width: '22px', height: '22px' } });
      cb.onchange = () => { d.parts[p.id] = cb.checked; EA.save(); };
      tbody.append(h('tr', null, h('td', null, cb), h('td', null, p.name), h('td', null, p.unit), h('td', null, p.qty), h('td', null, p.cost)));
    });
    box.append(h('div', { class: 'card', style: { overflowX: 'auto' } }, h('table', { class: 'plain' }, h('thead', null, h('tr', null, ['Have', 'Part', 'Quest', 'Qty', 'Approx cost'].map(x => h('th', null, x)))), tbody)));
    box.append(h('p', { class: 'small' }, 'Total new parts: roughly 80 to 120 EUR for a complete kit. Optional extras: Snap Circuits Jr. for the 3-year-old, Turing Tumble, copper tape.'));
    box.append(h('p', { class: 'small mt8' }, h('b', null, 'Storage: '), 'one tackle box with labelled compartments (resistors, LEDs, transistors, chips, wires), plus a separate clearly labelled box for the "big kid" tray.'));
    return box;
  }

  function safetyTab() {
    const box = h('div', null);
    box.append(h('p', { class: 'muted small' }, 'Everything in this course runs on 5 volts or less, so the real risks are small parts and batteries going into small mouths, not shocks.'));
    EA.SAFETY.forEach(([a, b]) => box.append(h('div', { class: 'card', style: { padding: '12px 14px', margin: '8px 0' } }, h('b', null, '⚠️ ' + a), h('div', { class: 'small muted mt8' }, b))));
    box.append(h('div', { class: 'card' }, h('b', null, 'Working with the youngest'), h('p', { class: 'small mt8' }, 'The 3-year-old (and later the 2-year-old) works on a separate "big kid" tray of oversized, chunky items only: a solar panel that runs a fan, big push buttons, bulbs or buzzers too large to swallow. Small components stay up high and the table is cleared before she joins. She does the exciting part (press the button, say "light on!") but never holds loose resistors, LEDs or transistors unsupervised. The 🌱 Sparks screens in this app are safe for her to play alone.')));
    box.append(h('div', { class: 'card' }, h('b', null, 'Three habits the girls say aloud'), h('ol', { class: 'small mt8', style: { paddingLeft: '20px' } }, h('li', null, '"Power off before I change anything."'), h('li', null, '"LEDs have a long leg (+) and a short leg (-)."'), h('li', null, '"Chips hate floating wires: every input is tied to something."'))));
    box.append(h('button', { class: 'btn ghost noprint', onclick: () => window.print() }, '🖨 Print safety rules'));
    return box;
  }

  function settingsTab() {
    const d = D(); const box = h('div', null);
    const sw = (label, key, after) => { const b = h('button', { class: 'chip btnlike' }, (d[key] ? '✅ ' : '⬜ ') + label); b.onclick = () => { d[key] = !d[key]; EA.save(); b.textContent = (d[key] ? '✅ ' : '⬜ ') + label; after && after(); }; return b; };
    box.append(h('div', { class: 'card' }, h('b', null, 'Sound & reading'), h('div', { class: 'wrapx mt8' }, sw('Sound effects', 'sound'), sw('Read-aloud voice', 'tts'))));
    // family
    const msg = h('div', { class: 'feedback' });
    const code = h('input', { class: 'inp', placeholder: 'MA-AB12', maxlength: 7, value: d.fam || '', autocapitalize: 'characters' });
    box.append(h('div', { class: 'card' }, h('b', null, '🏠 Family code'), h('p', { class: 'small muted mt8' }, d.fam ? 'Joined ' + d.fam + '. Progress syncs to the cloud.' : 'Join with the same code Math Adventure and Words Adventure use. Explorers and progress sync across devices.'), h('div', { class: 'mt8' }, code),
      h('div', { class: 'wrapx mt8' },
        h('button', { class: 'btn', onclick: async () => { msg.textContent = 'Working…'; msg.className = 'feedback'; const r = await EA.joinFamily(code.value); msg.textContent = r.msg; msg.className = 'feedback ' + (r.ok ? 'good' : 'bad'); } }, d.fam ? 'Re-join / refresh' : 'Join'),
        d.fam ? h('button', { class: 'btn ghost', onclick: async () => { msg.textContent = 'Syncing…'; const ok = await EA.syncNow(); msg.textContent = ok ? 'Synced ✔' : 'Could not sync right now.'; msg.className = 'feedback ' + (ok ? 'good' : 'bad'); } }, 'Sync now') : null,
        d.fam ? h('button', { class: 'btn ghost', onclick: () => { if (confirm('Leave this family on this device? Your progress stays saved in the cloud.')) { EA.leaveFamily(); EA.render(); } } }, 'Leave') : null), msg));
    // pin
    const pin = h('input', { class: 'inp mono', maxlength: 4, inputmode: 'numeric', placeholder: 'New 4-digit PIN', style: { maxWidth: '220px' } });
    box.append(h('div', { class: 'card' }, h('b', null, '🔑 Parent PIN'), h('div', { class: 'row mt8' }, pin, h('button', { class: 'btn', onclick: () => { if (!/^\d{4}$/.test(pin.value)) return EA.toast('Use exactly 4 digits'); d.pin = pin.value; EA.save(); pin.value = ''; EA.toast('PIN updated'); } }, 'Save'))));
    // explorers
    const ex = h('div', { class: 'card' }, h('b', null, '👧 Explorers'));
    d.profiles.forEach(p => ex.append(h('div', { class: 'row mt8' }, h('span', { style: { fontSize: '1.6rem' } }, p.avatar), h('span', { style: { flex: 1 } }, p.name),
      h('button', { class: 'chip btnlike', onclick: () => { if (confirm('Reset all of ' + p.name + '\'s progress? This cannot be undone.')) { d.prog[p.id] = { labs: {}, quiz: {}, missions: {}, badges: {} }; EA.save(); EA.render(); } } }, 'Reset progress'),
      h('button', { class: 'chip btnlike', onclick: () => { if (confirm('Remove ' + p.name + ' from this device?')) { d.profiles = d.profiles.filter(x => x.id !== p.id); delete d.prog[p.id]; if (d.cur === p.id) d.cur = d.profiles[0] ? d.profiles[0].id : null; EA.save(); EA.go(d.profiles.length ? '/parent' : '/welcome'); } } }, 'Remove'))));
    ex.append(h('button', { class: 'btn ghost mt12', onclick: () => EA.go('/who') }, '+ Add or switch explorer'));
    box.append(ex);
    // backup
    box.append(h('div', { class: 'card' }, h('b', null, '💾 Backup'), h('p', { class: 'small muted mt8' }, 'Save or restore this device\'s explorers and progress as a file.'),
      h('div', { class: 'wrapx mt8' },
        h('button', { class: 'btn ghost', onclick: () => { const blob = new Blob([JSON.stringify(d, null, 1)], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: 'electronics-adventure-backup.json' }); document.body.append(a); a.click(); a.remove(); } }, 'Download backup'),
        h('label', { class: 'btn ghost' }, 'Restore backup', h('input', { type: 'file', accept: '.json', class: 'hide', onchange: e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const j = JSON.parse(t); if (!j.profiles) throw 0; Object.assign(d, j); EA.save(); EA.toast('Restored'); EA.render(); } catch (x) { EA.toast('That file did not look right'); } }); } })))));
    box.append(h('p', { class: 'small muted center mt16' }, 'Electronics Adventure v' + EA.VERSION + ' · by Siler Technology'));
    box.append(h('button', { class: 'btn ghost wide mt12', onclick: () => { try { sessionStorage.removeItem('ea_unlock'); sessionStorage.removeItem('ea_harbor_parent'); } catch (e) { } EA.go('/'); } }, 'Lock & leave'));
    return box;
  }

  EA.screens.parent = function () {
    if (!unlocked()) return gate();
    const wrap = h('div', null, EA.topbar('Parent area', '/'));
    const body = h('div', null);
    const T = [['progress', '📊 Progress', progressTab], ['plan', '📅 Lesson plan', planTab], ['parts', '🧰 Parts', partsTab], ['safety', '⚠️ Safety', safetyTab], ['settings', '⚙️ Settings', settingsTab]];
    const tabs = h('div', { class: 'tabs mt12' });
    const draw = () => { tabs.innerHTML = ''; T.forEach(([id, label]) => tabs.append(h('button', { class: tab === id ? 'on' : '', onclick: () => { tab = id; draw(); show(); } }, label))); };
    const show = () => { body.innerHTML = ''; body.append(T.find(t => t[0] === tab)[2]()); };
    draw(); show(); wrap.append(tabs, body);
    return wrap;
  };
})();
