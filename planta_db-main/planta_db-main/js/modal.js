// modal.js - VERSIÓN CORREGIDA PARA ACCESIBILIDAD

// Mostrar confirmación de peso bruto (CORREGIDO)
function mostrarConfirmacionPesoBruto(pesoBruto, onConfirm) {
  const modalExistente = document.getElementById('confirmModal');
  if (modalExistente) {
    modalExistente.remove();
  }

  // Generar ID único para el modal
  const modalId = 'confirmModal_' + Date.now();

  const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content p-4">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title mb-0">Confirmar Operación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body py-3">
                        <p>El peso bruto ingresado es: <strong>${pesoBruto.toFixed(2)} KG</strong></p>
                        <p>¿Está seguro de continuar?</p>
                    </div>
                    <div class="modal-footer border-0 pt-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="btnConfirmAdd">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modalEl = document.getElementById(modalId);

  // Crear modal de Bootstrap
  const bsModal = new bootstrap.Modal(modalEl, {
    backdrop: 'static',
    keyboard: false
  });

  // Mostrar modal
  bsModal.show();

  // Manejar evento cuando el modal se muestra completamente
  modalEl.addEventListener('shown.bs.modal', () => {
    // Establecer foco en el botón de cancelar por defecto (mejor práctica de accesibilidad)
    modalEl.querySelector('.btn-secondary').focus();
  });

  // Configurar evento del botón confirmar
  modalEl.querySelector('#btnConfirmAdd').addEventListener('click', () => {
    onConfirm();
    bsModal.hide();
  });

  // Limpiar cuando se oculta
  modalEl.addEventListener('hidden.bs.modal', () => {
    modalEl.remove();
    // Devolver foco al elemento que abrió el modal
    const formSalida = document.getElementById('formSalida');
    if (formSalida) {
      setTimeout(() => formSalida.querySelector('button[type="submit"]').focus(), 100);
    }
  });

  // Manejar tecla Escape (opcional, ya que está deshabilitado)
  modalEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      // Solo cerrar si el modal lo permite
      if (!modalEl.getAttribute('data-bs-keyboard') || modalEl.getAttribute('data-bs-keyboard') !== 'false') {
        bsModal.hide();
      }
    }
  });
}

// Mostrar confirmación de eliminación (CORREGIDO)
function mostrarConfirmacionEliminacion(registro, onConfirm) {
  const modalExistente = document.getElementById('confirmEliminarModal');
  if (modalExistente) {
    modalExistente.remove();
  }

  const tipo = registro.tipo === 'SALIDA' ? 'Salida' : 'Ingreso';
  const modalId = 'confirmEliminarModal_' + Date.now();

  const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content p-4">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title mb-0 text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body py-3">
                        <p>¿Está seguro de eliminar este ${tipo}?</p>
                        <p><strong>Detalles:</strong></p>
                        <ul>
                            <li>Pollos: ${registro.totalPollos || 0}</li>
                            <li>Peso Neto: ${(registro.pesoNeto || 0).toFixed(2)} KG</li>
                            <li>Fecha: ${formatearFecha(registro.fecha)}</li>
                        </ul>
                        <p class="text-danger"><strong>⚠️ Este cambio afectará el stock disponible</strong></p>
                    </div>
                    <div class="modal-footer border-0 pt-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="btnConfirmDelete">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modalEl = document.getElementById(modalId);
  const bsModal = new bootstrap.Modal(modalEl, {
    backdrop: 'static',
    keyboard: false
  });

  bsModal.show();

  // Manejar foco para accesibilidad
  modalEl.addEventListener('shown.bs.modal', () => {
    modalEl.querySelector('.btn-secondary').focus();
  });

  modalEl.querySelector('#btnConfirmDelete').addEventListener('click', () => {
    onConfirm();
    bsModal.hide();
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    modalEl.remove();
  });
}

// Mostrar confirmación de salida (CORREGIDO)
function mostrarConfirmacionSalida(pesoBruto, onConfirm) {
  const modalExistente = document.getElementById('confirmSalidaModal');
  if (modalExistente) {
    modalExistente.remove();
  }

  const modalId = 'confirmSalidaModal_' + Date.now();

  const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content p-4">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title mb-0">Confirmar Operación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body py-3">
                        <p>El peso bruto ingresado es: <strong>${pesoBruto.toFixed(2)} KG</strong></p>
                        <p>¿Está seguro de continuar?</p>
                    </div>
                    <div class="modal-footer border-0 pt-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="btnConfirmAddSalida">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modalEl = document.getElementById(modalId);
  const bsModal = new bootstrap.Modal(modalEl, {
    backdrop: 'static',
    keyboard: false
  });

  bsModal.show();

  // Manejar foco para accesibilidad
  modalEl.addEventListener('shown.bs.modal', () => {
    modalEl.querySelector('.btn-secondary').focus();
  });

  modalEl.querySelector('#btnConfirmAddSalida').addEventListener('click', () => {
    onConfirm();
    bsModal.hide();
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    modalEl.remove();
  });
}

