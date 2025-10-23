// Convierte cualquier cosa en un arreglo (array)
function aArreglo(x) {
    return Array.isArray(x) ? x : (x instanceof NodeList ? Array.from(x) : [x]);
}

// Busca y devuelve los formularios según lo que se haya pasado (id, clase, selector, etc.)
function obtenerFormularios(destino) {
    if (!destino) return [];

    if (typeof destino === 'string') {
        const selector = destino.startsWith('#') || destino.startsWith('.') ? destino : `#${destino}`;
        const formularios = document.querySelectorAll(selector);
        return Array.from(formularios).filter(el => el instanceof HTMLFormElement);
    }

    if (destino instanceof HTMLFormElement) return [destino];

    if (destino instanceof HTMLElement) {
        return Array.from(destino.querySelectorAll('form'));
    }

    if (destino instanceof NodeList) {
        return Array.from(destino).filter(el => el instanceof HTMLFormElement);
    }

    if (Array.isArray(destino)) {
        return destino.flatMap(obtenerFormularios);
    }

    return [];
}

// Determina si un elemento debe ser afectado por el reseteo o limpieza
function debeTocarse(el, { incluir, excluir, omitirOcultos, omitirDeshabilitados }) {
    if (omitirDeshabilitados && el.disabled) return false;
    if (omitirOcultos) {
        if (el.type === 'hidden') return false;
        const estilo = window.getComputedStyle(el);
        if (estilo.display === 'none' || estilo.visibility === 'hidden') return false;
    }
    if (incluir && incluir.length && !el.matches(incluir)) return false;
    if (excluir && excluir.length && el.matches(excluir)) return false;
    return true;
}

// Limpia manualmente un control de formulario
function limpiarControl(el) {
    const etiqueta = el.tagName;
    const tipo = (el.type || '').toLowerCase();

    if (etiqueta === 'INPUT') {
        if (['text', 'search', 'email', 'url', 'tel', 'number', 'password', 'date', 'datetime-local', 'month', 'time', 'week', 'color'].includes(tipo)) {
            el.value = '';
        } else if (tipo === 'checkbox' || tipo === 'radio') {
            el.checked = false;
        } else if (tipo === 'file') {
            el.value = null;
        } else {
            el.value = '';
        }
    } else if (etiqueta === 'TEXTAREA') {
        el.value = '';
    } else if (etiqueta === 'SELECT') {
        if (el.multiple) {
            Array.from(el.options).forEach(opt => opt.selected = false);
        } else {
            try { el.selectedIndex = -1; } catch (e) { el.value = ''; }
        }
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

// Resetea o limpia un formulario individual
function reiniciarFormulario(form, opciones) {
    const {
        modo = 'resetear',       // resetear o limpiar
        incluir = '',            // selector de campos a incluir
        excluir = '',            // selector de campos a excluir
        omitirOcultos = false,   // no tocar campos ocultos
        omitirDeshabilitados = false // no tocar campos deshabilitados
    } = opciones || {};

    if (!(form instanceof HTMLFormElement)) return { formulario: form, ok: false, modo, tocados: 0 };

    if (modo === 'resetear') {
        form.reset();
        return { formulario: form, ok: true, modo, tocados: 0 };
    }

    // modo === 'limpiar'
    let tocados = 0;
    const elementos = Array.from(form.elements || []);
    for (const el of elementos) {
        if (!(el instanceof HTMLElement)) continue;
        if (!debeTocarse(el, { incluir, excluir, omitirOcultos, omitirDeshabilitados })) continue;
        limpiarControl(el);
        tocados++;
    }

    return { formulario: form, ok: true, modo, tocados };
}

/**
 * Función principal
 * @param {string|HTMLElement|NodeList|Array} destino - id, clase, selector o formulario
 * @param {object} opciones - configuración del reseteo o limpieza
 * @returns {Array<{formulario:HTMLFormElement, ok:boolean, modo:string, tocados:number}>}
 */
function resetearFormularios(destino, opciones = {}) {
    let formularios = [];
    if (typeof destino === 'string' && (destino.startsWith('form') || destino.includes(' '))) {
        formularios = Array.from(document.querySelectorAll(destino)).filter(el => el instanceof HTMLFormElement);
    } else {
        formularios = obtenerFormularios(destino);
    }
    const unicos = Array.from(new Set(formularios));
    return unicos.map(f => reiniciarFormulario(f, opciones));
}

// Azúcar sintáctico
function limpiarFormularios(destino, opciones = {}) {
    return resetearFormularios(destino, { ...opciones, modo: 'limpiar' });
}

// Exponer al ámbito global
window.Formularios = { resetearFormularios, limpiarFormularios };
window.resetearFormularios = resetearFormularios;
window.limpiarFormularios = limpiarFormularios;

