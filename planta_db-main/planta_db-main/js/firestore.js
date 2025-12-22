// firestore.js
let paginaActual = 1;  // Página inicial
let totalRegistros = 0; // Total de registros

// Función para cargar los datos por día en la tabla con soporte de paginación
// Función para cargar los datos por día en la tabla con soporte de paginación
async function cargarDatosPorDia(fecha, coleccion, tbodyId, paginaActual) {
    const collectionRef = coleccion === 'registros' ? registrosRef : eliminadosRef;
    const inicioDia = getInicioDelDia(fecha);
    const finDia = getFinDelDia(fecha);

    let query = collectionRef;

    // Si estamos buscando por fecha, agregamos el filtro
    if (coleccion === 'registros') {
        query = query
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicioDia))
            .where('fecha', '<', firebase.firestore.Timestamp.fromDate(finDia));
    } else {
        query = query
            .where('fechaEliminacion', '>=', firebase.firestore.Timestamp.fromDate(inicioDia))
            .where('fechaEliminacion', '<', firebase.firestore.Timestamp.fromDate(finDia));
    }

    // Paginación: manejamos la paginación con Firestore
    const registrosPorPagina = 10;  // Número de registros por página
    let offset = (paginaActual - 1) * registrosPorPagina;

    query = query.limit(registrosPorPagina);

    // Si no estamos en la primera página, usamos startAfter para empezar desde el último documento visible
    if (paginaActual > 1) {
        const lastDoc = await getLastDocument(coleccion, paginaActual - 1);
        query = query.startAfter(lastDoc);
    }

    // Ejecutamos la consulta y obtenemos los resultados
    const snapshot = await query.get();
    const dataArray = snapshot.docs.map(doc => doc.data());

    // Renderizamos la tabla
    await renderTabla(dataArray, tbodyId);

    // Actualizamos la paginación
    actualizarPaginacion(paginaActual, snapshot.size, snapshot.docs.length);
}

// Función para obtener el último documento de la página anterior
async function getLastDocument(coleccion, paginaAnterior) {
    const collectionRef = coleccion === 'registros' ? registrosRef : eliminadosRef;
    const query = collectionRef.orderBy('fecha').limit((paginaAnterior - 1) * 10);
    const snapshot = await query.get();
    return snapshot.docs[snapshot.docs.length - 1];
}

// Función para actualizar la paginación
function actualizarPaginacion(paginaActual, totalRegistros, numDocs) {
    const registrosPorPagina = 10;  // Número de registros por página
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    const btnPaginaAnterior = document.getElementById('btnPaginaAnterior');
    const btnPaginaSiguiente = document.getElementById('btnPaginaSiguiente');

    // Habilitar o deshabilitar los botones de paginación
    btnPaginaAnterior.disabled = paginaActual <= 1;
    btnPaginaSiguiente.disabled = numDocs < registrosPorPagina || paginaActual >= totalPaginas;
}

// Esta función elimina un registro
// Reemplazar completamente la función eliminarRegistro
async function eliminarRegistro(e) {
    // Prevenir múltiples clicks
    e.preventDefault();
    e.stopPropagation();

    // Deshabilitar temporalmente el botón
    const boton = e.target;
    boton.disabled = true;

    try {
        const id = boton.dataset.id;

        // Obtener el registro
        const snap = await registrosRef.where('id', '==', id).get();
        if (snap.empty) {
            mostrarNotificacion('❌ Registro no encontrado', 'error');
            boton.disabled = false;
            return;
        }

        const registro = snap.docs[0].data();

        // Crear modal de confirmación
        await crearModalConfirmacionUnico(registro, async () => {
            try {
                loadingManager.mostrar();

                // Mover a eliminados
                await eliminadosRef.add({
                    ...registro,
                    fechaEliminacion: firebase.firestore.Timestamp.fromDate(new Date())
                });

                // Eliminar de registros
                await registrosRef.doc(snap.docs[0].id).delete();

                // Actualizar stock
                const { cPollos, neto } = calcular(
                    registro.cantidadJabas,
                    registro.pollosPorJaba,
                    registro.pesoBruto,
                    registro.pesoJaba
                );

                await actualizarStock(registro.producto, cPollos, neto, 'restar');

                // Recargar datos
                await cargarDatosInicial();

                mostrarNotificacion('✅ Registro eliminado exitosamente', 'success');

            } catch (error) {
                console.error('Error al eliminar:', error);
                mostrarNotificacion('❌ Error al eliminar registro', 'error');
            } finally {
                loadingManager.ocultar();
            }
        });

    } catch (error) {
        console.error('Error en eliminarRegistro:', error);
        mostrarNotificacion('❌ Error al procesar eliminación', 'error');
    } finally {
        boton.disabled = false;
    }
}

