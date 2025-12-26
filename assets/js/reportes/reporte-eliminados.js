// assets/js/reportes/reporte-eliminados.js - CÓDIGO FINAL FUNCIONAL

// ✅ Horario Perú
function obtenerFechaPeru() {
    const ahoraUTC = new Date();
    const offsetPeru = -5 * 60;
    return new Date(ahoraUTC.getTime() + (ahoraUTC.getTimezoneOffset() + offsetPeru) * 60000);
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('eliminados');
    if (!container) return;

    container.innerHTML = `
    <div class="card p-4">
      <h4 class="text-danger mb-3">🗑️ Registros Eliminados</h4>
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <label class="form-label">Filtrar por</label>
          <select id="filtroTipoEliminados" class="form-select">
            <option value="ingresos">Ingresos Eliminados</option>
            <option value="salidas">Salidas Eliminadas</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Fecha de Eliminación</label>
          <input type="date" id="filtroFechaEliminados" class="form-control" />
        </div>
        <div class="col-md-4 d-flex align-items-end">
          <button class="btn btn-primary w-100" id="btnBuscarEliminados">Buscar</button>
        </div>
        <button class="btn btn-outline-secondary btn-sm" id="btnHoyEliminados">Hoy</button>
      </div>
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-success btn-sm" id="btnExportarEliminados">
          <span>📊 Exportar Excel</span>
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered text-center align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha Eliminación</th>
              <th>Producto</th>
              <th>Jabas/Tinas</th>
              <th>Kg/Jaba</th>
              <th>Total Jabas</th>
              <th>Pollos/Jaba</th>
              <th>Total Pollos</th>
              <th>Bruto</th>
              <th>Neto</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody id="tablaEliminados"></tbody>
        </table>
      </div>
    </div>
    `;

    // Poner fecha de Perú por defecto
    const hoyPeru = obtenerFechaPeru();
    const inputFecha = document.getElementById('filtroFechaEliminados');
    inputFecha.value = hoyPeru.toISOString().split('T')[0];
    inputFecha.max = hoyPeru.toISOString().split('T')[0]; // no permitir futuro

    // Eventos
    document.getElementById('btnBuscarEliminados').addEventListener('click', () => {
        const tipo = document.getElementById('filtroTipoEliminados').value;
        let fecha = document.getElementById('filtroFechaEliminados').value;

        // Si el input está vacío, usar hoy Perú
        if (!fecha) {
            fecha = obtenerFechaPeru().toISOString().split('T')[0];
            document.getElementById('filtroFechaEliminados').value = fecha;
        }

        // Validación final
        if (isNaN(new Date(fecha))) {
            mostrarNotificacion('❌ Fecha inválida', 'error');
            return;
        }

        cargarEliminados(tipo, fecha);
    });

async function cargarEliminados(tipo, fecha) {
    try {
        if (!fecha || isNaN(new Date(fecha))) {
            mostrarNotificacion('❌ Fecha inválida', 'error');
            return;
        }

        const inicio = new Date(fecha + 'T00:00:00');
        const fin = new Date(fecha + 'T23:59:59');

        if (isNaN(inicio) || isNaN(fin)) {
            mostrarNotificacion('❌ Fecha mal formada', 'error');
            return;
        }

        const coleccion = tipo === 'ingresos' ? 'ingresos_eliminados' : 'salidas_eliminadas';

        const snapshot = await db.collection(coleccion)
            .where('fechaEliminacion', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fechaEliminacion', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fechaEliminacion', 'desc')
            .get();

        const data = snapshot.docs.map(d => d.data());
        renderTablaEliminados(data, tipo);

    } catch (error) {
        console.error('❌ Error al cargar eliminados:', error);
        mostrarNotificacion('Error al cargar eliminados', 'error');
    }
}
function renderTablaEliminados(data, tipo) {
    const tbody = document.getElementById('tablaEliminados');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-muted">No hay registros eliminados</td></tr>';
        return;
    }

    data.forEach((d, index) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;

        const cantidad = d.cantidadJabas || d.tinas || 0;
        const pesoUnit = d.pesoJaba || d.kgPorTina || 0;
        const pollosUnit = d.pollosPorJaba || d.pollosPorTina || 0;
        const totalPollos = cantidad * pollosUnit;
        const pesoTotal = cantidad * pesoUnit;
        const pesoNeto = d.pesoNeto || (d.pesoBruto - pesoTotal);
        const promedio = totalPollos > 0 ? (pesoNeto / totalPollos) : 0;

        row.innerHTML = `
            <td>${d.id}</td>
            <td>${formatearFecha(d.fechaEliminacion)}</td>
            <td>${d.producto}</td>
            <td>${cantidad}</td>
            <td>${pesoUnit.toFixed(2)} KG</td>
            <td>${pesoTotal.toFixed(2)} KG</td>
            <td>${pollosUnit}</td>
            <td>${totalPollos}</td>
            <td>${(d.pesoBruto || 0).toFixed(2)} KG</td>
            <td>${pesoNeto.toFixed(2)} KG</td>
            <td>${promedio.toFixed(3)} KG</td>
        `;
        tbody.appendChild(row);
    });
}

function exportarEliminadosExcel() {
    const tabla = document.getElementById('tablaEliminados');
    if (!tabla || tabla.rows.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(tabla.closest('table'));

    const tipo = document.getElementById('filtroTipoEliminados').value;
    const fecha = document.getElementById('filtroFechaEliminados').value;

    XLSX.utils.book_append_sheet(wb, ws, 'Eliminados');
    XLSX.writeFile(wb, `eliminados_${tipo}_${fecha}.xlsx`);
}});

// Hacer global la función para que main.js la encuentre
window.cargarEliminados = cargarEliminados;