// form.js - VERSIÓN CORREGIDA Y FUNCIONAL

// ============================================
// 1. FORMULARIO DE REGISTRO (INGRESOS)
// ============================================
document.getElementById('formRegistro')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Validar formulario
    if (!validador.validarFormulario('formRegistro')) {
        return;
    }

    await loadingManager.ejecutarConLoading(async () => {
        await agregarRegistro(this);
    }, 'Agregando registro...');
});

// ============================================
// 2. FORMULARIO DE EDICIÓN
// ============================================
document.getElementById('formEdit')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Validar formulario primero
    if (!validador.validarFormulario('formEdit')) {
        return;
    }

    await loadingManager.ejecutarConLoading(async () => {
        try {
            const cantidad = Number(document.getElementById('editCantidadJabas').value);
            const pollosJaba = Number(document.getElementById('editPollosPorJaba').value);
            const pesoBr = Number(document.getElementById('editPesoBruto').value);

            const snap = await registrosRef.where('id', '==', currentEditId).get();

            if (snap.empty) {
                mostrarNotificacion('❌ Registro no encontrado', 'error');
                return;
            }

            const docId = snap.docs[0].id;
            await registrosRef.doc(docId).update({
                cantidadJabas: cantidad,
                pollosPorJaba: pollosJaba,
                pesoBruto: pesoBr
            });

            // Cerrar modal de forma SEGURA
            const modalElement = document.getElementById('editModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }

                // Limpiar manualmente después de un pequeño delay
                setTimeout(() => {
                    modalFix.cleanupAllModals();
                    modalElement.remove();
                }, 150);
            }

            // Recargar datos
            if (typeof cargarDatosInicial === 'function') {
                await cargarDatosInicial();
            }

            // Mostrar notificación de éxito
            mostrarNotificacion('✅ Registro actualizado exitosamente', 'success');

        } catch (error) {
            console.error('Error al actualizar:', error);
            mostrarNotificacion('❌ Error al actualizar: ' + error.message, 'error');

            // Asegurar limpieza incluso en error
            modalFix.cleanupAllModals();
        }
    }, 'Actualizando registro...');
});

