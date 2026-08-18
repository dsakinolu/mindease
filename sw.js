// MindEase service worker — offline-first PWA
const CACHE = "mindease-v1";
const ASSETS = [
  "./", "./index.html", "./design.html",
  "./css/app.css",
  "./js/app.js", "./js/showcase.js", "./js/showcase-data.js",
  "./images/sleepy-taco.png", "./images/icon-192.png", "./images/icon-512.png",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for our assets; network for everything else (fonts, article links)
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) =>
      hit ||
      fetch(e.request).then((res) => {
        const copy = res.clone();
        if (new URL(e.request.url).origin === location.origin) {
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
