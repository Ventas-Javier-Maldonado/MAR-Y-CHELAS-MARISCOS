const CACHE_NAME = "mar-y-chelas-v3";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./images/menu-mar-y-chelas.jpg",
  "./music/musica-mar-y-chelas.mp3"
];


/* =========================================================
   INSTALACIÓN
========================================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(ARCHIVOS);

      })

  );

  self.skipWaiting();

});


/* =========================================================
   ACTIVACIÓN
========================================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(nombres => {

        return Promise.all(

          nombres
            .filter(nombre => nombre !== CACHE_NAME)
            .map(nombre => caches.delete(nombre))

        );

      })

  );

  self.clients.claim();

});


/* =========================================================
   MENSAJES
========================================================= */

self.addEventListener("message", event => {

  if (
    event.data &&
    event.data.type === "SKIP_WAITING"
  ) {

    self.skipWaiting();

  }

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    fetch(event.request)
      .then(respuesta => {

        const copia = respuesta.clone();

        caches.open(CACHE_NAME)
          .then(cache => {

            cache.put(
              event.request,
              copia
            );

          });

        return respuesta;

      })
      .catch(() => {

        return caches.match(
          event.request
        );

      })

  );

});
