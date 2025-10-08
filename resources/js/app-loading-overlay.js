(function () {
    const overlay = document.getElementById('app-loading-overlay');
    const textEl = overlay?.querySelector('.overlay-text');
    let autoHideTimer = null;

    /**
     * Muestra/oculta un overlay global que bloquea toda la pantalla.
     * @param {boolean} show - true para mostrar, false para ocultar
     * @param {object} [opts]
     * @param {string} [opts.text="Procesando…"] - Texto a mostrar
     * @param {number} [opts.timeout=0] - Ocultar automáticamente (ms). 0 = no autohide
     */
    window.cargando = function (show, opts = {}) {
        if (!overlay) return;

        // texto opcional
        const label = typeof opts.text === 'string' && opts.text.trim().length
            ? opts.text.trim()
            : 'Procesando…';
        if (textEl) textEl.textContent = label;

        // limpiar autohide anterior
        if (autoHideTimer) {
            clearTimeout(autoHideTimer);
            autoHideTimer = null;
        }

        // toggle
        overlay.classList.toggle('show', !!show);
        document.documentElement.style.overflow = show ? 'hidden' : '';

        // autohide
        if (show && Number.isFinite(opts.timeout) && opts.timeout > 0) {
            autoHideTimer = setTimeout(() => cargando(false), opts.timeout);
        }
    };

    // Accesibilidad: cerrar con ESC si se desea
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('show')) {
            cargando(false);
        }
    });
})();
document.addEventListener('DOMContentLoaded', async () => {
    // Mostramos el overlay manualmente (por si venía oculto)
    cargando(true, { text: 'Inicializando aplicación…' });

    try {
        // Simular inicialización (fetch de usuario o menú)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Inicializa TemplateCustomizer o tus componentes
        // window.templateCustomizer.init();

    } finally {
        // Ocultar overlay al terminar
        cargando(false);
    }
});
