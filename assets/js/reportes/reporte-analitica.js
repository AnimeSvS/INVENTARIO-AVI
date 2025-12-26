// assets/js/reportes/reporte-analitica-completo.js - ANALÍTICA TOTAL CON DETALLE

// ✅ Horario Perú
function obtenerFechaPeru() {
    const ahoraUTC = new Date();
    const offsetPeru = -5 * 60;
    return new Date(ahoraUTC.getTime() + (ahoraUTC.getTimezoneOffset() + offsetPeru) * 60000);
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('analitica');
    if (!container) return;

    container.innerHTML = `
    <div class="card p-4 mb-4">
      <h4 class="text-primary mb-3">📊 ANÁLISIS COMPLETO DETALLADO</h4>
      <form id="formAnalitica" class="row g-3 needs-validation" novalidate>
        <div class="col-md-4">
          <label class="form-label">Fecha Inicio</label>
          <input type="date" id="fechaInicioAnalitica" class="form-control" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Fecha Fin</label>
          <input type="date" id="fechaFinAnalitica" class="form-control" required>
        </div>
        <div class="col-md-4 d-flex align-items-end">
          <button type="submit" class="btn btn-primary w-100">Generar Análisis</button>
        </div>
      </form>
    </div>

    <!-- INGRESOS DETALLADOS -->
    <div class="card p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-secondary mb-0">📥 INGRESOS DETALLADOS</h5>
        <button class="btn btn-success btn-sm" onclick="exportarTablaExcel('tablaAnaliticaIngresos', 'Ingresos_Detallados')">📊 Exportar</button>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th><th>Fecha</th><th>Producto</th><th>Jabas</th><th>Kg/Jaba</th><th>Total Jabas</th>
              <th>Pollos/Jaba</th><th>Total Pollos</th><th>Peso Bruto</th><th>Peso Neto</th><th>Promedio</th>
            </tr>
          </thead>
          <tbody id="tablaAnaliticaIngresos"></tbody>
        </table>
      </div>
    </div>

    <!-- SALIDAS DETALLADAS -->
    <div class="card p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-secondary mb-0">📤 SALIDAS DETALLADAS</h5>
        <button class="btn btn-success btn-sm" onclick="exportarTablaExcel('tablaAnaliticaSalidas', 'Salidas_Detalladas')">📊 Exportar</button>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th><th>Fecha</th><th>Producto</th><th>Tinas</th><th>Kg/Tina</th><th>Total Tinas</th>
              <th>Pollos/Tina</th><th>Total Pollos</th><th>Peso Bruto</th><th>Peso Neto</th><th>Promedio</th><th>Tienda</th>
            </tr>
          </thead>
          <tbody id="tablaAnaliticaSalidas"></tbody>
        </table>
      </div>
    </div>

    <!-- DEVOLUCIONES DETALLADAS -->
    <div class="card p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-secondary mb-0">🔄 DEVOLUCIONES DETALLADAS</h5>
        <button class="btn btn-success btn-sm" onclick="exportarTablaExcel('tablaAnaliticaDevoluciones', 'Devoluciones_Detalladas')">📊 Exportar</button>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>ID</th><th>Fecha</th><th>Producto</th><th>Jabas</th><th>Kg/Jaba</th><th>Total Jabas</th>
              <th>Pollos/Jaba</th><th>Total Pollos</th><th>Peso Bruto</th><th>Peso Neto</th><th>Promedio</th><th>Motivo</th>
            </tr>
          </thead>
          <tbody id="tablaAnaliticaDevoluciones"></tbody>
        </table>
      </div>
    </div>

    <!-- TIENDAS DETALLADAS -->
    <div class="card p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-secondary mb-0">🏪 TIENDAS DETALLADAS</h5>
        <button class="btn btn-success btn-sm" onclick="exportarTablaExcel('tablaAnaliticaTiendas', 'Tiendas_Detalladas')">📊 Exportar</button>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>Tienda</th><th>Pollos Enviados</th><th>Peso Total (KG)</th><th>Envíos</th><th>Último Envío</th>
            </tr>
          </thead>
          <tbody id="tablaAnaliticaTiendas"></tbody>
        </table>
      </div>
    </div>

    <!-- ELIMINADOS DETALLADOS -->
    <div class="card p-4 mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-secondary mb-0">🗑️ ELIMINADOS DETALLADOS</h5>
        <button class="btn btn-success btn-sm" onclick="exportarTablaExcel('tablaAnaliticaEliminados', 'Eliminados_Detallados')">📊 Exportar</button>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-bordered text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>Tipo</th><th>ID</th><th>Fecha Eliminación</th><th>Producto</th><th>Jabas/Tinas</th><th>Kg/Unidad</th>
              <th>Total Pollos</th><th>Peso Bruto</th><th>Peso Neto</th><th>Promedio</th>
            </tr>
          </thead>
          <tbody id="tablaAnaliticaEliminados"></tbody>
        </table>
      </div>
    </div>
    `;

    // Fechas por defecto (últimos 7 días)
    const hoy = obtenerFechaPeru();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    document.getElementById('fechaInicioAnalitica').value = hace7Dias.toISOString().split('T')[0];
    document.getElementById('fechaFinAnalitica').value = hoy.toISOString().split('T')[0];

    // Evento
    document.getElementById('formAnalitica').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            e.target.classList.add('was-validated');
            return;
        }
        generarAnaliticaCompleta();
    });

    // Cargar al inicio
    generarAnaliticaCompleta();
});

