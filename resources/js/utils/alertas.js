// resources/js/alertas.js
import Swal from 'sweetalert2';

window.alertaCancelar = function (mensajeCancelar) {
    Swal.fire({
        title: 'Cancelar',
        text: mensajeCancelar,
        icon: 'error',
        customClass: { confirmButton: 'btn btn-success' }
    });
};

window.alertaExito = function (titulo, mensaje) {
    Swal.fire({
        icon: 'success',
        title: titulo,
        text: mensaje,
        customClass: { confirmButton: 'btn btn-success' }
    });
};

window.alertaError = function (titulo, mensaje) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'error',
        customClass: { confirmButton: 'btn btn-success' }
    });
};

// Confirmación con callback opcional
window.confirmarAccion = async function (titulo, mensaje, accionFunction = null) {
    const { isConfirmed } = await Swal.fire({
        title: titulo || '¿Confirmar?',
        text: mensaje || 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar',
        customClass: { confirmButton: 'btn btn-success', cancelButton: 'btn btn-secondary' }
    });

    if (isConfirmed && typeof accionFunction === 'function') {
        accionFunction();
    }
};
