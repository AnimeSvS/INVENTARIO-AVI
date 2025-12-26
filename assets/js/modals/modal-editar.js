// assets/js/modals/modal-editar.js - CON ACTUALIZACIÓN DE INVENTARIO
function obtenerUsuarioActual() {
    const user = localStorage.getItem('usuario_actual');
    return user ? JSON.parse(user) : null;
}   
/**
 * Abre el modal para editar una salida
 */
async function abrirModalEditarSalida(id) {
    console.log('🎯 Abriendo modal para editar salida:', id);

    try {
        // Buscar la salida en Firestore
        const snap = await db.collection('salidas').where('id', '==', id).get();

        if (snap.empty) {
            console.error('❌ Salida no encontrada con ID:', id);
            mostrarNotificacion('Salida no encontrada', 'error');
            return;
        }

        const data = snap.docs[0].data();
        const docId = snap.docs[0].id;

        console.log('📄 Datos de salida encontrados:', data);

        // Guardar valores originales para ajustar inventario
        const valoresOriginales = {
            totalPollos: data.totalPollos || 0,
            pesoNeto: data.pesoNeto || 0
        };

        // Lista de tiendas/destinos
        const tiendas = [
            'MARIANO MELGAR', 'PAUCARPATA', 'MIRAFLORES', 'SOCABAYA',
            'CAYMA', 'ALTO SELVA ALEGRE', 'AVELINO (PRINCIPAL)',
            'COLON', 'ANGEL', 'FANNY', 'OTRO'
        ];

        // Crear opciones del select para destino
        const opcionesDestino = tiendas.map(tienda =>
            `<option value="${tienda}" ${data.tienda === tienda ? 'selected' : ''}>${tienda}</option>`
        ).join('');

        // Crear el modal con el formulario de edición
        const modal = crearModal('Editar Salida 📝', `
            <form id="formEditarSalida" class="row g-3 needs-validation" novalidate>
                <div class="col-md-3">
                    <label class="form-label">Cantidad de Tinas</label>
                    <input type="number" id="editTinas" class="form-control" value="${data.tinas}" min="1" required />
                </div>
                <div class="col-md-3">
                    <label class="form-label">Pollos x Tina</label>
                    <input type="number" id="editPollosPorTina" class="form-control" value="${data.pollosPorTina}" min="1" required />
                </div>
                <div class="col-md-3">
                    <label class="form-label">Peso Bruto (kg)</label>
                    <input type="number" id="editPesoBruto" class="form-control" step="0.01" value="${data.pesoBruto}" required />
                </div>
                <div class="col-md-3">
                    <label class="form-label">Kilos por Tina</label>
                    <input type="number" id="editKgPorTina" class="form-control" step="0.01" value="${data.kgPorTina || 0}" required />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Destino / Tienda</label>
                    <select id="editDestino" class="form-select" required>
                        <option value="">Seleccione destino...</option>
                        ${opcionesDestino}
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Producto</label>
                    <input type="text" id="editProducto" class="form-control" value="${data.producto || 'POLLO VIVO'}" readonly />
                    <small class="text-muted">Producto no editable</small>
                </div>
            </form>
        `, async () => {
            // Función que se ejecuta al confirmar
            try {
                const tinas = Number(document.getElementById('editTinas').value);
                const pollosPorTina = Number(document.getElementById('editPollosPorTina').value);
                const pesoBruto = Number(document.getElementById('editPesoBruto').value);
                const kgPorTina = Number(document.getElementById('editKgPorTina').value);
                const destino = document.getElementById('editDestino').value;
                const producto = data.producto || 'POLLO VIVO'; // Mantener el producto original

                // Validar datos
                if (!tinas || !pollosPorTina || !pesoBruto || !destino) {
                    mostrarNotificacion('❌ Complete todos los campos requeridos', 'warning');
                    return;
                }

                // Calcular nuevos valores
                const totalPollos = tinas * pollosPorTina;
                const pesoNeto = pesoBruto - (tinas * kgPorTina);

                console.log('💾 Actualizando salida con datos:', {
                    tinas, pollosPorTina, pesoBruto, kgPorTina, destino, producto
                });

                // ===== ACTUALIZACIÓN DE INVENTARIO =====
                // 1. Devolver valores originales al stock (sumar)
                console.log('🔄 Ajustando inventario...');
                console.log(`➕ Devolviendo al stock: ${valoresOriginales.totalPollos} pollos, ${valoresOriginales.pesoNeto} kg`);
                await sumarStock(valoresOriginales.totalPollos, valoresOriginales.pesoNeto);

                // 2. Actualizar el documento en Firestore
                await db.collection('salidas').doc(docId).update({
                    tinas: tinas,
                    pollosPorTina: pollosPorTina,
                    pesoBruto: pesoBruto,
                    kgPorTina: kgPorTina,
                    pesoNeto: pesoNeto,
                    totalPollos: totalPollos,
                    tienda: destino,
                    producto: producto, // Mantener producto original
                    fechaActualizacion: firebase.firestore.Timestamp.now()
                });

                // 3. Aplicar nuevos valores al stock (restar)
                console.log(`➖ Aplicando nuevos valores: ${totalPollos} pollos, ${pesoNeto} kg`);
                await restarStock(totalPollos, pesoNeto);

                mostrarNotificacion('✅ Salida actualizada e inventario actualizado', 'success');

                // Recargar la tabla para mostrar los cambios
                setTimeout(() => {
                    cargarSalidasDesdeUltimoCierre();
                    // Si el inventario está visible, también actualizarlo
                    if (document.getElementById('inventario').classList.contains('active')) {
                        cargarInventarioGeneral();
                    }
                }, 300);

            } catch (error) {
                console.error('❌ Error al actualizar:', error);
                mostrarNotificacion('❌ Error al actualizar: ' + error.message, 'error');
            }
        });

    } catch (error) {
        console.error('❌ Error al abrir modal de edición:', error);
        mostrarNotificacion('Error al cargar datos de la salida', 'error');
    }
}