// Función para crear un modal único sin duplicados
async function crearModalConfirmacionUnico(registro, onConfirm) {
    // Eliminar cualquier modal existente
    const modalesExistentes = document.querySelectorAll('#confirmModalUnico, #confirmModal');
    modalesExistentes.forEach(modal => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
        modal.remove();
    });

    // Limpiar backdrops residuales
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const modalHtml = `
        <div class="modal fade" id="confirmModalUnico" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>Confirmar Eliminación
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Está seguro de eliminar este registro?</p>
                        <div class="alert alert-warning">
                            <strong>Detalles del registro:</strong>
                            <ul class="mb-0">
                                <li><strong>ID:</strong> ${registro.id}</li>
                                <li><strong>Producto:</strong> ${registro.producto}</li>
                                <li><strong>Pollos:</strong> ${registro.cantidadJabas * registro.pollosPorJaba}</li>
                                <li><strong>Peso Bruto:</strong> ${registro.pesoBruto.toFixed(2)} KG</li>
                                <li><strong>Fecha:</strong> ${formatearFecha(registro.fecha)}</li>
                            </ul>
                        </div>
                        <p class="text-danger mb-0"><strong>⚠️ Esta acción no se puede deshacer y afectará el stock.</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" id="btnConfirmarEliminar">
                            <i class="fas fa-trash me-2"></i>Eliminar Registro
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalElement = document.getElementById('confirmModalUnico');
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });

    modal.show();

    // Configurar eventos
    const btnConfirmar = modalElement.querySelector('#btnConfirmarEliminar');
    const btnCancelar = modalElement.querySelector('[data-bs-dismiss="modal"]');

    const limpiarYManejar = (accion) => {
        modal.hide();
        setTimeout(() => {
            modalElement.remove();
            document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            if (accion === 'confirmar') {
                onConfirm();
            }
        }, 150);
    };

    btnConfirmar.addEventListener('click', () => limpiarYManejar('confirmar'));
    btnCancelar.addEventListener('click', () => limpiarYManejar('cancelar'));

    // Manejar cierre con ESC
    modalElement.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            limpiarYManejar('cancelar');
        }
    });

    // Limpiar si se cierra de otra forma
    modalElement.addEventListener('hidden.bs.modal', () => {
        setTimeout(() => {
            modalElement.remove();
            document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 150);
    }, { once: true });
}
// Función para mostrar el modal de confirmación de eliminación
// Reemplazar la función mostrarConfirmacionEliminacion
function mostrarConfirmacionEliminacion(registro, onConfirm) {
    const modalExistente = document.getElementById('confirmModal');
    if (modalExistente) {
        const bsPrevio = bootstrap.Modal.getInstance(modalExistente);
        if (bsPrevio) {
            bsPrevio.hide();
        }
        modalExistente.remove();
    }

    const modalHtml = `
        <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content p-4">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <p>¿Está seguro de eliminar este registro?</p>
                        <ul>
                            <li>ID: ${registro.id}</li>
                            <li>Peso Bruto: ${registro.pesoBruto.toFixed(2)} KG</li>
                            <li>Fecha: ${formatearFecha(registro.fecha)}</li>
                        </ul>
                        <p class="text-danger"><strong>⚠️ Este cambio afectará el stock disponible</strong></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="btnConfirmDelete">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById('confirmModal');
    const bs = new bootstrap.Modal(modalEl);
    bs.show();

    const btnConfirmDelete = modalEl.querySelector('#btnConfirmDelete');
    const btnCancelar = modalEl.querySelector('[data-bs-dismiss="modal"]');

    // Función para cerrar y limpiar
    const cerrarModal = () => {
        bs.hide();
        setTimeout(() => {
            modalEl.remove();
        }, 300);
    };

    btnConfirmDelete.addEventListener('click', () => {
        onConfirm();
        cerrarModal();
    });

    btnCancelar.addEventListener('click', cerrarModal);

    // También cerrar si se hace clic fuera del modal
    modalEl.addEventListener('hidden.bs.modal', () => {
        modalEl.remove();
    }, { once: true });
}
// Función para eliminar la fila correspondiente de la tabla
function eliminarFilaDeLaTabla(id) {
    const tbody = document.getElementById('tablaRegistros');
    const filas = Array.from(tbody.getElementsByTagName('tr'));

    // Buscar la fila que corresponde al ID y eliminarla
    filas.forEach(fila => {
        const td = fila.querySelector('td');  // Suponiendo que el ID está en la primera columna
        if (td && td.textContent === id) {
            fila.remove();
        }
    });
}

