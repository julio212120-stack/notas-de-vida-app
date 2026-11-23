// Service worker: la app abre y graba aunque no haya internet.
const CACHE = "lv-estacion-v8";
const ARCHIVOS = ["./", "./index.html", "./libro.html", "./config.js", "./manifest.webmanifest", "./icono.svg",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.hostname.endsWith("supabase.co")) return; // datos: siempre en vivo
  // Primero la red (para recibir actualizaciones); si no hay internet, la copia guardada.
  e.respondWith(
    (url.origin === self.location.origin ? fetch(e.request.url, { cache: "no-store" }) : fetch(e.request)).then((resp) => {
      if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
      return resp;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