/**
 * Abre el modal para editar un ingreso - CON ACTUALIZACIÓN DE INVENTARIO
 */
async function abrirModalEditarIngreso(id) {
    console.log('📝 Abriendo modal para editar ingreso:', id);

    try {
        const snap = await db.collection('ingresos').where('id', '==', id).get();
        if (snap.empty) return;

        const data = snap.docs[0].data();
        const docId = snap.docs[0].id;

        // Guardar valores originales para ajustar inventario
        const valoresOriginales = {
            cantidadJabas: data.cantidadJabas || 0,
            pollosPorJaba: data.pollosPorJaba || 0,
            pesoBruto: data.pesoBruto || 0,
            pesoJaba: data.pesoJaba || 0
        };

        // Crear modal con CAMPOS NUMÉRICOS en lugar de listas
        const modal = crearModal('Editar Ingreso 📝', `
            <form id="formEditarIngreso" class="row g-3 needs-validation" novalidate>
                <div class="col-md-4">
                    <label class="form-label fw-bold">
                        Cantidad de Jabas <span class="text-danger">*</span>
                    </label>
                    <input type="number" id="editCantidadJabas" class="form-control form-control-lg" 
                           value="${data.cantidadJabas}" min="1" max="50" required />
                    <small class="text-muted">Número de jabas ingresadas</small>
                </div>
                
                <div class="col-md-4">
                    <label class="form-label fw-bold">
                        Pollos por Jaba <span class="text-danger">*</span>
                    </label>
                    <input type="number" id="editPollosPorJaba" class="form-control form-control-lg" 
                           value="${data.pollosPorJaba}" min="1" max="20" required />
                    <small class="text-muted">Pollos contenidos en cada jaba</small>
                </div>
                
                <div class="col-md-4">
                    <label class="form-label fw-bold">
                        Peso Bruto (kg) <span class="text-danger">*</span>
                    </label>
                    <input type="number" id="editPesoBruto" class="form-control form-control-lg" 
                           value="${data.pesoBruto}" step="0.01" min="0.01" max="9999.99" required />
                    <small class="text-muted">Peso total con jabas</small>
                </div>
                
                <div class="col-md-6">
                    <label class="form-label fw-bold">
                        Producto
                    </label>
                    <input type="text" class="form-control" value="${data.producto || 'POLLO VIVO'}" readonly />
                    <small class="text-muted">Producto no editable</small>
                </div>
                
                <div class="col-md-6">
                    <label class="form-label fw-bold">
                        Fecha de Registro
                    </label>
                    <input type="text" class="form-control" 
                           value="${data.fecha ? data.fecha.toDate().toLocaleDateString('es-PE') : new Date().toLocaleDateString('es-PE')}" readonly />
                    <small class="text-muted">Fecha del ingreso</small>
                </div>
            </form>
        `, async () => {
            // Función que se ejecuta al confirmar
            try {
                const cantidad = Number(document.getElementById('editCantidadJabas').value);
                const pollos = Number(document.getElementById('editPollosPorJaba').value);
                const bruto = Number(document.getElementById('editPesoBruto').value);

                // Validación de campos numéricos
                if (!cantidad || !pollos || !bruto) {
                    mostrarNotificacion('❌ Complete todos los campos numéricos', 'error');
                    return;
                }

                if (cantidad <= 0 || pollos <= 0 || bruto <= 0) {
                    mostrarNotificacion('❌ Los valores deben ser mayores a 0', 'error');
                    return;
                }

                // Calcular valores originales
                const { cPollos: pollosOriginales, neto: pesoOriginal } = calcular(
                    valoresOriginales.cantidadJabas,
                    valoresOriginales.pollosPorJaba,
                    valoresOriginales.pesoBruto,
                    valoresOriginales.pesoJaba
                );

                // Calcular nuevos valores
                const { cPollos: pollosNuevos, neto: pesoNuevo } = calcular(cantidad, pollos, bruto, valoresOriginales.pesoJaba);

                console.log('🔄 Actualizando inventario...');
                console.log(`➖ Restando originales: ${pollosOriginales} pollos, ${pesoOriginal} kg`);
                console.log(`➕ Sumando nuevos: ${pollosNuevos} pollos, ${pesoNuevo} kg`);

                // 1. Restar valores originales del inventario
                await restarStock(pollosOriginales, pesoOriginal);

                // 2. Actualizar el documento en Firestore
                await db.collection('ingresos').doc(docId).update({
                    cantidadJabas: cantidad,
                    pollosPorJaba: pollos,
                    pesoBruto: bruto,
                    fechaActualizacion: firebase.firestore.Timestamp.fromDate(new Date())
                });

                // 3. Sumar nuevos valores al inventario
                await sumarStock(pollosNuevos, pesoNuevo);

                mostrarNotificacion('✅ Ingreso actualizado e inventario ajustado', 'success');

                // Recargar la tabla para mostrar los cambios
                setTimeout(() => {
                    cargarIngresosRecientes();
                    // Si el inventario está visible, también actualizarlo
                    if (document.getElementById('inventario').classList.contains('active')) {
                        cargarInventarioGeneral();
                    }
                }, 300);

            } catch (error) {
                console.error('❌ Error al actualizar:', error);
                mostrarNotificacion('❌ Error al actualizar: ' + error.message, 'error');
            }
        });

    } catch (error) {
        console.error('❌ Error al abrir modal de edición:', error);
        mostrarNotificacion('Error al cargar datos del ingreso', 'error');
    }
}
/**
 * Abre el modal para editar una devolución - CON ACTUALIZACIÓN DE INVENTARIO
 */
