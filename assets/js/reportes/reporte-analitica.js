// assets/js/reportes/reporte-analitica-completo.js - ANALÍTICA TOTAL CON DETALLE Y SUMATORIOS

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
  
  <!-- FILTRO 1: SOLO PARA INGRESOS -->
  <h5 class="text-info mb-3">🔍 FILTRAR INGRESOS</h5>
  <form id="formAnaliticaIngresos" class="row g-3 needs-validation" novalidate>
    <div class="col-md-3">
      <label class="form-label">Fecha Inicio</label>
      <input type="date" id="fechaInicioIngresos" class="form-control" required>
    </div>
    <div class="col-md-2">
      <label class="form-label">Hora Inicio</label>
      <input type="time" id="horaInicioIngresos" class="form-control" required>
    </div>
    <div class="col-md-3">
      <label class="form-label">Fecha Fin</label>
      <input type="date" id="fechaFinIngresos" class="form-control" required>
    </div>
    <div class="col-md-2">
      <label class="form-label">Hora Fin</label>
      <input type="time" id="horaFinIngresos" class="form-control" required>
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button type="submit" class="btn btn-info w-100">Filtrar Ingresos</button>
    </div>
  </form>
</div>

<!-- INGRESOS DETALLADOS CON TOTALES -->
<div class="card p-4 mb-4 d-none" id="cardIngresosAnalitica">
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
      <tfoot class="table-warning">
        <tr>
          <td colspan="3"><strong>📊 TOTALES INGRESOS</strong></td>
          <td><strong id="totalJabasIngresos">0</strong></td>
          <td>-</td>
          <td><strong id="totalKgJabasIngresos">0.00</strong></td>
          <td>-</td>
          <td><strong id="totalPollosIngresos">0</strong></td>
          <td><strong id="totalPesoBrutoIngresos">0.00</strong></td>
          <td><strong id="totalPesoNetoIngresos">0.00</strong></td>
          <td><strong id="promedioGeneralIngresos">0.000</strong></td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>

<!-- FILTRO 2: PARA SALIDAS, DEVOLUCIONES, TIENDAS, ELIMINADOS -->
<div class="card p-4 mb-4 " id="cardFiltroResto">
  <h5 class="text-info mb-3">🔍 FILTRAR SALIDAS, DEVOLUCIONES Y MÁS</h5>
  <form id="formAnaliticaResto" class="row g-3 needs-validation" novalidate>
    <div class="col-md-3">
      <label class="form-label">Fecha Inicio</label>
      <input type="date" id="fechaInicioResto" class="form-control" required>
    </div>
    <div class="col-md-2">
      <label class="form-label">Hora Inicio</label>
      <input type="time" id="horaInicioResto" class="form-control" required>
    </div>
    <div class="col-md-3">
      <label class="form-label">Fecha Fin</label>
      <input type="date" id="fechaFinResto" class="form-control" required>
    </div>
    <div class="col-md-2">
      <label class="form-label">Hora Fin</label>
      <input type="time" id="horaFinResto" class="form-control" required>
    </div>
    <div class="col-md-2 d-flex align-items-end">
      <button type="submit" class="btn btn-primary w-100">Filtrar Resto</button>
    </div>
  </form>
</div>

<!-- RESTO DE TABLAS CON D-none -->
<div class="card p-4 mb-4 d-none" id="cardSalidasAnalitica">
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
      <tfoot class="table-danger">
        <tr>
          <td colspan="3"><strong>📊 TOTALES SALIDAS</strong></td>
          <td><strong id="totalTinasSalidas">0</strong></td>
          <td>-</td>
          <td><strong id="totalKgTinasSalidas">0.00</strong></td>
          <td>-</td>
          <td><strong id="totalPollosSalidas">0</strong></td>
          <td><strong id="totalPesoBrutoSalidas">0.00</strong></td>
          <td><strong id="totalPesoNetoSalidas">0.00</strong></td>
          <td><strong id="promedioGeneralSalidas">0.000</strong></td>
          <td>-</td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>

<div class="card p-4 mb-4 d-none" id="cardDevolucionesAnalitica">
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
      <tfoot class="table-warning">
        <tr>
          <td colspan="3"><strong>📊 TOTALES DEVOLUCIONES</strong></td>
          <td><strong id="totalJabasDevoluciones">0</strong></td>
          <td>-</td>
          <td><strong id="totalKgJabasDevoluciones">0.00</strong></td>
          <td>-</td>
          <td><strong id="totalPollosDevoluciones">0</strong></td>
          <td><strong id="totalPesoBrutoDevoluciones">0.00</strong></td>
          <td><strong id="totalPesoNetoDevoluciones">0.00</strong></td>
          <td><strong id="promedioGeneralDevoluciones">0.000</strong></td>
          <td>-</td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>

