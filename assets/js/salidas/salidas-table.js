// ============================================
// SALIDAS TABLE - CÓDIGO COMPLETO FUNCIONAL
// ============================================

/**
 * Carga todas las salidas ordenadas por fecha descendente
 */
async function cargarSalidasDesdeUltimoCierre() {
    try {
        console.log('🔄 Cargando salidas desde último cierre...');

        const snapshot = await db.collection('salidas')
            .orderBy('fecha', 'desc')
            .limit(100)
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.data().id,
            ...doc.data()
        }));

        console.log(`✅ Encontradas ${data.length} salidas`);
        renderTablaSalidas(data);

    } catch (error) {
        console.error('❌ Error al cargar salidas:', error);
        mostrarNotificacion('Error al cargar salidas', 'error');
    }
}

/**
 * Carga salidas por fecha específica
 */
async function cargarSalidasPorFecha(fecha) {
    try {
        const inicio = new Date(fecha + 'T00:00:00');
        const fin = new Date(fecha + 'T23:59:59');

        const snapshot = await db.collection('salidas')
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fecha', 'desc')
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.data().id,
            ...doc.data()
        }));

        renderTablaSalidas(data);

    } catch (error) {
        console.error('❌ Error al cargar salidas por fecha:', error);
        mostrarNotificacion('Error al filtrar salidas', 'error');
    }
}

/**
 * Renderiza la tabla de salidas
 */
