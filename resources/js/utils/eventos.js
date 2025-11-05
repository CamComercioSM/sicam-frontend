/**
 * Helper para agregar eventos de forma uniforme.
 * 
 * @param {string} eventType - Tipo de evento (por ejemplo, 'click', 'change', etc.)
 * @param {string|HTMLElement|Document} target - Elemento destino: selector ('#id', '.clase') o elemento directo.
 * @param {Function} callback - Función que se ejecutará cuando ocurra el evento.
 */
window.agregarEvento = function (eventType, target, callback) {
  const esColeccion = (t) =>
    (typeof NodeList !== 'undefined' && t instanceof NodeList) ||
    (typeof HTMLCollection !== 'undefined' && t instanceof HTMLCollection) ||
    Array.isArray(t);

  // 1) Delegación si es un selector (string)
  if (typeof target === 'string') {
    const selector = target.trim();
    document.addEventListener(eventType, function (e) {
      const match = e.target.closest(selector);
      if (match) {
        // Opcional: setear this al elemento coincidente
        callback.call(match, e, match);
      }
    });
    return;
  }

  // 2) Si es una colección de nodos, agregar a cada uno
  if (esColeccion(target)) {
    Array.from(target).forEach((el) => {
      if (el && el.addEventListener) {
        el.addEventListener(eventType, function (e) {
          callback.call(el, e, el);
        });
      }
    });
    return;
  }

  // 3) Si es un elemento o document
  if (target && target.addEventListener) {
    target.addEventListener(eventType, function (e) {
      callback.call(target, e, target);
    });
    return;
  }

  console.error(`❌ agregarEvento: target no válido`, target);
};

/**
 * Helper global para ejecutar peticiones HTTP con fetch y manejo estándar.
 * 
 * @param {string} ruta - Complemento de la URL (sin el baseUrl)
 * @param {string} metodo - Método HTTP: GET, POST, PUT, DELETE, etc.
 * @param {Function} onSuccess - Función que se ejecuta si la petición es exitosa
 * @param {Function} onError - Función que se ejecuta si hay error
 */
window.ejecutarPeticion = async function (ruta, metodo = 'GET', data = null, onSuccess = null, onError = null) {
  cargando(true, { text: 'Procesando solicitud...' });

  try {
    const opciones = {
      method: metodo.toUpperCase(),
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        'Content-Type': 'application/json'
      }
    };

    // 👇 Solo agregamos el body si hay data y el método lo permite
    if (data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(opciones.method)) {
      opciones.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseUrl}${ruta}`, opciones);
    cargando(false);

    if (response.ok) {
      const json = await response.json().catch(() => ({})); // evita error si no hay cuerpo
      if (onSuccess) onSuccess(json);
    } else {
      const errorText = await response.text();
      console.error(`❌ Error en ${metodo} ${ruta}:`, errorText);
      if (onError) onError(errorText);
    }
  } catch (error) {
    cargando(false);
    console.error(`❌ Error al ejecutar ${metodo} ${ruta}:`, error);
    if (onError) onError(error);
  }
};