// Esta función abre el modal de edición con los datos del registro

async function abrirEditar(e) {
    currentEditId = e.target.dataset.id;
    const snap = await registrosRef.where('id', '==', currentEditId).get();
    if (snap.empty) {
        alert('Registro no encontrado');
        return;
    }
    const d = snap.docs[0].data();

    // Llenar formulario
    document.getElementById('editId').value = d.id;
    document.getElementById('editFecha').value = formatearFecha(d.fecha);
    document.getElementById('editProducto').value = d.producto;
    document.getElementById('editCantidadJabas').value = d.cantidadJabas;
    document.getElementById('editPollosPorJaba').value = d.pollosPorJaba;
    document.getElementById('editPesoBruto').value = d.pesoBruto;

    // Crear y mostrar modal
    const modalElement = document.getElementById('editModal');
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });

    modal.show();

    // Limpiar cuando se cierre
    modalElement.addEventListener('hidden.bs.modal', () => {
        modal.dispose();
        // Limpiar el formulario
        document.getElementById('formEdit').reset();
        document.getElementById('formEdit').classList.remove('was-validated');
    }, { once: true });
}

// Función para agregar un nuevo registro a Firestore
// Función para agregar un nuevo registro a Firestore
async function agregarRegistro(form) {
    const cantidad = Number(document.getElementById('cantidadJabas').value); // Obtener la cantidad de jabas
    const pollosJaba = Number(document.getElementById('pollosPorJaba').value); // Obtener los pollos por jaba
    const pesoBr = Number(document.getElementById('pesoBruto').value); // Obtener el peso bruto

    // Obtener el valor de PESO_JABA desde el input
    const pesoJaba = parseFloat(document.getElementById('inputPesoJaba').value);  // Aquí obtenemos el valor ingresado de peso por jaba

    // Validar si el valor de pesoJaba es correcto
    if (isNaN(pesoJaba) || pesoJaba <= 0) {
        alert('Por favor, ingresa un valor válido para el peso por jaba.');
        return;  // Salir si el valor no es válido
    }

    // Mostrar la confirmación del peso bruto antes de guardar
    mostrarConfirmacionPesoBruto(pesoBr, async () => {
        // Obtener el último ID registrado de la base de datos
        const lastDoc = await registrosRef.orderBy('id', 'desc').limit(1).get();

        // Si no hay registros, asignamos el primer ID
        let nextIdNum = 10001;  // Si no hay registros, comenzamos desde 10001

        if (!lastDoc.empty) {
            // Si hay registros, tomamos el último ID
            const lastId = lastDoc.docs[0].data().id;
            const lastIdNum = Number(lastId.slice(4)); // Extraemos el número del ID (por ejemplo, PLEP00001 -> 1)
            nextIdNum = lastIdNum + 1;  // Incrementamos el número para el siguiente ID
        }

        // Generamos el siguiente ID
        const nextId = formatearID(nextIdNum);

        // Crear el objeto con los datos del registro
        const obj = {
            id: nextId,
            fecha: ahoraTimestamp(),  // Guardamos el Timestamp de la fecha actual
            producto: 'POLLO VIVO',  // Producto fijo
            cantidadJabas: cantidad,
            pollosPorJaba: pollosJaba,
            pesoBruto: pesoBr,
            pesoJaba: pesoJaba  // Incluir el valor de PESO_JABA
        };

        // Añadimos el nuevo registro a la base de datos
        await registrosRef.add(obj);
        // 🔹 ACTUALIZAR STOCK
        const stockRef = db.collection('stock').doc(obj.producto);
        const stockSnap = await stockRef.get();

        const { cPollos, neto } = calcular(
            cantidad,
            pollosJaba,
            pesoBr,
            pesoJaba
        );

        if (!stockSnap.exists) {
            await stockRef.set({
                producto: obj.producto,
                cantidadPollos: cPollos,
                pesoNeto: neto
            });
        } else {
            const stock = stockSnap.data();
            await stockRef.update({
                cantidadPollos: stock.cantidadPollos + cPollos,
                pesoNeto: stock.pesoNeto + neto
            });
        }

        form.reset();  // Limpiar el formulario

        // Recargamos los datos después de agregar el nuevo registro
        cargarDatosInicial();
    });
}


