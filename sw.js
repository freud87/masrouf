const CACHE_NAME = 'masrouf-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './wallet.png',
  './wallet-512.png',
  './ferico.png',
  './sabico.png',
  './bg.jpg',
  './calculator.png',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css'
];

// Installation : Mise en cache des ressources statiques
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie Réseau d'abord (Network First) pour toujours avoir les données à jour, 
// avec repli sur le cache si pas de réseau.
self.addEventListener('fetch', (e) => {
  // Ne pas intercepter les requêtes de l'API Google Apps Script (POST / GET avec paramètres)
  if (e.request.url.includes('script.google.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si la réponse est valide, on la met à jour dans le cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // En cas de panne réseau, on cherche dans le cache
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si rien n'est trouvé pour une page, on peut renvoyer l'index
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
