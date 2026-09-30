const CACHE_NAME = "mar-y-chelas-v1.0.0";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  "./images/logo-mar-y-chelas.png",
  "./images/menu-mar-y-chelas.jpg",
  "./images/icon-192.png",
  "./images/icon-512.png",

  "./images/01-laminas-de-atun.jpg",
  "./images/02-atun-tropical.jpg",
  "./images/03-bota-estilo-acapulqueno.jpg",
  "./images/04-ceviche-camaron.jpg",
  "./images/05-ceviche-vallarta.jpg",
  "./images/06-ensalada-de-mariscos.jpg",
  "./images/07-coctel-de-camaron.jpg",
  "./images/08-coctel-mixto-camaron-pulpo.jpg",
  "./images/09-camarones-al-gusto.jpg",
  "./images/10-aguachile-verde.jpg",
  "./images/11-aguachile-rojo.jpg",
  "./images/12-aguachile-negro.jpg",
  "./images/13-tostada-ceviche-camaron.jpg",
  "./images/14-tostada-atun.jpg",
  "./images/15-tostada-aguachiles.jpg",
  "./images/16-tostada-ceviche-vallarta.jpg",
  "./images/17-tostada-ceviche-cuadro-acapulqueno.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {

      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then(response => {

          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const copia = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copia);
          });

          return response;
        })
        .catch(() => {
          return caches.match("./index.html");
        });

    })
  );
});