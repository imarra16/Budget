/* version du cache : a incrementer a chaque mise a jour */
const C = 'budget-v4';
const FICHIERS = ['./', './index.html', './manifest.json', './app.js', './ui.js', './form.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

/* supprime TOUS les anciens caches, sinon les vieux fichiers ressortent */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n !== C).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* reseau d'abord : on a toujours la derniere version, le cache ne sert que hors ligne */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copie = res.clone();
        caches.open(C).then(c => c.put(e.request, copie)).catch(() => {});
        return res;
      })
      .catch(() => caches.open(C).then(c => c.match(e.request)).then(r => r || caches.open(C).then(c => c.match('./index.html'))))
  );
});