<div class="card p-4 mb-4 d-none" id="cardTiendasAnalitica">
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
      <tfoot class="table-info">
        <tr>
          <td><strong>📊 TOTAL GENERAL TIENDAS</strong></td>
          <td><strong id="totalPollosTiendas">0</strong></td>
          <td><strong id="totalPesoTiendas">0.00</strong></td>
          <td><strong id="totalEnviosTiendas">0</strong></td>
          <td>-</td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>

<div class="card p-4 mb-4 d-none" id="cardEliminadosAnalitica">
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
      <tfoot class="table-secondary">
        <tr>
          <td colspan="5"><strong>📊 TOTALES ELIMINADOS</strong></td>
          <td>-</td>
          <td><strong id="totalPollosEliminados">0</strong></td>
          <td><strong id="totalPesoBrutoEliminados">0.00</strong></td>
          <td><strong id="totalPesoNetoEliminados">0.00</strong></td>
          <td><strong id="promedioGeneralEliminados">0.000</strong></td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
`;

  // Fechas por defecto (últimos 7 días)
  const hoy = obtenerFechaPeru();
  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  document.getElementById('fechaInicioIngresos').value = hace7Dias.toISOString().split('T')[0];
  document.getElementById('fechaFinIngresos').value = hoy.toISOString().split('T')[0];
  document.getElementById('horaInicioIngresos').value = '00:00';
  document.getElementById('horaFinIngresos').value = '23:59';

  // Valores por defecto para el segundo filtro (opcional)
  document.getElementById('fechaInicioResto').value = hace7Dias.toISOString().split('T')[0];
  document.getElementById('fechaFinResto').value = hoy.toISOString().split('T')[0];
  document.getElementById('horaInicioResto').value = '00:00';
  document.getElementById('horaFinResto').value = '23:59';
  // Evento
  // FILTRO 1: SOLO PARA INGRESOS
  document.getElementById('formAnaliticaIngresos').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.classList.add('was-validated');
      return;
    }

    const fechaInicio = document.getElementById('fechaInicioIngresos').value;
    const horaInicio = document.getElementById('horaInicioIngresos').value;
    const fechaFin = document.getElementById('fechaFinIngresos').value;
    const horaFin = document.getElementById('horaFinIngresos').value;

    if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) {
      mostrarNotificacion('❌ Complete todos los campos de fecha y hora', 'warning');
      return;
    }

    try {
      const inicio = new Date(fechaInicio + 'T' + horaInicio);
      const fin = new Date(fechaFin + 'T' + horaFin);

      if (inicio > fin) {
        mostrarNotificacion('❌ La fecha/hora de inicio debe ser menor o igual a la fecha/hora de fin', 'warning');
        return;
      }

      // ✅ CARGAR SOLO INGRESOS
      const ingresosSnap = await db.collection('ingresos')
        .where('fechaHoraInicio', '>=', firebase.firestore.Timestamp.fromDate(inicio))
        .where('fechaHoraInicio', '<=', firebase.firestore.Timestamp.fromDate(fin))
        .orderBy('fechaHoraInicio', 'desc')
        .get();

      const ingresosData = ingresosSnap.docs.map(d => d.data());

      // Calcular totales
      let totalJabas = 0, totalKgJabas = 0, totalPollos = 0, totalPesoBruto = 0, totalPesoNeto = 0, sumaPromedios = 0, contadorPromedios = 0;

      ingresosData.forEach(d => {
        const pesoJaba = d.pesoJaba || 0;
        const { totalJ, cPollos, neto, prom } = calcular(d.cantidadJabas, d.pollosPorJaba, d.pesoBruto, pesoJaba);
        totalJabas += d.cantidadJabas;
        totalKgJabas += totalJ;
        totalPollos += cPollos;
        totalPesoBruto += d.pesoBruto;
        totalPesoNeto += neto;
        sumaPromedios += prom;
        contadorPromedios++;
      });

      renderTablaDetallada('tablaAnaliticaIngresos', ingresosData, 'ingreso');

      document.getElementById('totalJabasIngresos').textContent = totalJabas.toLocaleString('es-PE');
      document.getElementById('totalKgJabasIngresos').textContent = totalKgJabas.toFixed(2);
      document.getElementById('totalPollosIngresos').textContent = totalPollos.toLocaleString('es-PE');
      document.getElementById('totalPesoBrutoIngresos').textContent = totalPesoBruto.toFixed(2);
      document.getElementById('totalPesoNetoIngresos').textContent = totalPesoNeto.toFixed(2);
      document.getElementById('promedioGeneralIngresos').textContent = contadorPromedios > 0 ? (sumaPromedios / contadorPromedios).toFixed(3) : '0.000';

      // Mostrar tabla de ingresos
      document.getElementById('cardIngresosAnalitica').classList.remove('d-none');

      // Mostrar filtro para el resto
      document.getElementById('cardFiltroResto').classList.remove('d-none');

      mostrarNotificacion('✅ Ingresos cargados correctamente', 'success');

    } catch (error) {
      console.error('❌ Error al cargar ingresos:', error);
      mostrarNotificacion('Error al cargar ingresos', 'error');
    }
  });

  // FILTRO 2: PARA SALIDAS, DEVOLUCIONES, TIENDAS, ELIMINADOS
  document.getElementById('formAnaliticaResto').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.classList.add('was-validated');
      return;
    }

    const fechaInicio = document.getElementById('fechaInicioResto').value;
    const horaInicio = document.getElementById('horaInicioResto').value;
    const fechaFin = document.getElementById('fechaFinResto').value;
    const horaFin = document.getElementById('horaFinResto').value;

    if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) {
      mostrarNotificacion('❌ Complete todos los campos de fecha y hora', 'warning');
      return;
    }

    try {
      const inicio = new Date(fechaInicio + 'T' + horaInicio);
      const fin = new Date(fechaFin + 'T' + horaFin);

      if (inicio > fin) {
        mostrarNotificacion('❌ La fecha/hora de inicio debe ser menor o igual a la fecha/hora de fin', 'warning');
        return;
      }

      // ✅ CARGAR SALIDAS
      const salidasSnap = await db.collection('salidas')
        .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
        .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
        .orderBy('fecha', 'desc')
        .get();

      const salidasData = salidasSnap.docs.map(d => d.data());

      let totalTinas = 0, totalKgTinas = 0, totalPollosSalidas = 0, totalPesoBrutoSalidas = 0, totalPesoNetoSalidas = 0, sumaPromediosSalidas = 0, contadorPromediosSalidas = 0;

      salidasData.forEach(d => {
        const totalTinasKg = (d.tinas || 0) * (d.kgPorTina || 0);
        const promedio = (d.totalPollos || 0) > 0 ? (d.pesoNeto / d.totalPollos) : 0;
        totalTinas += d.tinas || 0;
        totalKgTinas += totalTinasKg;
        totalPollosSalidas += d.totalPollos || 0;
        totalPesoBrutoSalidas += d.pesoBruto || 0;
        totalPesoNetoSalidas += d.pesoNeto || 0;
        sumaPromediosSalidas += promedio;
        contadorPromediosSalidas++;
      });

      renderTablaDetallada('tablaAnaliticaSalidas', salidasData, 'salida');

      document.getElementById('totalTinasSalidas').textContent = totalTinas.toLocaleString('es-PE');
      document.getElementById('totalKgTinasSalidas').textContent = totalKgTinas.toFixed(2);
      document.getElementById('totalPollosSalidas').textContent = totalPollosSalidas.toLocaleString('es-PE');
      document.getElementById('totalPesoBrutoSalidas').textContent = totalPesoBrutoSalidas.toFixed(2);
      document.getElementById('totalPesoNetoSalidas').textContent = totalPesoNetoSalidas.toFixed(2);
      document.getElementById('promedioGeneralSalidas').textContent = contadorPromediosSalidas > 0 ? (sumaPromediosSalidas / contadorPromediosSalidas).toFixed(3) : '0.000';

      // ✅ CARGAR DEVOLUCIONES
      const devolucionesSnap = await db.collection('devoluciones')
        .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
        .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
        .orderBy('fecha', 'desc')
        .get();

      const devolucionesData = devolucionesSnap.docs.map(d => d.data());

      let totalJabasDevoluciones = 0, totalKgJabasDevoluciones = 0, totalPollosDevoluciones = 0, totalPesoBrutoDevoluciones = 0, totalPesoNetoDevoluciones = 0, sumaPromediosDevoluciones = 0, contadorPromediosDevoluciones = 0;

      devolucionesData.forEach(d => {
        const cantidad = d.cantidadJabas || 0;
        const pesoUnit = d.pesoJaba || 0;
        const pollosUnit = d.pollosPorJaba || 0;
        const totalPollos = cantidad * pollosUnit;
        const pesoNeto = d.pesoBruto - (cantidad * pesoUnit);
        const promedio = totalPollos > 0 ? (pesoNeto / totalPollos) : 0;
        const totalJabasKg = cantidad * pesoUnit;

        totalJabasDevoluciones += cantidad;
        totalKgJabasDevoluciones += totalJabasKg;
        totalPollosDevoluciones += totalPollos;
        totalPesoBrutoDevoluciones += d.pesoBruto || 0;
        totalPesoNetoDevoluciones += pesoNeto;
        sumaPromediosDevoluciones += promedio;
        contadorPromediosDevoluciones++;
      });

      renderTablaDetallada('tablaAnaliticaDevoluciones', devolucionesData, 'devolucion');

      document.getElementById('totalJabasDevoluciones').textContent = totalJabasDevoluciones.toLocaleString('es-PE');
      document.getElementById('totalKgJabasDevoluciones').textContent = totalKgJabasDevoluciones.toFixed(2);
      document.getElementById('totalPollosDevoluciones').textContent = totalPollosDevoluciones.toLocaleString('es-PE');
      document.getElementById('totalPesoBrutoDevoluciones').textContent = totalPesoBrutoDevoluciones.toFixed(2);
      document.getElementById('totalPesoNetoDevoluciones').textContent = totalPesoNetoDevoluciones.toFixed(2);
      document.getElementById('promedioGeneralDevoluciones').textContent = contadorPromediosDevoluciones > 0 ? (sumaPromediosDevoluciones / contadorPromediosDevoluciones).toFixed(3) : '0.000';

      // ✅ CARGAR TIENDAS
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

      const tiendasData = Object.entries(tiendasMap).map(([nombre, d]) => ({
        tienda: nombre,
        pollos: d.pollos,
        peso: d.peso,
        envios: d.envios,
        ultimo: d.ultimo
      }));

      renderTablaDetallada('tablaAnaliticaTiendas', tiendasData, 'tienda');

      let totalPollosTiendas = 0, totalPesoTiendas = 0, totalEnviosTiendas = 0;
      tiendasData.forEach(d => {
        totalPollosTiendas += d.pollos;
        totalPesoTiendas += d.peso;
        totalEnviosTiendas += d.envios;
      });

      document.getElementById('totalPollosTiendas').textContent = totalPollosTiendas.toLocaleString('es-PE');
      document.getElementById('totalPesoTiendas').textContent = totalPesoTiendas.toFixed(2);
      document.getElementById('totalEnviosTiendas').textContent = totalEnviosTiendas.toLocaleString('es-PE');

      // ✅ CARGAR ELIMINADOS
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

      let totalPollosEliminados = 0, totalPesoBrutoEliminados = 0, totalPesoNetoEliminados = 0, sumaPromediosEliminados = 0, contadorPromediosEliminados = 0;

      eliminadosData.forEach(d => {
        const cantidad = d.cantidadJabas || d.tinas || 0;
        const pesoUnit = d.pesoJaba || d.kgPorTina || 0;
        const pollosUnit = d.pollosPorJaba || d.pollosPorTina || 0;
        const totalPollos = cantidad * pollosUnit;
        const pesoNeto = (d.pesoBruto || 0) - (cantidad * pesoUnit);
        const promedio = totalPollos > 0 ? (pesoNeto / totalPollos) : 0;

        totalPollosEliminados += totalPollos;
        totalPesoBrutoEliminados += d.pesoBruto || 0;
        totalPesoNetoEliminados += pesoNeto;
        sumaPromediosEliminados += promedio;
        contadorPromediosEliminados++;
      });

      renderTablaDetallada('tablaAnaliticaEliminados', eliminadosData, 'eliminado');

      document.getElementById('totalPollosEliminados').textContent = totalPollosEliminados.toLocaleString('es-PE');
      document.getElementById('totalPesoBrutoEliminados').textContent = totalPesoBrutoEliminados.toFixed(2);
      document.getElementById('totalPesoNetoEliminados').textContent = totalPesoNetoEliminados.toFixed(2);
      document.getElementById('promedioGeneralEliminados').textContent = contadorPromediosEliminados > 0 ? (sumaPromediosEliminados / contadorPromediosEliminados).toFixed(3) : '0.000';

      // ✅ MOSTRAR TABLAS RESTO
      document.getElementById('cardSalidasAnalitica').classList.remove('d-none');
      document.getElementById('cardDevolucionesAnalitica').classList.remove('d-none');
      document.getElementById('cardTiendasAnalitica').classList.remove('d-none');
      document.getElementById('cardEliminadosAnalitica').classList.remove('d-none');

      mostrarNotificacion('✅ Salidas, devoluciones, tiendas y eliminados cargados', 'success');

    } catch (error) {
      console.error('❌ Error al cargar resto de datos:', error);
      mostrarNotificacion('Error al cargar datos', 'error');
    }
  });

  // Cargar al inicio
  // generarAnaliticaCompleta();
});

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



// Hacer global la función para que main.js la encuentre
window.cargarAnalitica = generarAnaliticaCompleta;