// Función para renderizar los datos de la tabla
// async function renderTabla(dataArray, tbodyId) {
//     const tbody = document.getElementById(tbodyId);
//     tbody.innerHTML = '';  // Limpiamos la tabla antes de agregar los nuevos registros

//     dataArray.forEach(item => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//                 <td>${item.id}</td>
//                 <td>${formatearFecha(item.fecha)}</td>
//                 <td>${item.producto}</td>
//                 <td>${item.cantidadJabas}</td>
//                 <td>${item.pollosPorJaba}</td>
//                 <td>${item.pesoBruto}</td>
//                 <td>
//                     <button class="btn btn-warning" data-id="${item.id}" onclick="abrirEditar(event)">Editar</button>
//                     <button class="btn btn-danger" data-id="${item.id}" onclick="eliminarRegistro(event)">Eliminar</button>
//                 </td>
//             `;
//         tbody.appendChild(row);
//     });

//     // Actualizamos las flechas de paginación
//     actualizarPaginacion();
// }

// Función para actualizar la paginación
function actualizarPaginacion(paginaActual, totalRegistros) {
    const registrosPorPagina = 10;  // Cambiar si se necesitan más o menos registros por página
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

    // Obtener los botones
    const btnPaginaAnterior = document.getElementById('btnPaginaAnterior');
    const btnPaginaSiguiente = document.getElementById('btnPaginaSiguiente');

    // Habilitar o deshabilitar los botones de paginación
    if (paginaActual <= 1) {
        btnPaginaAnterior.disabled = false;
    } else {
        btnPaginaAnterior.disabled = false;
    }

    if (paginaActual >= totalPaginas) {
        btnPaginaSiguiente.disabled = false;
    } else {
        btnPaginaSiguiente.disabled = false;
    }
}

// firestore.js - MODIFICAR funciones específicas
async function cargarDatosInicial() {
    await cargarDatosPorDia(new Date(), 'registros', 'tablaRegistros', paginaActual);
    await cargarDatosPorDia(new Date(), 'eliminados', 'tablaEliminados', paginaActual);
}

