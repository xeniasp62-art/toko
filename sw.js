const CACHE = "arfa-v7";
const FILES = ["./", "./index.html", "./warung.html", "./manifest.json", "./img/icon-192.png", "./img/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("firebase") || e.request.url.includes("googleapis")) return;
  e.respondWith(
    fetch(e.request).then(res => {
      // JANGAN simpan kalau 404 / gagal, ini yang dulu bikin keracunan
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow("./index.html");
  }));
});