// ============================================
// 3. FORMULARIO DE SALIDAS
// ============================================
document.getElementById('formSalida')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Validar formulario
    if (!validador.validarFormulario('formSalida')) {
        return;
    }

    await loadingManager.ejecutarConLoading(async () => {
        try {
            // Obtener valores
            const tinas = Number(document.getElementById('salidaJabas').value);
            const pollosPorTina = Number(document.getElementById('salidaPollosJaba').value);
            const kgPorTina = Number(document.getElementById('salidaPesoPorTina').value);
            const pesoBruto = Number(document.getElementById('salidaPesoBruto').value);

            console.log('📊 Valores obtenidos:', { tinas, pollosPorTina, kgPorTina, pesoBruto });

            // Validaciones adicionales
            if (tinas <= 0 || pollosPorTina <= 0 || kgPorTina <= 0 || pesoBruto <= 0) {
                mostrarNotificacion('❌ Complete todos los campos con valores válidos', 'error');
                return;
            }

            // Obtener destino/tienda
            const destinoSelect = document.getElementById('salidaDestino');
            let tienda = '';

            if (destinoSelect.value === 'OTRO') {
                tienda = document.getElementById('otroDestino').value.trim();
                if (!tienda) {
                    mostrarNotificacion('❌ Ingrese un destino válido', 'error');
                    document.getElementById('otroDestino').focus();
                    return;
                }
            } else {
                tienda = destinoSelect.value;
            }

            console.log('🏪 Tienda seleccionada:', tienda);

            // Mostrar confirmación
            mostrarConfirmacionSalida(pesoBruto, async () => {
                console.log('🚀 Confirmación aceptada, procediendo a registrar...');

                try {
                    // Calcular valores
                    const totalPollos = tinas * pollosPorTina;
                    const totalTinas = kgPorTina * tinas;
                    const pesoNeto = pesoBruto - totalTinas;

                    const datosSalida = {
                        producto: 'POLLO BENEFICIADO',
                        tienda: tienda,
                        tinas: tinas,
                        kgPorTina: kgPorTina,
                        totalTinas: totalTinas,
                        pollosPorTina: pollosPorTina,
                        totalPollos: totalPollos,
                        bruto: pesoBruto,
                        pesoNeto: pesoNeto,
                        promedio: totalPollos > 0 ? (pesoNeto / totalPollos) : 0,
                        fecha: firebase.firestore.Timestamp.fromDate(new Date())
                    };

                    console.log('📦 Datos de salida:', datosSalida);

                    // Registrar salida
                    await registrarSalida(datosSalida);
                    console.log('✅ Salida registrada en Firestore');

                    // Limpiar formulario
                    form.reset();
                    document.getElementById('salidaJabas').value = '';
                    document.getElementById('salidaPollosJaba').value = '';
                    form.classList.remove('was-validated');
                    document.getElementById('otroDestinoDiv').classList.add('d-none');

                    // Actualizar interfaz
                    if (typeof cargarSalidas === 'function') {
                        await cargarSalidas();
                        console.log('✅ Tabla de salidas actualizada');
                    }

                    if (typeof cargarDashboard === 'function') {
                        await cargarDashboard();
                        console.log('✅ Dashboard actualizado');
                    }

                    mostrarNotificacion('✅ Salida registrada exitosamente', 'success');

                } catch (error) {
                    console.error('❌ Error al registrar salida:', error);
                    mostrarNotificacion('❌ Error al registrar salida: ' + error.message, 'error');
                }
            });

        } catch (error) {
            console.error('❌ Error en formulario de salida:', error);
            mostrarNotificacion('❌ Error al procesar salida: ' + error.message, 'error');
        }
    }, 'Registrando salida...');
});

// ============================================
// 4. EVENTOS DE CAMBIO EN SELECTS
// ============================================
document.getElementById('salidaDestino')?.addEventListener('change', function () {
    const otroDiv = document.getElementById('otroDestinoDiv');
    if (this.value === 'OTRO') {
        otroDiv.classList.remove('d-none');
        document.getElementById('otroDestino').focus();
    } else {
        otroDiv.classList.add('d-none');
        document.getElementById('otroDestino').value = '';
    }
});

document.getElementById('editSalidaDestino')?.addEventListener('change', function () {
    const otroDiv = document.getElementById('editOtroDestinoDiv');
    if (this.value === 'OTRO') {
        otroDiv.classList.remove('d-none');
        document.getElementById('editOtroDestino').focus();
    } else {
        otroDiv.classList.add('d-none');
        document.getElementById('editOtroDestino').value = '';
    }
});

// ============================================
// 5. INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando form.js...');

    // Habilitar validación en tiempo real
    if (typeof validador !== 'undefined') {
        validador.habilitarValidacionEnTiempoReal('formRegistro');
        validador.habilitarValidacionEnTiempoReal('formSalida');
        validador.habilitarValidacionEnTiempoReal('formEdit');
        validador.habilitarValidacionEnTiempoReal('formEditSalida');
        console.log('✅ Validación en tiempo real habilitada');
    } else {
        console.warn('⚠️ validador no está definido');
    }

    // Verificar que los elementos existan
    const forms = ['formRegistro', 'formSalida', 'formEdit', 'formEditSalida'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            console.log(`✅ Formulario ${formId} encontrado`);
        } else {
            console.log(`⚠️ Formulario ${formId} no encontrado`);
        }
    });
});
// /salida
    // Habilitar validación en tiempo real
    document.addEventListener('DOMContentLoaded', function () {
        validador.habilitarValidacionEnTiempoReal('formRegistro');
        validador.habilitarValidacionEnTiempoReal('formSalida');
        validador.habilitarValidacionEnTiempoReal('formEdit');
        validador.habilitarValidacionEnTiempoReal('formEditSalida');
    });