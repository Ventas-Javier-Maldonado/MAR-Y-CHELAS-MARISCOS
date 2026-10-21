/* =========================================================
   MAR Y CHELAS — CACHÉ INDEPENDIENTE
========================================================= */

const CACHE_PREFIX = "mar-y-chelas-";
const CACHE_NAME = CACHE_PREFIX + "v4";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.webmanifest"
];

const URLS_PERMITIDAS = new Set(
    ARCHIVOS.map(
        ruta => new URL(ruta, self.location.href).href
    )
);

/* INSTALACIÓN */

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS))
            .then(() => self.skipWaiting())
    );
});

/* LIMPIAR SOLO VERSIONES DE ESTA APLICACIÓN */

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(nombres => Promise.all(
                nombres
                    .filter(nombre =>
                        nombre.startsWith(CACHE_PREFIX) &&
                        nombre !== CACHE_NAME
                    )
                    .map(nombre => caches.delete(nombre))
            ))
            .then(() => self.clients.claim())
    );
});

/* ACTUALIZACIÓN */

self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

/* INTERNET PRIMERO; SIN CACHÉ DE SUPABASE NI FOTOS */

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return;

    const urlSinParametros = new URL(url.href);
    urlSinParametros.search = "";
    urlSinParametros.hash = "";

    if (!URLS_PERMITIDAS.has(urlSinParametros.href)) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
            const respuesta = await fetch(request, {
                cache: "no-store"
            });

            if (respuesta.ok) {
                try {
                    await cache.put(
                        urlSinParametros.href,
                        respuesta.clone()
                    );
                } catch (error) {
                    console.warn("No se pudo actualizar caché:", error);
                }
            }

            return respuesta;

        } catch (error) {
            const guardada = await cache.match(
                urlSinParametros.href
            );

            if (guardada) return guardada;

            return Response.error();
        }
    })());
});
