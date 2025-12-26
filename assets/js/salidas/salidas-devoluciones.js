// assets/js/salidas/salidas-devoluciones.js - COMPLETO Y CORREGIDO

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("devoluciones");
    container.innerHTML = `
    <div class="card p-4 mb-4">
      <h4 class="text-warning mb-3">REGISTRAR DEVOLUCIONES 🔄</h4>
      <form id="formDevoluciones" class="row g-3 needs-validation" novalidate>
        <div class="col-md-3">
          <label class="form-label">Cantidad de Jabas</label>
          <input type="number" id="cantidadJabasDev" class="form-control" value="6" min="1" required />
        </div>
        <div class="col-md-3">
          <label class="form-label">Pollos x Jaba</label>
          <input type="number" id="pollosPorJabaDev" class="form-control" value="7" min="1" required />
        </div>
        <div class="col-md-3">
          <label class="form-label">Peso x Jaba (kg)</label>
          <input type="number" id="pesoJabaDev" class="form-control" step="0.01" min="0" required />
        </div>
        <div class="col-md-3">
          <label class="form-label">Peso Bruto (kg)</label>
          <input type="number" id="pesoBrutoDev" class="form-control" step="0.01" min="0.01" required />
        </div>
        <div class="col-md-6">
          <label class="form-label">Motivo de Devolución</label>
          <select id="motivoDevolucion" class="form-select" required>
            <option disabled selected>Seleccione</option>
            <option>MALTRATADO</option>
            <option>MUERTO</option>
            <option value="OTRO">OTRO</option>
          </select>
        </div>
        <div class="col-md-6 d-none" id="otroMotivoDiv">
          <label class="form-label">Especifique el motivo</label>
          <input type="text" id="otroMotivo" class="form-control" />
        </div>
        <div class="col-12 text-end">
          <button type="submit" class="btn btn-warning">Registrar Devolución</button>
        </div>
      </form>
    </div>

    <div class="card p-4">
      <h5 class="text-secondary mb-3">Devoluciones Registradas</h5>
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="input-group" style="max-width:250px;">
          <span class="input-group-text">📅</span>
          <input type="date" id="filtroFechaDevoluciones" class="form-control" />
        </div>
        <div>
          <button class="btn btn-primary" id="btnBuscarDevoluciones">Buscar</button>
          <button class="btn btn-secondary ms-2" id="btnLimpiarDevoluciones">🧹 Limpiar</button>
          <button class="btn btn-success ms-2" id="btnExportarDevoluciones">📊 Exportar Excel</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered text-center align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Producto</th>
              <th>Jabas</th>
              <th>Kg/Jaba</th>
              <th>Total Jabas</th>
              <th>Pollos/Jaba</th>
              <th>Total Pollos</th>
              <th>Bruto</th>
              <th>Neto</th>
              <th>Promedio</th>
              <th>Motivo</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody id="tablaDevoluciones"></tbody>
        </table>
      </div>
      <nav aria-label="Paginación de devoluciones" class="d-flex justify-content-center">
        <ul class="pagination pagination-sm">
          <li class="page-item"><button class="page-link" id="btnPaginaAnteriorDevoluciones">⬅️ Anterior</button></li>
          <li class="page-item"><button class="page-link" id="btnPaginaSiguienteDevoluciones">Siguiente ➡️</button></li>
        </ul>
      </nav>
    </div>
  `;

    // Eventos
    document.getElementById('formDevoluciones').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            e.target.classList.add('was-validated');
            return;
        }

        const cantidadJabas = Number(document.getElementById('cantidadJabasDev').value);
        const pollosPorJaba = Number(document.getElementById('pollosPorJabaDev').value);
        const pesoJaba = Number(document.getElementById('pesoJabaDev').value);
        const pesoBruto = Number(document.getElementById('pesoBrutoDev').value);
        const motivo = document.getElementById('motivoDevolucion').value;

        // CÁLCULO CORREGIDO
        const totalPollos = cantidadJabas * pollosPorJaba;
        const pesoNeto = pesoBruto - (cantidadJabas * pesoJaba);

        mostrarModalConfirmacion({
            titulo: '¿Registrar devolución?',
            contenido: `
      <p><strong>Jabas:</strong> ${cantidadJabas}</p>
      <p><strong>Pollos por jaba:</strong> ${pollosPorJaba}</p>
      <p><strong>Total pollos:</strong> ${totalPollos}</p>
      <p><strong>Peso neto:</strong> ${pesoNeto.toFixed(2)} kg</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
    `,
            textoConfirmar: 'Registrar',
            alConfirmar: async () => {
                await registrarDevolucion();
            }
        });
    });

    document.getElementById("btnBuscarDevoluciones").addEventListener("click", () => {
        const fecha = document.getElementById("filtroFechaDevoluciones").value;
        if (!fecha) return alert("Seleccione una fecha");
        cargarDevolucionesPorFecha(fecha);
    });

    document.getElementById("btnLimpiarDevoluciones").addEventListener("click", () => {
        document.getElementById("filtroFechaDevoluciones").value = "";
        cargarDevolucionesDesdeUltimoCierre();
    });

    document.getElementById("btnExportarDevoluciones").addEventListener("click", () => {
        exportarDevolucionesExcel();
    });

    // Cambio en motivo
    document.getElementById("motivoDevolucion").addEventListener("change", function () {
        const otroDiv = document.getElementById("otroMotivoDiv");
        if (this.value === "OTRO") {
            otroDiv.classList.remove("d-none");
            document.getElementById("otroMotivo").focus();
        } else {
            otroDiv.classList.add("d-none");
            document.getElementById("otroMotivo").value = "";
        }
    });

    // Cargar datos al inicio
    cargarDevolucionesDesdeUltimoCierre();
});

