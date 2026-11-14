const CACHE = "arfa-v4";
const FILES = ["./", "./index.html", "./catatan.html", "./manifest.json", "./img/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  // Firebase jangan di-cache, biar data selalu baru
  if (e.request.url.includes("firebase") || e.request.url.includes("googleapis")) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// Klik notif HP -> buka aplikasi
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow("./index.html");
  }));
});