// assets/js/ingresos/ingresos-form.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('ingresos');
    container.innerHTML = `
    <div class="card p-4 mb-4">
      <h4 class="text-primary mb-3">REGISTRAR INGRESOS 🐔</h4>
      <form id="formIngresos" class="row g-3 needs-validation" novalidate>
        <div class="col-md-3">
          <label class="form-label">Cantidad de Jabas</label>
          <input type="number" id="cantidadJabas" class="form-control" value="6" min="1" required />
        </div>
        <div class="col-md-3">
          <label class="form-label">Pollos x Jaba</label>
          <input type="number" id="pollosPorJaba" class="form-control" value="7" min="1" required />
        </div>
        <div class="col-md-3">
          <label class="form-label">Peso x Jaba (kg)</label>
          <input type="number" id="pesoJaba" class="form-control" step="0.01" min="0.01" required />
        </div>
        <div class="col-md-3">
          <label class="form-label">Peso Bruto (kg)</label>
          <input type="number" id="pesoBruto" class="form-control" step="0.01" min="0.01" required />
        </div>
        <div class="col-12 text-end">
          <button type="submit" class="btn btn-primary">Registrar</button>
        </div>
      </form>
    </div>

    <div class="card p-4">
      <h5 class="text-secondary mb-3">Registros Ingresados</h5>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <div class="input-group" style="max-width:150px;">
          <span class="input-group-text">📅 Inicio</span>
          <input type="date" id="filtroFechaInicio" class="form-control" />
        </div>
        <div class="input-group" style="max-width:130px;">
          <span class="input-group-text">🕒</span>
          <input type="time" id="filtroHoraInicio" class="form-control" />
        </div>
        <div class="input-group" style="max-width:150px;">
          <span class="input-group-text">📅 Fin</span>
          <input type="date" id="filtroFechaFin" class="form-control" />
        </div>
        <div class="input-group" style="max-width:130px;">
          <span class="input-group-text">🕕</span>
          <input type="time" id="filtroHoraFin" class="form-control" />
        </div>
        <button class="btn btn-outline-primary btn-sm" id="btnFiltrarPorRango">🔍 Buscar</button>
        <button class="btn btn-outline-secondary btn-sm" id="btnLimpiarIngresos">🧹 Limpiar</button>
        <button class="btn btn-success btn-sm" id="btnExportarIngresos">📊 Exportar Excel</button>
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
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody id="tablaIngresos"></tbody>
        </table>
      </div>
      <nav aria-label="Paginación de ingresos" class="d-flex justify-content-center">
        <ul class="pagination pagination-sm">
          <li class="page-item"><button class="page-link" id="btnPaginaAnteriorIngresos">⬅️ Anterior</button></li>
          <li class="page-item"><button class="page-link" id="btnPaginaSiguienteIngresos">Siguiente ➡️</button></li>
        </ul>
      </nav>
    </div>
  `;

    // Evento del formulario de ingresos
    document.getElementById('formIngresos').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            e.target.classList.add('was-validated');
            return;
        }

        const cantidadJabas = Number(document.getElementById('cantidadJabas').value);
        const pollosPorJaba = Number(document.getElementById('pollosPorJaba').value);
        const pesoJaba = Number(document.getElementById('pesoJaba').value);
        const pesoBruto = Number(document.getElementById('pesoBruto').value);
        const { cPollos, neto } = calcular(cantidadJabas, pollosPorJaba, pesoBruto, pesoJaba);

        mostrarModalConfirmacion({
            titulo: '¿Registrar ingreso?',
            contenido: `
        <p><strong>Jabas:</strong> ${cantidadJabas}</p>
        <p><strong>Pollos por jaba:</strong> ${pollosPorJaba}</p>
        <p><strong>Total pollos:</strong> ${cPollos}</p>
        <p><strong>Peso neto:</strong> ${neto.toFixed(2)} kg</p>
      `,
            textoConfirmar: 'Registrar',
            alConfirmar: async () => {
                await registrarIngreso();
            }
        });
    });

    // ✅ EVENTO ACTUALIZADO: filtrar por rango personalizado
    document.getElementById('btnFiltrarPorRango').addEventListener('click', () => {
        const fechaInicio = document.getElementById('filtroFechaInicio').value;
        const horaInicio = document.getElementById('filtroHoraInicio').value;
        const fechaFin = document.getElementById('filtroFechaFin').value;
        const horaFin = document.getElementById('filtroHoraFin').value;

        if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) {
            return alert('⚠️ Complete todos los campos de fecha y hora');
        }

        cargarIngresosDesdeHasta(fechaInicio, horaInicio, fechaFin, horaFin);
    });

    // ✅ EVENTO ACTUALIZADO: limpiar filtros
    document.getElementById('btnLimpiarIngresos').addEventListener('click', () => {
        document.getElementById('filtroFechaInicio').value = '';
        document.getElementById('filtroHoraInicio').value = '';
        document.getElementById('filtroFechaFin').value = '';
        document.getElementById('filtroHoraFin').value = '';
        cargarIngresosRecientes();
    });

    document.getElementById('btnExportarIngresos').addEventListener('click', () => {
        exportarIngresosExcel();
    });

    // Cargar datos al inicio (últimas 8 horas)
    cargarIngresosRecientes();
});

// Función para registrar ingreso
async function registrarIngreso() {
    const cantidadJabas = Number(document.getElementById('cantidadJabas').value);
    const pollosPorJaba = Number(document.getElementById('pollosPorJaba').value);
    const pesoJaba = Number(document.getElementById('pesoJaba').value);
    const pesoBruto = Number(document.getElementById('pesoBruto').value);

    const { totalJ, cPollos, neto, prom } = calcular(cantidadJabas, pollosPorJaba, pesoBruto, pesoJaba);

    const id = 'PLIP' + Date.now().toString().slice(-5);

    // Guardar fecha y hora real de ingreso
    const inicioDate = new Date();

    try {
        await db.collection('ingresos').add({
            id,
            fecha: firebase.firestore.Timestamp.fromDate(new Date()),
            producto: 'POLLO VIVO',
            cantidadJabas,
            pollosPorJaba,
            pesoJaba,
            pesoBruto,
            pesoNeto: neto,
            fechaHoraInicio: firebase.firestore.Timestamp.fromDate(inicioDate)
        });

        await sumarStock(cPollos, neto);

        mostrarNotificacion('✅ Ingreso registrado y stock actualizado', 'success');
        document.getElementById('formIngresos').reset();
        setTimeout(() => {
            cargarIngresosRecientes();
        }, 100);
    } catch (e) {
        console.error(e);
        mostrarNotificacion('❌ Error al registrar ingreso', 'error');
    }
}

// Función para exportar a Excel
function exportarIngresosExcel() {
    const tabla = document.getElementById('tablaIngresos');
    if (tabla.rows.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(tabla.closest('table'));

    XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `ingresos_${fecha}.xlsx`);
}