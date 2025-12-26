// assets/js/utils/notificaciones.js

function mostrarNotificacion(mensaje, tipo = 'info') {
    const colores = {
        success: 'alert-success',
        error: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info'
    };

    const notificacion = document.createElement('div');
    notificacion.className = `alert ${colores[tipo]} alert-dismissible fade show position-fixed`;
    notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    notificacion.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        if (notificacion.parentNode) notificacion.remove();
    }, 5000);
}