function renderTablaSalidas(data) {
    console.log('🎨 Renderizando tabla de salidas...');

    const tbody = document.getElementById('tablaSalidas');
    if (!tbody) {
        console.error('❌ No se encontró el tbody de salidas');
        return;
    }

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" class="text-muted text-center py-4">No hay registros de salidas</td></tr>';
        return;
    }

    data.forEach((d, index) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;

        const promedio = d.totalPollos > 0 ? (d.pesoNeto / d.totalPollos) : 0;

        row.innerHTML = `
            <td><strong>${d.id}</strong></td>
            <td>${formatearFecha(d.fecha)}</td>
            <td>${d.producto || 'POLLO VIVO'}</td>
            <td>${d.tinas}</td>
            <td>${d.kgPorTina.toFixed(2)} KG</td>
            <td>${(d.tinas * d.kgPorTina).toFixed(2)} KG</td>
            <td>${d.pollosPorTina}</td>
            <td><span class="badge bg-primary">${d.totalPollos}</span></td>
            <td>${d.pesoBruto.toFixed(2)} KG</td>
            <td>${d.pesoNeto.toFixed(2)} KG</td>
            <td>${promedio.toFixed(3)} KG</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm btn-editar" 
                        data-id="${d.id}" 
                        data-tipo="salida"
                        title="Editar salida">
                    ✏️
                </button>
            </td>
            <td class="text-center">
                <button class="btn btn-danger btn-sm btn-eliminar" 
                        data-id="${d.id}" 
                        data-tipo="salida"
                        title="Eliminar salida">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    console.log('✅ Tabla renderizada, agregando eventos a botones...');

    // Agregar eventos después de renderizar
    setTimeout(() => {
        agregarEventosSalidas();
    }, 150);
}

/**
 * Agrega eventos a los botones de la tabla de salidas
 */
function agregarEventosSalidas() {
    console.log('🔧 Agregando eventos a botones de salidas...');

    // Limpiar eventos anteriores para evitar duplicados
    document.querySelectorAll('.btn-editar[data-tipo="salida"]').forEach(btn => {
        const nuevoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBtn, btn);
    });

    document.querySelectorAll('.btn-eliminar[data-tipo="salida"]').forEach(btn => {
        const nuevoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBtn, btn);
    });

    // Agregar eventos de EDITAR
    document.querySelectorAll('.btn-editar[data-tipo="salida"]').forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const id = this.dataset.id;
            console.log('📝 Botón editar clickeado - ID:', id);

            try {
                await abrirModalEditarSalida(id);
            } catch (error) {
                console.error('❌ Error al abrir modal:', error);
                mostrarNotificacion('Error al editar salida', 'error');
            }
        });
    });

    // Agregar eventos de ELIMINAR
    document.querySelectorAll('.btn-eliminar[data-tipo="salida"]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const id = this.dataset.id;
            console.log('🗑️ Botón eliminar clickeado - ID:', id);
            confirmarEliminarSalida(id);
        });
    });

    console.log('✅ Eventos agregados correctamente');
}

// Abre el modal para editar una salida
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

                // Actualizar en Firestore
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

                mostrarNotificacion('✅ Salida actualizada correctamente', 'success');

                // Recargar la tabla para mostrar los cambios
                setTimeout(() => {
                    cargarSalidasDesdeUltimoCierre();
                }, 300);

            } catch (error) {
                console.error('❌ Error al actualizar salida:', error);
                mostrarNotificacion('Error al actualizar salida: ' + error.message, 'error');
            }
        });

    } catch (error) {
        console.error('❌ Error al abrir modal de edición:', error);
        mostrarNotificacion('Error al cargar datos de la salida', 'error');
    }
}
/**
 * Confirma y elimina una salida
 */
async function confirmarEliminarSalida(id) {
    try {
        const snap = await db.collection('salidas').where('id', '==', id).get();
        if (snap.empty) {
            mostrarNotificacion('Salida no encontrada', 'error');
            return;
        }

        const data = snap.docs[0].data();

        mostrarModalConfirmacion({
            titulo: '¿Eliminar Salida? 🗑️',
            contenido: `
                <div class="alert alert-warning">
                    <h6>Datos de la salida a eliminar:</h6>
                    <hr>
                    <p><strong>ID:</strong> ${data.id}</p>
                    <p><strong>Tinas:</strong> ${data.tinas}</p>
                    <p><strong>Total pollos:</strong> <span class="badge bg-primary">${data.totalPollos}</span></p>
                    <p><strong>Peso neto:</strong> ${data.pesoNeto.toFixed(2)} kg</p>
                    <p><strong>Destino:</strong> ${data.tienda}</p>
                </div>
                <div class="alert alert-danger">
                    <strong>⚠️ Importante:</strong> Esta acción devolverá los pollos y kilos al inventario.
                </div>
            `,
            textoConfirmar: 'Sí, eliminar',
            textoCancelar: 'Cancelar',
            alConfirmar: async () => {
                try {
                    // Devolver al stock (porque estamos eliminando una salida)
                    console.log(`➕ Devolviendo al stock: ${data.totalPollos} pollos, ${data.pesoNeto} kg`);
                    await sumarStock(data.totalPollos, data.pesoNeto);

                    // Eliminar de Firestore
                    await archivarYEliminarSalida(snap.docs[0].id, data);

                    mostrarNotificacion('✅ Salida eliminada y stock actualizado', 'success');

                    // Recargar tabla y actualizar inventario
                    setTimeout(() => {
                        cargarSalidasDesdeUltimoCierre();
                        if (document.getElementById('inventario').classList.contains('active')) {
                            cargarInventarioGeneral();
                        }
                    }, 300);

                } catch (error) {
                    console.error('❌ Error al eliminar:', error);
                    mostrarNotificacion('Error al eliminar salida', 'error');
                }
            }
        });

    } catch (error) {
        console.error('❌ Error al preparar eliminación:', error);
        mostrarNotificacion('Error al procesar eliminación', 'error');
    }
}


// ============================================
// FUNCIONES GLOBALES
// ============================================

// Hacer disponibles globalmente
window.cargarSalidasDesdeUltimoCierre = cargarSalidasDesdeUltimoCierre;
window.cargarSalidasPorFecha = cargarSalidasPorFecha;
window.abrirModalEditarSalida = abrirModalEditarSalida;
window.confirmarEliminarSalida = confirmarEliminarSalida;

console.log('✅ Módulo de salidas cargado completamente');