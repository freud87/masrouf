const CACHE_NAME = "masrouf-v2"; // ⚠️ incrémenté pour forcer le rafraîchissement
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./wallet.png",
  "./bg.jpg",
  "./ferico.png",
  "./sabico.png",
  "./calculator.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Installation — chaque fichier est mis en cache individuellement.
// Si un fichier est introuvable (404), on logge l'erreur SANS faire échouer
// toute l'installation (contrairement à cache.addAll qui est "tout ou rien").
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        FILES_TO_CACHE.map(url =>
          cache.add(url).catch(err => {
            console.error("[SW] Échec mise en cache:", url, err);
          })
        )
      );
    })
  );
});

// Activation
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Requêtes
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
