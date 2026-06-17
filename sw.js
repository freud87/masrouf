const CACHE_NAME = "masrouf-v4";
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

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        FILES_TO_CACHE.map(url =>
          cache.add(url).catch(err => {
            console.warn("[SW] Échec cache:", url, err);
          })
        )
      );
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  // Ignorer les requêtes POST (Google Apps Script)
  if (event.request.method !== "GET") return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cloner et mettre en cache la réponse réseau
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