/**
 * Registra una devolución en Firebase - CORREGIDO
 * Las devoluciones RESTAN del inventario (llegaron mal)
 */
async function registrarDevolucion() {
    try {
        const cantidadJabas = Number(document.getElementById("cantidadJabasDev").value);
        const pollosPorJaba = Number(document.getElementById("pollosPorJabaDev").value);
        const pesoJaba = Number(document.getElementById("pesoJabaDev").value);
        const pesoBruto = Number(document.getElementById("pesoBrutoDev").value);
        const motivo = document.getElementById("motivoDevolucion").value;
        const otroMotivo = document.getElementById("otroMotivo").value;
        const motivoFinal = motivo === "OTRO" ? otroMotivo : motivo;

        // Cálculo corregido
        const totalPollos = cantidadJabas * pollosPorJaba;
        const pesoNeto = pesoBruto - (cantidadJabas * pesoJaba);

        console.log('📊 Registrando devolución:', {
            cantidadJabas, pollosPorJaba, totalPollos, pesoJaba, pesoBruto, pesoNeto
        });

        const id = "PLDV" + Date.now().toString().slice(-5);

        // Guardar en Firestore
        await db.collection("devoluciones").add({
            id,
            fecha: firebase.firestore.Timestamp.fromDate(new Date()),
            producto: "POLLO VIVO",
            cantidadJabas,
            pollosPorJaba,
            pesoJaba,
            pesoBruto,
            pesoNeto,
            totalPollos,
            motivo: motivoFinal,
            fechaHoraInicio: firebase.firestore.Timestamp.fromDate(new Date())
        });

        // ===== CORRECCIÓN LÓGICA =====
        // Las devoluciones RESTAN del inventario (llegaron mal, no están disponibles)
        console.log(`➖ Devolución registrada, RESTANDO del stock: ${totalPollos} pollos, ${pesoNeto} kg`);
        await restarStock(totalPollos, pesoNeto);

        mostrarNotificacion(
            `✅ Devolución registrada: ${totalPollos} pollos restados del inventario`,
            "success"
        );

        // Limpiar formulario
        document.getElementById("formDevoluciones").reset();
        document.getElementById("otroMotivoDiv").classList.add("d-none");

        // Recargar tabla
        cargarDevolucionesDesdeUltimoCierre();

    } catch (e) {
        console.error("❌ Error al registrar devolución:", e);
        mostrarNotificacion("Error al registrar devolución: " + e.message, "error");
    }
}
/**
 * Carga devoluciones desde el último cierre
 */
async function cargarDevolucionesDesdeUltimoCierre() {
    try {
        console.log('🔄 Cargando devoluciones...');

        const snapshot = await db.collection("devoluciones")
            .orderBy("fecha", "desc")
            .limit(100)
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.data().id,
            ...doc.data()
        }));

        console.log(`✅ Encontradas ${data.length} devoluciones`);
        renderTablaDevoluciones(data);

    } catch (error) {
        console.error("❌ Error al cargar devoluciones:", error);
        mostrarNotificacion("Error al cargar devoluciones", "error");
    }
}

/**
 * Carga devoluciones por fecha específica
 */
