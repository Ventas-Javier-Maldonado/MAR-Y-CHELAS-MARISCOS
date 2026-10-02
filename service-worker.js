if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      const registro =
        await navigator.serviceWorker.register(
          "./service-worker.js",
          {
            updateViaCache: "none"
          }
        );

      console.log(
        "Mar y Chelas PWA activa:",
        registro.scope
      );

      await registro.update();

      if (registro.waiting) {

        registro.waiting.postMessage({
          type: "SKIP_WAITING"
        });

      }

      registro.addEventListener(
        "updatefound",
        () => {

          const nuevoWorker =
            registro.installing;

          if (!nuevoWorker) return;

          nuevoWorker.addEventListener(
            "statechange",
            () => {

              if (
                nuevoWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {

                nuevoWorker.postMessage({
                  type: "SKIP_WAITING"
                });

              }

            }
          );

        }
      );

    } catch (error) {

      console.error(
        "Error PWA:",
        error
      );

    }

  });


  let recargando = false;

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {

      if (recargando) return;

      recargando = true;

      window.location.reload();

    }
  );

}
