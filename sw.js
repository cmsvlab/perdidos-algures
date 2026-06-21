// Perdidos Algures — service worker (v2)
// Estratégia: bibliotecas de CDN servidas da cache (re-arranque instantâneo no mobile),
// app via network-first (para receber atualizações), Supabase sempre direto.
const CACHE = 'perdidos-algures-v2';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.url.includes('supabase.co')) return;

  const url = req.url;
  const isLib = url.includes('unpkg.com') || url.includes('cdn.jsdelivr.net') ||
                url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');

  if (isLib) {
    // Cache-first: as bibliotecas têm versão fixa e nunca mudam → arranque instantâneo
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }))
    );
    return;
  }

  // App e restantes GET: network-first com fallback à cache (offline)
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