async function cargarDevolucionesPorFecha(fecha) {
    try {
        const inicio = new Date(fecha + 'T00:00:00');
        const fin = new Date(fecha + 'T23:59:59');

        const snapshot = await db.collection("devoluciones")
            .where("fecha", ">=", firebase.firestore.Timestamp.fromDate(inicio))
            .where("fecha", "<=", firebase.firestore.Timestamp.fromDate(fin))
            .orderBy("fecha", "desc")
            .get();

        const data = snapshot.docs.map(doc => ({
            id: doc.data().id,
            ...doc.data()
        }));

        renderTablaDevoluciones(data);

    } catch (error) {
        console.error("❌ Error al cargar devoluciones por fecha:", error);
        mostrarNotificacion("Error al filtrar devoluciones", "error");
    }
}

/**
 * Renderiza la tabla de devoluciones - CORREGIDO EL NaN
 */
function renderTablaDevoluciones(data) {
    console.log('🎨 Renderizando tabla de devoluciones...');

    const tbody = document.getElementById("tablaDevoluciones");
    if (!tbody) {
        console.error('❌ No se encontró el tbody de devoluciones');
        return;
    }

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="14" class="text-muted text-center py-4">No hay devoluciones registradas</td></tr>';
        return;
    }

    data.forEach((d, index) => {
        const row = document.createElement("tr");
        row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;

        // CÁLCULOS CON VALIDACIÓN PARA EVITAR NaN
        const cantidadJabas = d.cantidadJabas || 0;
        const pollosPorJaba = d.pollosPorJaba || 0;
        const pesoJaba = d.pesoJaba || 0;
        const pesoBruto = d.pesoBruto || 0;
        const totalPollos = cantidadJabas * pollosPorJaba;
        const pesoNeto = pesoBruto - (cantidadJabas * pesoJaba);
        const promedio = totalPollos > 0 ? (pesoNeto / totalPollos) : 0;

        row.innerHTML = `
            <td><strong>${d.id}</strong></td>
            <td>${formatearFecha(d.fecha)}</td>
            <td>${d.producto || 'POLLO VIVO'}</td>
            <td>${cantidadJabas}</td>
            <td>${pesoJaba.toFixed(2)} KG</td>
            <td>${(cantidadJabas * pesoJaba).toFixed(2)} KG</td>
            <td>${pollosPorJaba}</td>
            <td><span class="badge bg-warning">${totalPollos}</span></td>
            <td>${pesoBruto.toFixed(2)} KG</td>
            <td>${pesoNeto.toFixed(2)} KG</td>
            <td>${promedio.toFixed(3)} KG</td>
            <td><span class="badge bg-danger">${d.motivo || 'SIN MOTIVO'}</span></td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm btn-editar" 
                        data-id="${d.id}" 
                        data-tipo="devolucion"
                        title="Editar devolución">
                    ✏️
                </button>
            </td>
            <td class="text-center">
                <button class="btn btn-danger btn-sm btn-eliminar" 
                        data-id="${d.id}" 
                        data-tipo="devolucion"
                        title="Eliminar devolución">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    console.log('✅ Tabla de devoluciones renderizada');

    // Agregar eventos después de renderizar
    setTimeout(() => {
        agregarEventosDevoluciones();
    }, 150);
}

/**
 * Agrega eventos a los botones de devoluciones
 */
function agregarEventosDevoluciones() {
    console.log('🔧 Agregando eventos a botones de devoluciones...');

    // Limpiar eventos anteriores para evitar duplicados
    document.querySelectorAll('.btn-editar[data-tipo="devolucion"]').forEach(btn => {
        const nuevoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBtn, btn);
    });

    document.querySelectorAll('.btn-eliminar[data-tipo="devolucion"]').forEach(btn => {
        const nuevoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBtn, btn);
    });

    // Agregar eventos de EDITAR
    document.querySelectorAll('.btn-editar[data-tipo="devolucion"]').forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const id = this.dataset.id;
            console.log('📝 Botón editar devolución clickeado - ID:', id);

            try {
                await abrirModalEditarDevolucion(id);
            } catch (error) {
                console.error('❌ Error al abrir modal de devolución:', error);
                mostrarNotificacion('Error al editar devolución', 'error');
            }
        });
    });

    // Agregar eventos de ELIMINAR
    document.querySelectorAll('.btn-eliminar[data-tipo="devolucion"]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const id = this.dataset.id;
            console.log('🗑️ Botón eliminar devolución clickeado - ID:', id);
            confirmarEliminarDevolucion(id);
        });
    });

    console.log('✅ Eventos de devoluciones agregados');
}

/**
 * Abre el modal para editar una devolución
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

                // Calcular
                const totalPollos = cantidadJabas * pollosPorJaba;
                const pesoNeto = pesoBruto - (cantidadJabas * pesoJaba);

                await db.collection('devoluciones').doc(docId).update({
                    cantidadJabas: cantidadJabas,
                    pollosPorJaba: pollosPorJaba,
                    pesoJaba: pesoJaba,
                    pesoBruto: pesoBruto,
                    pesoNeto: pesoNeto,
                    totalPollos: totalPollos,
                    motivo: motivo,
                    fechaActualizacion: firebase.firestore.Timestamp.now()
                });

                mostrarNotificacion('✅ Devolución actualizada', 'success');
                cargarDevolucionesDesdeUltimoCierre();

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

// confirmarEliminarDevolucion
/**
 * Confirma y elimina una devolución - LÓGICA CORRECTA
 * Cuando se elimina una devolución, esos pollos VUELVEN al inventario
 * porque nunca se debieron devolver (fue un error de registro)
 */
async function confirmarEliminarDevolucion(id) {
    try {
        const snap = await db.collection('devoluciones').where('id', '==', id).get();
        if (snap.empty) {
            mostrarNotificacion('Devolución no encontrada', 'error');
            return;
        }

        const data = snap.docs[0].data();

        mostrarModalConfirmacion({
            titulo: '¿Eliminar Devolución? 🗑️',
            contenido: `
                <div class="alert alert-warning">
                    <h6>Datos de la devolución a eliminar:</h6>
                    <hr>
                    <p><strong>ID:</strong> ${data.id}</p>
                    <p><strong>Jabas:</strong> ${data.cantidadJabas}</p>
                    <p><strong>Total pollos:</strong> <span class="badge bg-warning">${data.totalPollos || 0}</span></p>
                    <p><strong>Peso neto:</strong> ${(data.pesoNeto || 0).toFixed(2)} kg</p>
                    <p><strong>Motivo:</strong> ${data.motivo}</p>
                </div>
                <div class="alert alert-info">
                    <strong>ℹ️ Importante:</strong> Al eliminar esta devolución, los pollos <strong>VOLVERÁN</strong> al inventario (fue un error de registro).
                </div>
            `,
            textoConfirmar: 'Sí, eliminar',
            textoCancelar: 'Cancelar',
            alConfirmar: async () => {
                try {
                    // Calcular valores de la devolución
                    const totalPollos = data.cantidadJabas * data.pollosPorJaba;
                    const pesoNeto = data.pesoBruto - (data.cantidadJabas * data.pesoJaba);

                    // ===== LÓGICA CORRECTA =====
                    // Cuando se ELIMINA una devolución, esos pollos VUELVEN al inventario
                    // porque nunca se debieron devolver (era un error de registro)
                    console.log(`➕ Eliminando devolución, DEVOLVIENDO al stock: ${totalPollos} pollos, ${pesoNeto} kg`);
                    await sumarStock(totalPollos, pesoNeto);

                    // Eliminar de Firestore
                    await db.collection('devoluciones').doc(snap.docs[0].id).delete();

                    mostrarNotificacion('✅ Devolución eliminada y pollos devueltos al inventario', 'success');

                    // Recargar tabla y actualizar inventario
                    setTimeout(() => {
                        cargarDevolucionesDesdeUltimoCierre();
                        if (document.getElementById('inventario').classList.contains('active')) {
                            cargarInventarioGeneral();
                        }
                    }, 300);

                } catch (error) {
                    console.error('❌ Error al eliminar devolución:', error);
                    mostrarNotificacion('Error al eliminar devolución', 'error');
                }
            }
        });

    } catch (error) {
        console.error('❌ Error al preparar eliminación de devolución:', error);
        mostrarNotificacion('Error al procesar eliminación', 'error');
    }
}
/**
 * Exporta devoluciones a Excel
 */
function exportarDevolucionesExcel() {
    const tabla = document.getElementById('tablaDevoluciones');
    if (!tabla || tabla.rows.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    try {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(tabla.closest('table'));

        XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
        const fecha = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `devoluciones_${fecha}.xlsx`);

    } catch (error) {
        console.error('❌ Error al exportar:', error);
        mostrarNotificacion('Error al exportar devoluciones', 'error');
    }
}

// ============================================
// FUNCIONES GLOBALES
// ============================================

// Hacer disponibles globalmente
window.cargarDevolucionesDesdeUltimoCierre = cargarDevolucionesDesdeUltimoCierre;
window.cargarDevolucionesPorFecha = cargarDevolucionesPorFecha;
window.abrirModalEditarDevolucion = abrirModalEditarDevolucion;
window.confirmarEliminarDevolucion = confirmarEliminarDevolucion;
window.exportarDevolucionesExcel = exportarDevolucionesExcel;

console.log('✅ Módulo de devoluciones cargado completamente');