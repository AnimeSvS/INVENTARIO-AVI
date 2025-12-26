// assets/js/modals/modal-confirm.js

function crearModal(titulo, contenido, onConfirm) {
  const idModal = 'modalGenerico_' + Date.now();
  const idBtnConfirmar = 'btnConfirmarModal_' + Date.now();

  const modalHtml = `
    <div class="modal fade" id="${idModal}" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title">${titulo}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${contenido}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="${idBtnConfirmar}">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = new bootstrap.Modal(document.getElementById(idModal));
  modal.show();

  document.getElementById(idBtnConfirmar).addEventListener('click', async () => {
    // ✅ Quitamos el foco del botón antes de cerrar
    document.getElementById(idBtnConfirmar).blur();

    await onConfirm();
    modal.hide();
    setTimeout(() => {
      const el = document.getElementById(idModal);
      if (el) el.remove();
    }, 150);
  });

  document.getElementById(idModal).addEventListener('hidden.bs.modal', () => {
    setTimeout(() => {
      const el = document.getElementById(idModal);
      if (el?.parentNode) el.remove();
    }, 100);
  });
}

function mostrarModalConfirmacion({
  titulo = '¿Estás seguro?',
  contenido = '',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  alConfirmar = () => { },
  alCancelar = () => { }
} = {}) {

  const idModal = 'modalConfirmacion_' + Date.now();
  const idBtnConfirmar = 'btnConfirmarModal_' + Date.now();

  const modalHtml = `
    <div class="modal fade" id="${idModal}" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title">${titulo}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${contenido}
            <div class="alert alert-danger mt-3 mb-0">
              ⚠️ Esta acción no se puede revertir.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${textoCancelar}</button>
            <button type="button" class="btn btn-primary" id="${idBtnConfirmar}">${textoConfirmar}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = new bootstrap.Modal(document.getElementById(idModal));
  modal.show();

  document.getElementById(idBtnConfirmar).addEventListener('click', async () => {
    // ✅ Quitamos el foco del botón antes de cerrar
    document.getElementById(idBtnConfirmar).blur();

    await alConfirmar();
    modal.hide();
    setTimeout(() => {
      const el = document.getElementById(idModal);
      if (el) el.remove();
    }, 150);
  });

  document.getElementById(idModal).addEventListener('hidden.bs.modal', () => {
    setTimeout(() => {
      const el = document.getElementById(idModal);
      if (el?.parentNode) el.remove();
    }, 100);
    alCancelar();
  });
}