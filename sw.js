/* Electronics Adventure service worker: the whole app works offline. Other origins (Firebase, fonts) are never intercepted. */
const CACHE = "ea-shell-v4";
const SHELL = ["./", "index.html", "ea-core.js", "ea-content.js", "ea-labs-a.js", "ea-labs-b.js", "ea-labs-c.js", "ea-games.js", "ea-game-kit.js", "ea-games-a.js", "ea-games-b.js", "ea-arcade.js", "ea-parts.js", "ea-content-ohm.js", "ea-labs-d.js", "ea-games-c.js", "ea-parent.js", "manifest.json", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // Network first so pushes show up quickly; fall back to cache offline.
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
