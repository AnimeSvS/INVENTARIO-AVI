// assets/js/ingresos/ingresos-table.js

async function cargarIngresosRecientes() {
    const ahora = new Date();
    const inicio = new Date(ahora.getTime() - 8 * 60 * 60 * 1000);

    const snapshot = await db.collection('ingresos')
        .where('fechaHoraInicio', '>=', firebase.firestore.Timestamp.fromDate(inicio))
        .orderBy('fechaHoraInicio', 'desc')
        .get();

    const data = snapshot.docs.map(d => d.data());
    renderTablaIngresos(data);
}

async function cargarIngresosPorFecha(fecha) {
    const inicio = new Date(fecha + 'T00:00:00');
    const fin = new Date(fecha + 'T23:59:59');

    const snapshot = await db.collection('ingresos')
        .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
        .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
        .orderBy('fecha', 'desc')
        .get();

    const data = snapshot.docs.map(d => d.data());
    renderTablaIngresos(data);
}

// Función local para filtrar por rango
async function cargarIngresosDesdeHasta(fechaInicio, horaInicio, fechaFin, horaFin) {
    try {
        const inicio = new Date(fechaInicio + 'T' + horaInicio + ':00');
        const fin = new Date(fechaFin + 'T' + horaFin + ':00');

        if (inicio > fin) {
            alert('⚠️ La fecha/hora de inicio debe ser menor o igual a la fecha/hora de fin');
            return;
        }

        const snapshot = await db.collection('ingresos')
            .where('fechaHoraInicio', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fechaHoraInicio', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fechaHoraInicio', 'desc')
            .get();

        const data = snapshot.docs.map(d => d.data());
        renderTablaIngresos(data);

        if (data.length === 0) {
            mostrarNotificacion('ℹ️ No se encontraron registros', 'info');
        }
    } catch (error) {
        console.error('❌ Error al filtrar:', error);
        mostrarNotificacion('❌ Error al filtrar ingresos', 'error');
    }
}

function renderTablaIngresos(data) {
    const tbody = document.getElementById('tablaIngresos');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" class="text-muted">No hay registros</td></tr>';
        return;
    }

    data.forEach((d, index) => {
        const pesoJaba = d.pesoJaba || 0;
        const { totalJ, cPollos, neto, prom } = calcular(d.cantidadJabas, d.pollosPorJaba, d.pesoBruto, pesoJaba);

        const row = document.createElement('tr');
        row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;
        row.innerHTML = `
      <td>${d.id}</td>
      <td>${formatearFecha(d.fecha)}</td>
      <td>${d.producto}</td>
      <td>${d.cantidadJabas}</td>
      <td>${pesoJaba.toFixed(2)} KG</td>
      <td>${totalJ.toFixed(2)} KG</td>
      <td>${d.pollosPorJaba}</td>
      <td>${cPollos}</td>
      <td>${d.pesoBruto.toFixed(2)} KG</td>
      <td>${neto.toFixed(2)} KG</td>
      <td>${prom.toFixed(3)} KG</td>
      <td><button class="btn btn-warning btn-sm btn-editar" data-id="${d.id}" data-tipo="ingreso">✏️</button></td>
      <td><button class="btn btn-danger btn-sm btn-eliminar" data-id="${d.id}" data-tipo="ingreso">🗑️</button></td>
    `;
        tbody.appendChild(row);
    });

    agregarEventosIngresos();
}

function agregarEventosIngresos() {
    document.querySelectorAll('.btn-editar[data-tipo="ingreso"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            abrirModalEditarIngreso(id);
        });
    });

    document.querySelectorAll('.btn-eliminar[data-tipo="ingreso"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            confirmarEliminarIngreso(id);
        });
    });
}

async function confirmarEliminarIngreso(id) {
    const snap = await db.collection('ingresos').where('id', '==', id).get();
    if (snap.empty) return;
    const data = snap.docs[0].data();
    const { cPollos, neto } = calcular(data.cantidadJabas, data.pollosPorJaba, data.pesoBruto, data.pesoJaba || 0);

    mostrarModalConfirmacion({
        titulo: '¿Eliminar ingreso?',
        contenido: `
            <div class="alert alert-warning">
                <h6>Datos del ingreso a eliminar:</h6>
                <hr>
                <p><strong>ID:</strong> ${data.id}</p>
                <p><strong>Jabas:</strong> ${data.cantidadJabas}</p>
                <p><strong>Total pollos:</strong> <span class="badge bg-primary">${cPollos}</span></p>
                <p><strong>Peso neto:</strong> ${neto.toFixed(2)} kg</p>
            </div>
            <div class="alert alert-danger">
                <strong>⚠️ Importante:</strong> Esta acción restará del inventario los pollos ingresados.
            </div>
        `,
        textoConfirmar: 'Eliminar',
        alConfirmar: async () => {
            try {
                // Restar del stock (porque estamos eliminando un ingreso)
                console.log(`➖ Restando del stock: ${cPollos} pollos, ${neto} kg`);
                await restarStock(cPollos, neto);

                // Eliminar de Firestore
                await archivarYEliminarIngreso(snap.docs[0].id, data);

                mostrarNotificacion('✅ Ingreso eliminado y stock actualizado', 'success');

                // Recargar tabla y actualizar inventario
                setTimeout(() => {
                    cargarIngresosRecientes();
                    if (document.getElementById('inventario').classList.contains('active')) {
                        cargarInventarioGeneral();
                    }
                }, 300);

            } catch (error) {
                console.error('❌ Error al eliminar:', error);
                mostrarNotificacion('Error al eliminar ingreso', 'error');
            }
        }
    });
}

// Solo necesitas hacer global la función que se llama desde el HTML
window.cargarIngresosRecientes = cargarIngresosRecientes;