// ✅ Generar todo el análisis detallado
async function generarAnaliticaCompleta() {
    const fechaInicio = document.getElementById('fechaInicioAnalitica').value;
    const fechaFin = document.getElementById('fechaFinAnalitica').value;

    if (!fechaInicio || !fechaFin) {
        mostrarNotificacion('❌ Seleccione ambas fechas', 'warning');
        return;
    }

    try {
        const inicio = new Date(fechaInicio + 'T00:00:00');
        const fin = new Date(fechaFin + 'T23:59:59');

        // 1. INGRESOS DETALLADOS
        const ingresosSnap = await db.collection('ingresos')
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fecha', 'desc')
            .get();

        const ingresosData = ingresosSnap.docs.map(d => d.data());
        renderTablaDetallada('tablaAnaliticaIngresos', ingresosData, 'ingreso');

        // 2. SALIDAS DETALLADAS
        const salidasSnap = await db.collection('salidas')
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fecha', 'desc')
            .get();

        const salidasData = salidasSnap.docs.map(d => d.data());
        renderTablaDetallada('tablaAnaliticaSalidas', salidasData, 'salida');

        // 3. DEVOLUCIONES DETALLADAS
        const devolucionesSnap = await db.collection('devoluciones')
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fecha', 'desc')
            .get();

        const devolucionesData = devolucionesSnap.docs.map(d => d.data());
        renderTablaDetallada('tablaAnaliticaDevoluciones', devolucionesData, 'devolucion');

        // 4. TIENDAS DETALLADAS
        const tiendasData = [];
        const tiendasMap = {};
        salidasData.forEach(s => {
            const tienda = s.tienda || 'Sin destino';
            if (!tiendasMap[tienda]) {
                tiendasMap[tienda] = { pollos: 0, peso: 0, envios: 0, ultimo: null };
            }
            tiendasMap[tienda].pollos += s.totalPollos || 0;
            tiendasMap[tienda].peso += s.pesoNeto || 0;
            tiendasMap[tienda].envios += 1;
            const fecha = s.fecha?.toDate();
            if (!tiendasMap[tienda].ultimo || fecha > tiendasMap[tienda].ultimo) {
                tiendasMap[tienda].ultimo = fecha;
            }
        });
        Object.entries(tiendasMap).forEach(([nombre, d]) => {
            tiendasData.push({
                tienda: nombre,
                pollos: d.pollos,
                peso: d.peso,
                envios: d.envios,
                ultimo: d.ultimo
            });
        });
        renderTablaDetallada('tablaAnaliticaTiendas', tiendasData, 'tienda');

        // 5. ELIMINADOS DETALLADOS
        const ingresosElimSnap = await db.collection('ingresos_eliminados')
            .where('fechaEliminacion', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fechaEliminacion', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fechaEliminacion', 'desc')
            .get();

        const salidasElimSnap = await db.collection('salidas_eliminadas')
            .where('fechaEliminacion', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fechaEliminacion', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fechaEliminacion', 'desc')
            .get();

        const eliminadosData = [
            ...ingresosElimSnap.docs.map(d => ({ tipo: 'Ingreso', ...d.data() })),
            ...salidasElimSnap.docs.map(d => ({ tipo: 'Salida', ...d.data() }))
        ];
        renderTablaDetallada('tablaAnaliticaEliminados', eliminadosData, 'eliminado');

        mostrarNotificacion('✅ Análisis completo generado', 'success');

    } catch (error) {
        console.error('❌ Error al generar análisis:', error);
        mostrarNotificacion('Error al generar análisis', 'error');
    }
}

