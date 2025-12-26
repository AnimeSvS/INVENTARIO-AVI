// assets/js/modals/modal-precio.js - MODAL BOOTSTRAP ELEGANTE

// Variable global para el precio
let PRECIO_KG = 8.50;

// Cargar precio desde localStorage si existe
const precioGuardado = localStorage.getItem('precio_kg_inventario');
if (precioGuardado) {
    PRECIO_KG = parseFloat(precioGuardado);
}

/**
 * Muestra el modal de Bootstrap para editar el precio
 */
function mostrarModalPrecio() {
    console.log('💰 Abriendo modal Bootstrap para editar precio...');

    try {
        // Crear modal elegante de Bootstrap
        const modalHtml = `
            <div class="modal fade" id="modalPrecioElegante" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-gradient-warning text-dark">
                            <h5 class="modal-title fw-bold">
                                <i class="fas fa-dollar-sign me-2"></i> Editar Precio por Kg
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="text-center mb-4">
                                <div class="bg-light rounded-3 p-3 mb-3">
                                    <small class="text-muted d-block">Precio Actual</small>
                                    <h2 class="text-warning mb-0">S/ ${PRECIO_KG.toFixed(2)}</h2>
                                    <small class="text-muted">por kilogramo</small>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label for="inputNuevoPrecio" class="form-label fw-bold">
                                    Nuevo Precio <span class="text-danger">*</span>
                                </label>
                                <div class="input-group input-group-lg">
                                    <span class="input-group-text bg-warning text-dark fw-bold">S/</span>
                                    <input type="number" id="inputNuevoPrecio" class="form-control form-control-lg" 
                                           value="${PRECIO_KG}" step="0.01" min="0.01" max="999.99"
                                           placeholder="0.00" autofocus>
                                </div>
                                <small class="text-muted">Ingrese el nuevo precio por kilogramo de pollo vivo</small>
                            </div>

                            <div class="card border-2 border-warning">
                                <div class="card-header bg-warning bg-opacity-10">
                                    <h6 class="mb-0 fw-bold text-warning">
                                        <i class="fas fa-chart-line me-2"></i> Impacto del Cambio
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <div class="row text-center">
                                        <div class="col-6 border-end">
                                            <small class="text-muted d-block">Stock Actual</small>
                                            <h5 class="mb-0 text-primary" id="impactoStock">Calculando...</h5>
                                            <small class="text-muted">kg</small>
                                        </div>
                                        <div class="col-6">
                                            <small class="text-muted d-block">Valor Actual</small>
                                            <h5 class="mb-0 text-success" id="impactoValor">Calculando...</h5>
                                        </div>
                                    </div>
                                    <hr class="my-3">
                                    <div class="row text-center">
                                        <div class="col-6 border-end">
                                            <small class="text-muted d-block">Nuevo Valor</small>
                                            <h5 class="mb-0 text-info" id="impactoNuevo">S/ 0.00</h5>
                                        </div>
                                        <div class="col-6">
                                            <small class="text-muted d-block">Diferencia</small>
                                            <h5 class="mb-0" id="impactoDiferencia">S/ 0.00</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Cancelar
                            </button>
                            <button type="button" class="btn btn-warning fw-bold" onclick="guardarNuevoPrecio()">
                                <i class="fas fa-save me-2"></i>Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Eliminar modal anterior si existe
        const modalAnterior = document.getElementById('modalPrecioElegante');
        if (modalAnterior) {
            const modalInstance = bootstrap.Modal.getInstance(modalAnterior);
            if (modalInstance) {
                modalInstance.hide();
            }
            setTimeout(() => {
                modalAnterior.remove();
            }, 200);
        }

        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Obtener elementos del modal
        const inputPrecio = document.getElementById('inputNuevoPrecio');
        const impactoStock = document.getElementById('impactoStock');
        const impactoValor = document.getElementById('impactoValor');
        const impactoNuevo = document.getElementById('impactoNuevo');
        const impactoDiferencia = document.getElementById('impactoDiferencia');

        // Obtener stock actual para calcular impacto
        if (typeof obtenerStockActual === 'function') {
            obtenerStockActual().then(stock => {
                const stockKilos = stock.pesoNeto || 0;
                const valorActual = stockKilos * PRECIO_KG;

                // Mostrar valores actuales
                if (impactoStock) impactoStock.textContent = stockKilos.toFixed(2) + ' kg';
                if (impactoValor) impactoValor.textContent = 'S/ ' + valorActual.toFixed(2);

                // Función para actualizar cálculos en tiempo real
                function actualizarCalculos() {
                    const nuevoPrecio = parseFloat(inputPrecio.value) || 0;
                    const nuevoValor = stockKilos * nuevoPrecio;
                    const diferencia = nuevoValor - valorActual;

                    if (impactoNuevo) impactoNuevo.textContent = 'S/ ' + nuevoValor.toFixed(2);
                    if (impactoDiferencia) {
                        impactoDiferencia.textContent = 'S/ ' + Math.abs(diferencia).toFixed(2);
                        impactoDiferencia.className = diferencia >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
                    }
                }

                // Escuchar cambios en el input
                inputPrecio.addEventListener('input', actualizarCalculos);
                inputPrecio.addEventListener('change', actualizarCalculos);

                // Calcular inicial
                actualizarCalculos();

                // Focus en el input
                inputPrecio.focus();
                inputPrecio.select();

            }).catch(error => {
                console.error('❌ Error al obtener stock:', error);
                if (impactoStock) impactoStock.textContent = 'Error al cargar';
                if (impactoValor) impactoValor.textContent = 'Error al cargar';
            });
        } else {
            console.warn('⚠️ obtenerStockActual no disponible');
            if (impactoStock) impactoStock.textContent = 'Función no disponible';
            if (impactoValor) impactoValor.textContent = 'Función no disponible';
        }

        // Mostrar modal con animación
        const modal = new bootstrap.Modal(document.getElementById('modalPrecioElegante'), {
            backdrop: true,
            keyboard: true,
            focus: true
        });

        modal.show();

        // Limpiar cuando se cierre completamente
        document.getElementById('modalPrecioElegante').addEventListener('hidden.bs.modal', function () {
            setTimeout(() => {
                const modalElement = document.getElementById('modalPrecioElegante');
                if (modalElement && modalElement.parentNode) {
                    modalElement.remove();
                }
            }, 200);
        });

    } catch (error) {
        console.error('❌ Error al crear modal:', error);
        mostrarNotificacion('Error al abrir editor de precio', 'error');
    }
}

/**
 * Guarda el nuevo precio y actualiza todo
 */
function guardarNuevoPrecio() {
    console.log('💾 Guardando nuevo precio...');

    const inputPrecio = document.getElementById('inputNuevoPrecio');
    if (!inputPrecio) {
        console.error('❌ Input de precio no encontrado');
        return;
    }

    const nuevoPrecio = parseFloat(inputPrecio.value);

    // Validaciones
    if (isNaN(nuevoPrecio) || nuevoPrecio <= 0 || nuevoPrecio > 999.99) {
        mostrarNotificacion('❌ Ingrese un precio válido (0.01 - 999.99)', 'error');
        inputPrecio.focus();
        return;
    }

    console.log(`💰 Precio actual: S/ ${PRECIO_KG} → Nuevo: S/ ${nuevoPrecio}`);

    // Actualizar precio global
    PRECIO_KG = nuevoPrecio;

    // Guardar en localStorage
    localStorage.setItem('precio_kg_inventario', PRECIO_KG.toFixed(2));

    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPrecioElegante'));
    if (modal) {
        modal.hide();
    }

    // NOTIFICACIÓN DE ÉXITO
    mostrarNotificacion(`✅ Precio actualizado: S/ ${PRECIO_KG.toFixed(2)} por kg`, 'success');

    // ACTUALIZAR TODO EN TIEMPO REAL
    setTimeout(() => {
        actualizarTodoConNuevoPrecio();
    }, 300);
}

/**
 * Actualiza todos los cálculos con el nuevo precio
 */
async function actualizarTodoConNuevoPrecio() {
    console.log('🔄 Actualizando todos los cálculos con nuevo precio...');

    try {
        // 1. OBTENER STOCK ACTUAL
        if (typeof obtenerStockActual !== 'function') {
            console.error('❌ obtenerStockActual no está disponible');
            return;
        }

        const stock = await obtenerStockActual();
        const stockKilos = stock.pesoNeto || 0;
        const nuevoValor = stockKilos * PRECIO_KG;

        console.log(`📊 Actualizando: ${stockKilos} kg × S/ ${PRECIO_KG} = S/ ${nuevoValor.toFixed(2)}`);

        // 2. ACTUALIZAR KPIs PRINCIPALES
        const stockValorElement = document.getElementById('stockValor');
        const precioDisplayElement = document.getElementById('precioDisplay');

        if (stockValorElement) {
            stockValorElement.textContent = 'S/ ' + nuevoValor.toFixed(2);
            // Animar el cambio
            stockValorElement.style.transition = 'all 0.5s ease';
            stockValorElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                stockValorElement.style.transform = 'scale(1)';
            }, 500);
        }

        if (precioDisplayElement) {
            precioDisplayElement.textContent = PRECIO_KG.toFixed(2);
        }

        // 3. ACTUALIZAR VARIABLE GLOBAL
        if (window.PRECIO_KG) {
            window.PRECIO_KG = PRECIO_KG;
        }

        console.log('✅ Todo actualizado con nuevo precio');

    } catch (error) {
        console.error('❌ Error al actualizar con nuevo precio:', error);
        mostrarNotificacion('Error al actualizar precios: ' + error.message, 'error');
    }
}

// Hacer funciones globales - AL FINAL DEL ARCHIVO
window.mostrarModalPrecio = mostrarModalPrecio;
window.guardarNuevoPrecio = guardarNuevoPrecio;
window.actualizarTodoConNuevoPrecio = actualizarTodoConNuevoPrecio;

console.log('✅ Modal Bootstrap de precio cargado correctamente');