// Función genérica para mostrar modales con buena accesibilidad
function mostrarModalAccesible(config) {
  const {
    id = 'modal_' + Date.now(),
    titulo = 'Modal',
    contenido = '',
    botones = [],
    tamaño = 'modal-dialog-centered',
    backdrop = 'static',
    keyboard = false
  } = config;

  const modalExistente = document.getElementById(id);
  if (modalExistente) {
    modalExistente.remove();
  }

  // Construir botones
  let botonesHtml = '';
  botones.forEach((boton, index) => {
    const esPrimario = index === 0;
    botonesHtml += `
            <button type="button" 
                    class="btn ${boton.clase || (esPrimario ? 'btn-primary' : 'btn-secondary')}" 
                    ${boton.id ? `id="${boton.id}"` : ''}
                    ${boton.onclick ? `onclick="${boton.onclick}"` : ''}
                    data-bs-dismiss="${boton.cerrarModal ? 'modal' : ''}">
                ${boton.texto}
            </button>`;
  });

  const modalHtml = `
        <div class="modal fade" id="${id}" tabindex="-1" 
             data-bs-backdrop="${backdrop}" 
             data-bs-keyboard="${keyboard}"
             role="dialog" 
             aria-labelledby="${id}Label"
             aria-modal="true">
            <div class="modal-dialog ${tamaño}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${id}Label">${titulo}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        ${contenido}
                    </div>
                    ${botonesHtml ? `
                    <div class="modal-footer">
                        ${botonesHtml}
                    </div>` : ''}
                </div>
            </div>
        </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modalEl = document.getElementById(id);

  const bsModal = new bootstrap.Modal(modalEl, {
    backdrop: backdrop,
    keyboard: keyboard
  });

  // Eventos para accesibilidad
  modalEl.addEventListener('shown.bs.modal', () => {
    // Poner foco en el primer elemento enfocable del modal
    const focusableElements = modalEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  });

  // Atrapar foco dentro del modal
  modalEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalEl.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) { // shift + tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else { // tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  });

  bsModal.show();

  return {
    modal: bsModal,
    element: modalEl
  };
}

// Notificación discreta (YA CORRECTA)
function mostrarNotificacionDiscreta(mensaje, tipo = 'info') {
  let clase = '';
  let icono = '';

  switch (tipo) {
    case 'success':
      clase = 'alert-success';
      icono = '✅';
      break;
    case 'error':
      clase = 'alert-danger';
      icono = '❌';
      break;
    case 'warning':
      clase = 'alert-warning';
      icono = '⚠️';
      break;
    default:
      clase = 'alert-info';
      icono = 'ℹ️';
  }

  const notificacion = document.createElement('div');
  notificacion.className = `stock-notification alert ${clase} alert-dismissible fade show position-fixed`;
  notificacion.style.cssText = 'top: 10px; right: 10px; z-index: 1050; max-width: 300px;';
  notificacion.innerHTML = `
        <div class="d-flex align-items-center">
            <span style="margin-right: 8px;">${icono}</span>
            <small style="flex-grow: 1;">${mensaje}</small>
            <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;

  document.body.appendChild(notificacion);

  setTimeout(() => {
    if (notificacion.parentNode) {
      notificacion.remove();
    }
  }, 5000);
}

// Agregar alias para compatibilidad
function mostrarNotificacionExito(mensaje) {
  mostrarNotificacionDiscreta(mensaje, 'success');
}

function mostrarNotificacionError(mensaje) {
  mostrarNotificacionDiscreta(mensaje, 'error');
}

// Hacer disponibles globalmente
window.mostrarConfirmacionPesoBruto = mostrarConfirmacionPesoBruto;
window.mostrarConfirmacionEliminacion = mostrarConfirmacionEliminacion;
window.mostrarConfirmacionSalida = mostrarConfirmacionSalida;
window.mostrarNotificacionDiscreta = mostrarNotificacionDiscreta;
window.mostrarNotificacionExito = mostrarNotificacionExito;
window.mostrarNotificacionError = mostrarNotificacionError;
window.mostrarModalAccesible = mostrarModalAccesible;

console.log('✅ Modal.js cargado con accesibilidad mejorada');