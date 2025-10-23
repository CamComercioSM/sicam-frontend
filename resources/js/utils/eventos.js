/**
 * Helper para agregar eventos de forma uniforme.
 * 
 * @param {string} eventType - Tipo de evento (por ejemplo, 'click', 'change', etc.)
 * @param {string|HTMLElement|Document} target - Elemento destino: selector ('#id', '.clase') o elemento directo.
 * @param {Function} callback - Función que se ejecutará cuando ocurra el evento.
 */
window.agregarEvento = function (eventType, target, callback) {
    let element = target;

    // Si es un selector (string)
    if (typeof target === 'string') {
        if (target.startsWith('#')) {
            element = document.getElementById(target.slice(1));
        } else if (target.startsWith('.')) {
            element = document.querySelector(target);
        } else {
            console.warn(`⚠️ Selector no válido (${target}), se usará document.`);
            element = document;
        }
    }

    // Verificamos que el elemento exista antes de agregar el evento
    if (!element) {
        console.error(`❌ No se encontró el elemento para '${target}'`);
        return;
    }

    // Agregamos el listener
    element.addEventListener(eventType, callback);
}
