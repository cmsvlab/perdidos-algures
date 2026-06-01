// Perdidos Algures — service worker mínimo (network-first, com fallback à cache)
const CACHE = 'perdidos-algures-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Só GET; deixa passar pedidos a APIs (Supabase) sem cache
  if (req.method !== 'GET' || req.url.includes('supabase.co')) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        // Guarda cópia na cache para uso offline
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