// registrar salida
async function registrarSalida(data) {
    console.log('🔥 Iniciando registrarSalida...');
    console.log('📋 Datos recibidos:', data);

    try {
        // 🔹 1. VALIDAR CAMPOS CRÍTICOS
        const pesoNeto = data.pesoNeto || data.bruto || 0;

        if (!pesoNeto && pesoNeto !== 0) {
            console.error('❌ pesoNeto es undefined o null');
            throw new Error('El campo pesoNeto no tiene valor');
        }

        // 🔹 2. GENERAR ID PARA SALIDA
        const salidasSnapshot = await salidasRef.orderBy('id', 'desc').limit(1).get();

        let nextIdNum = 10001;

        if (!salidasSnapshot.empty) {
            const lastData = salidasSnapshot.docs[0].data();
            if (lastData.id && lastData.id.startsWith('PLSP')) {
                try {
                    const lastIdNum = Number(lastData.id.slice(4));
                    console.log('📊 Último ID encontrado:', lastData.id, 'Número:', lastIdNum);
                    if (!isNaN(lastIdNum)) {
                        nextIdNum = lastIdNum + 1;
                    }
                } catch (error) {
                    console.warn('⚠️ Error al extraer número del ID:', error);
                }
            }
        }

        const nextId = formatearIDSalida(nextIdNum);
        console.log('🆔 Nuevo ID generado:', nextId);

        // 🔹 3. PREPARAR DATOS COMPLETOS
        const salidaData = {
            id: nextId,
            producto: data.producto || 'POLLO BENEFICIADO',
            tienda: data.tienda || '',
            tinas: data.tinas || 0,
            kgPorTina: data.kgPorTina || 0,
            totalTinas: data.totalTinas || data.tinas || 0,
            pollosPorTina: data.pollosPorTina || 0,
            totalPollos: data.totalPollos || 0,
            bruto: data.bruto || 0,
            pesoNeto: Number(pesoNeto),
            promedio: data.promedio || 0,
            fecha: data.fecha || firebase.firestore.Timestamp.fromDate(new Date())
        };

        console.log('✅ Datos preparados para Firestore:', salidaData);

        // 🔹 4. GUARDAR EN FIRESTORE
        const docRef = salidasRef.doc(nextId);
        await docRef.set(salidaData);
        console.log('📝 Documento creado con ID personalizado:', nextId);

        // 🔹 5. ACTUALIZAR STOCK - MODIFICADO PARA NO MOSTRAR ALERTA
        try {
            const stockRef = db.collection('stock').doc(salidaData.producto);
            const stockSnap = await stockRef.get();

            if (!stockSnap.exists) {
                console.log('⚠️ No existe stock, creando documento...');
                await stockRef.set({
                    producto: salidaData.producto,
                    cantidadPollos: 0,
                    pesoNeto: 0
                });
                console.log('✅ Documento de stock creado');
            }

            // 🔹 OBTENER STOCK ACTUAL
            const stock = (await stockRef.get()).data();

            // 🔹 CALCULAR NUEVO STOCK
            const nuevoStockPollos = Math.max(0, (stock.cantidadPollos || 0) - salidaData.totalPollos);
            const nuevoStockPeso = Math.max(0, (stock.pesoNeto || 0) - salidaData.pesoNeto);

            // 🔹 ACTUALIZAR STOCK
            await stockRef.update({
                cantidadPollos: nuevoStockPollos,
                pesoNeto: nuevoStockPeso
            });

            console.log('📉 Stock actualizado:', {
                anteriorPollos: stock.cantidadPollos,
                nuevoPollos: nuevoStockPollos,
                anteriorPeso: stock.pesoNeto,
                nuevoPeso: nuevoStockPeso
            });

            // 🔹 ELIMINADO: No mostrar alerta de stock bajo
            // if (nuevoStockPollos <= 50 && nuevoStockPollos >= 0) {
            //     mostrarAlertaStock(salidaData.producto, nuevoStockPollos);
            // }

        } catch (stockError) {
            console.warn('⚠️ Error al actualizar stock:', stockError.message);
        }

        return nextId;

    } catch (error) {
        console.error('❌ Error en registrarSalida:', error);
        throw error;
    }
}
// Función para formatear ID de salida
function formatearIDSalida(num) {
    return 'PLSP' + String(num).padStart(5, '0');
}
// firestore.js - Agregar función para editar salida
async function editarSalida(id) {
    const docRef = salidasRef.doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        alert('Salida no encontrada');
        return;
    }

    const data = docSnap.data();

    // Aquí puedes abrir un modal similar al de edición de ingresos
    // Mostrar valores actuales y permitir edición
    console.log('Editar salida:', data);
    // Implementar lógica de edición similar a abrirEditar()
}

async function verificarStockBajo() {
    const snap = await db.collection('stock').doc('POLLO VIVO').get();
    if (!snap.exists) return;

    const data = snap.data();
    const MINIMO = 500;

    // Solo registrar en consola, no mostrar alerta
    if (data.cantidadPollos <= MINIMO) {
        console.log(`ℹ️ Stock bajo: ${data.cantidadPollos} pollos (POLLO VIVO)`);
        // Opcional: Actualizar algún indicador en la UI si lo deseas
    }
}

// eliminar salida

async function eliminarSalida(id) {
    const docRef = salidasRef.doc(id);
    const snap = await docRef.get();

    if (!snap.exists) return;

    const d = snap.data();

    const stockRef = db.collection('stock').doc(d.producto);
    await stockRef.update({
        cantidadPollos: firebase.firestore.FieldValue.increment(d.totalPollos), // CAMBIÉ d.cantidadPollos por d.totalPollos
        pesoNeto: firebase.firestore.FieldValue.increment(d.pesoNeto || d.neto || 0)
    });

    await docRef.delete();
    cargarSalidas();
}

// Función para formatear la fecha de manera legible
function formatearFecha(timestamp) {
    const date = timestamp.toDate();
    return date.toLocaleString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Función para obtener el inicio del día (00:00)
function getInicioDelDia(fecha) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
}

// Función para obtener el final del día (23:59:59)
function getFinDelDia(fecha) {
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);
    return fin;
}

