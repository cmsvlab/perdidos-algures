// Perdidos Algures — service worker
// Atualização automática: o novo SW só assume quando a app manda (SKIP_WAITING),
// num momento seguro. O nome da cache muda a cada versão (injetado no build),
// para o browser detetar sempre que há uma versão nova.
const CACHE = 'perdidos-algures-2026.06.01-r68';

self.addEventListener('install', () => {
  // NÃO faz skipWaiting automático — espera a ordem da app (evita recarregar a meio).
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.url.includes('supabase.co')) return;

  const url = req.url;
  const isLib = url.includes('unpkg.com') || url.includes('cdn.jsdelivr.net') ||
                url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com');

  if (isLib) {
    // Bibliotecas (versão fixa): cache-first → arranque instantâneo.
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }))
    );
    return;
  }

  // App e restantes GET: network-first (versão mais recente) com fallback à cache (offline).
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