async function abrirModalEditarDevolucion(id) {
    console.log('🎯 Abriendo modal para editar devolución:', id);

    try {
        const snap = await db.collection('devoluciones').where('id', '==', id).get();

        if (snap.empty) {
            console.error('❌ Devolución no encontrada');
            mostrarNotificacion('Devolución no encontrada', 'error');
            return;
        }

        const data = snap.docs[0].data();
        const docId = snap.docs[0].id;

        // Guardar valores originales para ajustar inventario
        const valoresOriginales = {
            cantidadJabas: data.cantidadJabas || 0,
            pollosPorJaba: data.pollosPorJaba || 0,
            pesoJaba: data.pesoJaba || 0,
            pesoBruto: data.pesoBruto || 0
        };

        // Opciones de motivos
        const motivos = ['MALTRATADO', 'MUERTO', 'OTRO'];
        const opcionesMotivo = motivos.map(motivo =>
            `<option value="${motivo}" ${data.motivo === motivo ? 'selected' : ''}>${motivo}</option>`
        ).join('');

        const modal = crearModal('Editar Devolución 🔄', `
            <form id="formEditarDevolucion" class="row g-3 needs-validation" novalidate>
                <div class="col-md-3">
                    <label class="form-label">Cantidad de Jabas</label>
                    <input type="number" id="editCantidadJabasDev" class="form-control" value="${data.cantidadJabas}" min="1" required />
                </div>
                <div class="col-md-3">
                    <label class="form-label">Pollos x Jaba</label>
                    <input type="number" id="editPollosPorJabaDev" class="form-control" value="${data.pollosPorJaba}" min="1" required />
                </div>
                <div class="col-md-3">
                    <label class="form-label">Peso x Jaba (kg)</label>
                    <input type="number" id="editPesoJabaDev" class="form-control" step="0.01" value="${data.pesoJaba}" required />
                </div>
                <div class="col-md-3">
                    <label class="form-label">Peso Bruto (kg)</label>
                    <input type="number" id="editPesoBrutoDev" class="form-control" step="0.01" value="${data.pesoBruto}" required />
                </div>
                <div class="col-md-6">
                    <label class="form-label">Motivo de Devolución</label>
                    <select id="editMotivoDevolucion" class="form-select" required>
                        ${opcionesMotivo}
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Producto</label>
                    <input type="text" class="form-control" value="${data.producto || 'POLLO VIVO'}" readonly />
                </div>
            </form>
        `, async () => {
            // ===== NUEVA SECCIÓN CON ACTUALIZACIÓN DE INVENTARIO =====
            try {
                const cantidadJabas = Number(document.getElementById('editCantidadJabasDev').value);
                const pollosPorJaba = Number(document.getElementById('editPollosPorJabaDev').value);
                const pesoJaba = Number(document.getElementById('editPesoJabaDev').value);
                const pesoBruto = Number(document.getElementById('editPesoBrutoDev').value);
                const motivo = document.getElementById('editMotivoDevolucion').value;

                // Validar
                if (!cantidadJabas || !pollosPorJaba || !pesoJaba || !pesoBruto) {
                    mostrarNotificacion('❌ Complete todos los campos', 'warning');
                    return;
                }

                // Calcular valores originales
                const totalPollosOriginal = data.cantidadJabas * data.pollosPorJaba;
                const pesoNetoOriginal = data.pesoBruto - (data.cantidadJabas * data.pesoJaba);

                // Calcular nuevos valores
                const totalPollosNuevo = cantidadJabas * pollosPorJaba;
                const pesoNetoNuevo = pesoBruto - (cantidadJabas * pesoJaba);

                // ===== ACTUALIZACIÓN DE INVENTARIO AL EDITAR DEVOLUCIONES =====
                // 1. Sumar valores originales al inventario (deshacer la devolución original)
                console.log(`➕ Sumando devolución original al stock: ${totalPollosOriginal} pollos, ${pesoNetoOriginal} kg`);
                await sumarStock(totalPollosOriginal, pesoNetoOriginal);

                // 2. Actualizar el documento en Firestore
                await db.collection('devoluciones').doc(docId).update({
                    cantidadJabas: cantidadJabas,
                    pollosPorJaba: pollosPorJaba,
                    pesoJaba: pesoJaba,
                    pesoBruto: pesoBruto,
                    pesoNeto: pesoNeto,
                    totalPollos: totalPollosNuevo,
                    motivo: motivo,
                    fechaActualizacion: firebase.firestore.Timestamp.now()
                });

                // 3. Restar nuevos valores del inventario (nueva devolución)
                console.log(`➖ Restando nueva devolución del stock: ${totalPollosNuevo} pollos, ${pesoNetoNuevo} kg`);
                await restarStock(totalPollosNuevo, pesoNetoNuevo);

                mostrarNotificacion('✅ Devolución actualizada e inventario ajustado', 'success');
                cargarDevolucionesDesdeUltimoCierre();

                // Si el inventario está visible, también actualizarlo
                if (document.getElementById('inventario').classList.contains('active')) {
                    cargarInventarioGeneral();
                }

            } catch (error) {
                console.error('❌ Error al actualizar devolución:', error);
                mostrarNotificacion('Error al actualizar devolución', 'error');
            }
        });

    } catch (error) {
        console.error('❌ Error al abrir modal de devolución:', error);
        mostrarNotificacion('Error al cargar datos de devolución', 'error');
    }
}
// ✅ Archivar y luego eliminar un ingreso
async function archivarYEliminarIngreso(docId, data) {
    try {
        // 1. Guardar en ingresos_eliminados
        await db.collection('ingresos_eliminados').add({
            ...data,
            fechaEliminacion: firebase.firestore.Timestamp.fromDate(obtenerFechaPeru()),
            eliminadoPor: obtenerUsuarioActual()?.email || 'sistema'
        });

        // 2. Eliminar de ingresos
        await db.collection('ingresos').doc(docId).delete();

        mostrarNotificacion('✅ Ingreso archivado y eliminado', 'success');
    } catch (error) {
        console.error('❌ Error al archivar/eliminar:', error);
        mostrarNotificacion('Error al eliminar ingreso', 'error');
    }
}

// ✅ Archivar y luego eliminar una salida
async function archivarYEliminarSalida(docId, data) {
    try {
        // 1. Guardar en salidas_eliminadas
        await db.collection('salidas_eliminadas').add({
            ...data,
            fechaEliminacion: firebase.firestore.Timestamp.fromDate(obtenerFechaPeru()),
            eliminadoPor: obtenerUsuarioActual()?.email || 'sistema'
        });

        // 2. Eliminar de salidas
        await db.collection('salidas').doc(docId).delete();

        mostrarNotificacion('✅ Salida archivada y eliminada', 'success');
    } catch (error) {
        console.error('❌ Error al archivar/eliminar:', error);
        mostrarNotificacion('Error al eliminar salida', 'error');
    }
}