// Función para generar un ID único para el nuevo registro
function formatearID(id) {
    return 'PLIP' + String(id).padStart(5, '0');
}
function formatearIDSalida(num) {
    return 'PLSP' + String(num).padStart(5, '0');
}

// Función para obtener la fecha y hora actual como Timestamp de Firestore
function ahoraTimestamp() {
    return firebase.firestore.Timestamp.fromDate(new Date());
}

// Función para mostrar una confirmación antes de registrar el peso bruto
function mostrarConfirmacionPesoBruto(pesoBruto, onConfirm) {
    const modalExistente = document.getElementById('confirmModal');
    if (modalExistente) {
        const bsPrevio = bootstrap.Modal.getInstance(modalExistente);
        if (bsPrevio) {
            bsPrevio.hide();
        }
        modalExistente.remove();
    }

    const modalHtml = `
        <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content p-4">
                    <h5 class="modal-title mb-3">Confirmación de Eliminación</h5>
                    <p>¿Está seguro de eliminar el registro con peso bruto: <strong>${pesoBruto.toFixed(2)} KG</strong>?</p>
                    <p>Este cambio no se puede deshacer.</p>
                    <div class="text-end">
                        <button data-bs-dismiss="modal" class="btn btn-secondary me-2">Cancelar</button>
                        <button class="btn btn-danger" id="btnConfirmDelete">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById('confirmModal');
    const bs = new bootstrap.Modal(modalEl);
    bs.show();

    modalEl.querySelector('#btnConfirmDelete').addEventListener('click', () => {
        onConfirm(); // Se ejecuta la función pasada por parámetro (eliminar el registro)
        bs.hide(); // Cierra el modal después de confirmar
    });

    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove()); // Eliminar modal del DOM cuando se cierre
}
// Función para ir a la página anterior
function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        cargarDatosInicial();  // Recargamos los datos para la nueva página
    }
}

// Función para ir a la página siguiente
function paginaSiguiente() {
    const totalPaginas = Math.ceil(totalRegistros / 10);  // Total de páginas
    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarDatosInicial();  // Recargamos los datos para la nueva página
    }
}

// firestore.js - AGREGAR al final del archivo

// Función para buscar por fecha
async function buscarRegistrosPorFecha(fecha) {
    const fechaObj = fechaInputADate(fecha);
    await cargarDatosPorDia(fechaObj, 'registros', 'tablaRegistros', 1);
    await cargarDatosPorDia(fechaObj, 'eliminados', 'tablaEliminados', 1);
}

// Función para limpiar búsqueda
function limpiarBusquedaRegistros() {
    document.getElementById('buscarFecha').value = '';
    cargarDatosInicial();
}
// En firestore.js, antes de donde se usa
async function obtenerReportePorTienda(fecha, tienda = null) {
    try {
        const inicioDia = getInicioDelDia(new Date(fecha));
        const finDia = getFinDelDia(new Date(fecha));

        let query = salidasRef
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicioDia))
            .where('fecha', '<', firebase.firestore.Timestamp.fromDate(finDia));

        const snapshot = await query.get();

        const reporte = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const tiendaNombre = data.tienda || 'Sin destino';

            if (tienda && tienda !== tiendaNombre) return;

            if (!reporte[tiendaNombre]) {
                reporte[tiendaNombre] = {
                    totalPollos: 0,
                    totalPeso: 0,
                    registros: 0
                };
            }

            reporte[tiendaNombre].totalPollos += data.totalPollos || 0;
            reporte[tiendaNombre].totalPeso += data.pesoNeto || 0;
            reporte[tiendaNombre].registros += 1;
        });

        return reporte;
    } catch (error) {
        console.error('Error obteniendo reporte por tienda:', error);
        return {};
    }
}
// Hacer disponibles globalmente
window.buscarRegistrosPorFecha = buscarRegistrosPorFecha;
window.limpiarBusquedaRegistros = limpiarBusquedaRegistros;

// firestore.js - AL FINAL DEL ARCHIVO, AGREGAR:
// Hacer funciones disponibles globalmente
window.cargarDatosInicial = cargarDatosInicial;
window.verificarStockBajo = verificarStockBajo;
window.registrarSalida = registrarSalida;
window.editarSalida = editarSalida;
window.eliminarSalida = eliminarSalida;
window.obtenerReportePorTienda = obtenerReportePorTienda;
window.agregarRegistro = agregarRegistro;
window.abrirEditar = abrirEditar;
window.eliminarRegistro = eliminarRegistro;