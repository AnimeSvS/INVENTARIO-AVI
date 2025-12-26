// assets/js/reportes/reporte-tiendas.js - CÓDIGO FINAL CON AUTO-ACTUALIZACIÓN Y HORA PERÚ

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('reporteTiendas');
    if (!container) return;

    container.innerHTML = `
    <div class="card p-4">
      <h4 class="text-success mb-3">🏪 Reporte de Tiendas - Día Actual</h4>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted">Actualizado cada 30 segundos</span>
        <button class="btn btn-success btn-sm" onclick="exportarReporteTiendasExcel()">
          📊 Exportar Excel
        </button>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered table-sm text-center">
          <thead class="table-success">
            <tr>
              <th>Tienda</th>
              <th>Pollos Enviados</th>
              <th>Peso Total (KG)</th>
              <th>Envíos</th>
              <th>Último Envío</th>
            </tr>
          </thead>
          <tbody id="tablaReporteTiendas">
            <tr><td colspan="5" class="text-muted">Cargando...</td></tr>
          </tbody>
          <tfoot class="table-light">
            <tr>
              <td><strong>📊 TOTAL</strong></td>
              <td><strong id="totalPollos">0</strong></td>
              <td><strong id="totalPeso">0 KG</strong></td>
              <td><strong id="totalEnvios">0</strong></td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    `;

    cargarDatosTiendas(); // Primera carga
    setInterval(cargarDatosTiendas, 30000); // ← ACTUALIZACIÓN AUTOMÁTICA CADA 30 SEGUNDOS
});

// ✅ Fecha/hora de Perú (GMT-5)
function obtenerFechaPeru() {
    const ahoraUTC = new Date();
    const offsetPeru = -5 * 60; // GMT-5 en minutos
    return new Date(ahoraUTC.getTime() + (ahoraUTC.getTimezoneOffset() + offsetPeru) * 60000);
}

async function cargarDatosTiendas() {
    try {
        const hoyPeru = obtenerFechaPeru();
        const inicio = new Date(hoyPeru.getFullYear(), hoyPeru.getMonth(), hoyPeru.getDate(), 0, 0, 0);
        const fin = new Date(hoyPeru.getFullYear(), hoyPeru.getMonth(), hoyPeru.getDate(), 23, 59, 59);

        console.log(`📅 Buscando salidas del ${inicio.toLocaleDateString('es-PE')} (Perú)`);

        const snapshot = await db.collection('salidas')
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .orderBy('fecha', 'desc')
            .get();

        const salidas = snapshot.docs.map(doc => doc.data());

        console.log(`✅ Encontradas ${salidas.length} salidas hoy (Perú)`);

        const tiendas = {};
        salidas.forEach(s => {
            const tienda = s.tienda || 'Sin destino';
            if (!tiendas[tienda]) {
                tiendas[tienda] = { pollos: 0, peso: 0, envios: 0, ultimo: null };
            }
            tiendas[tienda].pollos += s.totalPollos || 0;
            tiendas[tienda].peso += s.pesoNeto || 0;
            tiendas[tienda].envios += 1;

            const fecha = s.fecha?.toDate();
            if (!tiendas[tienda].ultimo || fecha > tiendas[tienda].ultimo) {
                tiendas[tienda].ultimo = fecha;
            }
        });

        renderizarTabla(tiendas);

    } catch (error) {
        console.error('❌ Error al cargar datos de tiendas:', error);
        document.getElementById('tablaReporteTiendas').innerHTML = '<tr><td colspan="5" class="text-danger">Error al cargar datos</td></tr>';
    }
}

function renderizarTabla(tiendas) {
    const tbody = document.getElementById('tablaReporteTiendas');
    const totalPollosEl = document.getElementById('totalPollos');
    const totalPesoEl = document.getElementById('totalPeso');
    const totalEnviosEl = document.getElementById('totalEnvios');

    tbody.innerHTML = '';

    let totalPollos = 0;
    let totalPeso = 0;
    let totalEnvios = 0;

    const lista = Object.entries(tiendas).sort((a, b) => b[1].pollos - a[1].pollos);

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No hay envíos hoy</td></tr>';
        totalPollosEl.textContent = '0';
        totalPesoEl.textContent = '0 KG';
        totalEnviosEl.textContent = '0';
        return;
    }

    lista.forEach(([tienda, datos]) => {
        totalPollos += datos.pollos;
        totalPeso += datos.peso;
        totalEnvios += datos.envios;

        const hora = datos.ultimo ? datos.ultimo.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '--:--';

        tbody.innerHTML += `
            <tr>
                <td><strong>🏪 ${tienda}</strong></td>
                <td><span class="badge bg-primary">${datos.pollos}</span></td>
                <td>${datos.peso.toFixed(2)} KG</td>
                <td><span class="badge bg-info">${datos.envios}</span></td>
                <td>${hora}</td>
            </tr>
        `;
    });

    totalPollosEl.textContent = totalPollos.toLocaleString('es-PE');
    totalPesoEl.textContent = totalPeso.toFixed(2) + ' KG';
    totalEnviosEl.textContent = totalEnvios;
}

function exportarReporteTiendasExcel() {
    const tabla = document.getElementById('tablaReporteTiendas');
    if (!tabla || tabla.rows.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(document.querySelector('#reporteTiendas table'));

    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Tiendas');
    const fecha = obtenerFechaPeru().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `reporte_tiendas_${fecha}.xlsx`);
}