// ✅ Renderizar tabla detallada genérica
function renderTablaDetallada(idTbody, data, tipo) {
    const tbody = document.getElementById(idTbody);
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="text-muted">No hay registros en este rango</td></tr>';
        return;
    }

    data.forEach((d, index) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;

        if (tipo === 'ingreso') {
            const { totalJ, cPollos, neto, prom } = calcular(d.cantidadJabas, d.pollosPorJaba, d.pesoBruto, d.pesoJaba || 0);
            row.innerHTML = `
                <td>${d.id}</td>
                <td>${formatearFecha(d.fecha)}</td>
                <td>${d.producto}</td>
                <td>${d.cantidadJabas}</td>
                <td>${(d.pesoJaba || 0).toFixed(2)} KG</td>
                <td>${totalJ.toFixed(2)} KG</td>
                <td>${d.pollosPorJaba}</td>
                <td>${cPollos}</td>
                <td>${d.pesoBruto.toFixed(2)} KG</td>
                <td>${neto.toFixed(2)} KG</td>
                <td>${prom.toFixed(3)} KG</td>
            `;
        } else if (tipo === 'salida') {
            const totalTinasKg = (d.tinas || 0) * (d.kgPorTina || 0);
            const promedio = (d.totalPollos || 0) > 0 ? (d.pesoNeto / d.totalPollos) : 0;
            row.innerHTML = `
                <td>${d.id}</td>
                <td>${formatearFecha(d.fecha)}</td>
                <td>${d.producto}</td>
                <td>${d.tinas}</td>
                <td>${(d.kgPorTina || 0).toFixed(2)} KG</td>
                <td>${totalTinasKg.toFixed(2)} KG</td>
                <td>${d.pollosPorTina}</td>
                <td>${d.totalPollos}</td>
                <td>${d.pesoBruto.toFixed(2)} KG</td>
                <td>${d.pesoNeto.toFixed(2)} KG</td>
                <td>${promedio.toFixed(3)} KG</td>
                <td>${d.tienda || 'Sin destino'}</td>
            `;
        } else if (tipo === 'devolucion') {
            const cantidad = d.cantidadJabas || 0;
            const pesoUnit = d.pesoJaba || 0;
            const pollosUnit = d.pollosPorJaba || 0;
            const totalPollos = cantidad * pollosUnit;
            const pesoNeto = d.pesoBruto - (cantidad * pesoUnit);
            const promedio = totalPollos > 0 ? (pesoNeto / totalPollos) : 0;
            row.innerHTML = `
                <td>${d.id}</td>
                <td>${formatearFecha(d.fecha)}</td>
                <td>${d.producto}</td>
                <td>${cantidad}</td>
                <td>${pesoUnit.toFixed(2)} KG</td>
                <td>${(cantidad * pesoUnit).toFixed(2)} KG</td>
                <td>${pollosUnit}</td>
                <td>${totalPollos}</td>
                <td>${d.pesoBruto.toFixed(2)} KG</td>
                <td>${pesoNeto.toFixed(2)} KG</td>
                <td>${promedio.toFixed(3)} KG</td>
                <td><span class="badge bg-warning">${d.motivo || 'Sin motivo'}</span></td>
            `;
        } else if (tipo === 'tienda') {
            const hora = d.ultimo ? d.ultimo.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '--:--';
            row.innerHTML = `
                <td><strong>🏪 ${d.tienda}</strong></td>
                <td><span class="badge bg-primary">${d.pollos}</span></td>
                <td>${d.peso.toFixed(2)} KG</td>
                <td><span class="badge bg-info">${d.envios}</span></td>
                <td>${hora}</td>
            `;
        } else if (tipo === 'eliminado') {
            const cantidad = d.cantidadJabas || d.tinas || 0;
            const pesoUnit = d.pesoJaba || d.kgPorTina || 0;
            const pollosUnit = d.pollosPorJaba || d.pollosPorTina || 0;
            const totalPollos = cantidad * pollosUnit;
            const pesoNeto = (d.pesoBruto || 0) - (cantidad * pesoUnit);
            const promedio = totalPollos > 0 ? (pesoNeto / totalPollos) : 0;
            row.innerHTML = `
                <td><span class="badge bg-danger">${d.tipo}</span></td>
                <td>${d.id}</td>
                <td>${formatearFecha(d.fechaEliminacion)}</td>
                <td>${d.producto}</td>
                <td>${cantidad}</td>
                <td>${pesoUnit.toFixed(2)} KG</td>
                <td>${totalPollos}</td>
                <td>${(d.pesoBruto || 0).toFixed(2)} KG</td>
                <td>${pesoNeto.toFixed(2)} KG</td>
                <td>${promedio.toFixed(3)} KG</td>
            `;
        }

        tbody.appendChild(row);
    });
}

// ✅ Exportar cualquier tabla a Excel
function exportarTablaExcel(idTbody, nombreArchivo) {
    const tabla = document.getElementById(idTbody).closest('table');
    if (!tabla || tabla.rows.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(tabla);

    XLSX.utils.book_append_sheet(wb, ws, nombreArchivo);
    const fecha = obtenerFechaPeru().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${nombreArchivo}_${fecha}.xlsx`);
}