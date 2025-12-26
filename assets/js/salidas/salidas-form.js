// assets/js/salidas/salidas-form.js

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('salidas');
    container.innerHTML = `
    <div class="card p-4 mb-4">
      <h4 class="text-danger mb-3">REGISTRAR SALIDAS 🐔</h4>
      <form id="formSalidas" class="row g-3 needs-validation" novalidate>
       <div class="col-md-3">
  <label class="form-label">Cantidad de Tinas</label>
  <input type="number" id="cantidadTinas" class="form-control" value="4" min="1" required />
</div>
<div class="col-md-3">
  <label class="form-label">Pollos x Tina</label>
  <input type="number" id="pollosPorTina" class="form-control" value="8" min="1" required />
</div>
<div class="col-md-3">
  <label class="form-label">Peso x Tina (kg)</label>
  <input type="number" id="pesoPorTina" class="form-control" value="3" step="0.01" min="0.01" required />
</div>
        <div class="col-md-3">
          <label class="form-label">Peso Bruto (kg)</label>
          <input type="number" id="pesoBrutoSalida" class="form-control" step="0.01" min="0.01" required />
        </div>
        <div class="col-md-6">
          <label class="form-label">Destino / Sede</label>
          <select id="destinoSalida" class="form-select" required>
            <option disabled selected>Seleccione</option>
            <option>MARIANO MELGAR</option>
            <option>PAUCARPATA</option>
            <option>MIRAFLORES</option>
            <option>SOCABAYA</option>
            <option>CAYMA</option>
            <option>ALTO SELVA ALEGRE</option>
            <option>AVELINO (PRINCIPAL)</option>
            <option>COLON</option>
            <option>ANGEL</option>
            <option>FANNY</option>
            <option value="OTRO">OTROS</option>
          </select>
        </div>
        <div class="col-md-6 d-none" id="otroDestinoDiv">
          <label class="form-label">Otro Destino</label>
          <input type="text" id="otroDestino" class="form-control" />
        </div>
        <div class="col-12 text-end">
          <button type="submit" class="btn btn-danger">Registrar Salida</button>
        </div>
      </form>
    </div>

    <div class="card p-4">
      <h5 class="text-secondary mb-3">Salidas Registradas</h5>
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="input-group" style="max-width:250px;">
          <span class="input-group-text">📅</span>
          <input type="date" id="filtroFechaSalidas" class="form-control" />
        </div>
        <div>
          <button class="btn btn-primary" id="btnBuscarSalidas">Buscar</button>
          <button class="btn btn-secondary ms-2" id="btnLimpiarSalidas">🧹 Limpiar</button>
          <button class="btn btn-success ms-2" id="btnExportarSalidas">📊 Exportar Excel</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered text-center align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Producto</th>
              <th>Tinas</th>
              <th>Kg/Tina</th>
              <th>Total Tinas</th>
              <th>Pollos/Tina</th>
              <th>Total Pollos</th>
              <th>Bruto</th>
              <th>Neto</th>
              <th>Promedio</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody id="tablaSalidas"></tbody>
        </table>
      </div>
      <nav aria-label="Paginación de salidas" class="d-flex justify-content-center">
        <ul class="pagination pagination-sm">
          <li class="page-item"><button class="page-link" id="btnPaginaAnteriorSalidas">⬅️ Anterior</button></li>
          <li class="page-item"><button class="page-link" id="btnPaginaSiguienteSalidas">Siguiente ➡️</button></li>
        </ul>
      </nav>
    </div>
  `;

    // Eventos
    document.getElementById('formSalidas').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            e.target.classList.add('was-validated');
            return;
        }

        const cantidadTinas = Number(document.getElementById('cantidadTinas').value);
        const pollosPorTina = Number(document.getElementById('pollosPorTina').value);
        const pesoPorTina = Number(document.getElementById('pesoPorTina').value);
        const pesoBrutoSalida = Number(document.getElementById('pesoBrutoSalida').value);
        const destinoSalida = document.getElementById('destinoSalida').value;
        const otroDestino = document.getElementById('otroDestino').value;
        const destinoFinal = destinoSalida === 'OTRO' ? otroDestino : destinoSalida;

        const totalPollos = cantidadTinas * pollosPorTina;
        const pesoNeto = pesoBrutoSalida - (cantidadTinas * pesoPorTina);

        mostrarModalConfirmacion({
            titulo: '¿Registrar salida?',
            contenido: `
      <p><strong>Tinas:</strong> ${cantidadTinas}</p>
      <p><strong>Pollos por tina:</strong> ${pollosPorTina}</p>
      <p><strong>Total pollos:</strong> ${totalPollos}</p>
      <p><strong>Peso neto:</strong> ${pesoNeto.toFixed(2)} kg</p>
      <p><strong>Destino:</strong> ${destinoFinal}</p>
    `,
            textoConfirmar: 'Registrar',
            alConfirmar: async () => {
                await registrarSalida(); // ← tu función original
            }
        });
    });

    document.getElementById('btnBuscarSalidas').addEventListener('click', () => {
        const fecha = document.getElementById('filtroFechaSalidas').value;
        if (!fecha) return mostrarNotificacion('Seleccione una fecha', 'warning');
        cargarSalidasPorFecha(fecha);
    });

    document.getElementById('btnLimpiarSalidas').addEventListener('click', () => {
        document.getElementById('filtroFechaSalidas').value = '';
        cargarSalidasDesdeUltimoCierre();
    });

    document.getElementById('btnExportarSalidas').addEventListener('click', () => {
        exportarSalidasExcel();
    });

    // Cambio en destino
    document.getElementById('destinoSalida').addEventListener('change', function () {
        const otroDiv = document.getElementById('otroDestinoDiv');
        if (this.value === 'OTRO') {
            otroDiv.classList.remove('d-none');
            document.getElementById('otroDestino').focus();
        } else {
            otroDiv.classList.add('d-none');
            document.getElementById('otroDestino').value = '';
        }
    });

    // Cargar datos al inicio
    cargarSalidasDesdeUltimoCierre();
});

// firebase
async function registrarSalida() {
    const cantidadTinas = Number(document.getElementById('cantidadTinas').value);
    const pollosPorTina = Number(document.getElementById('pollosPorTina').value);
    const pesoPorTina = Number(document.getElementById('pesoPorTina').value);
    const pesoBrutoSalida = Number(document.getElementById('pesoBrutoSalida').value);
    const destinoSalida = document.getElementById('destinoSalida').value;
    const otroDestino = document.getElementById('otroDestino').value;
    const destinoFinal = destinoSalida === 'OTRO' ? otroDestino : destinoSalida;

    const totalPollos = cantidadTinas * pollosPorTina;
    const pesoNeto = pesoBrutoSalida - (cantidadTinas * pesoPorTina);

    const id = 'PLSP' + Date.now().toString().slice(-5);

    try {
        await db.collection('salidas').add({
            id,
            fecha: firebase.firestore.Timestamp.fromDate(new Date()),
            producto: 'POLLO VIVO',
            tinas: cantidadTinas,
            pollosPorTina,
            kgPorTina: pesoPorTina,
            pesoBruto: pesoBrutoSalida,
            pesoNeto,
            totalPollos,
            tienda: destinoFinal
        });

        // 🔥 DESCUENTO DEL STOCK
        await restarStock(totalPollos, pesoNeto);

        mostrarNotificacion('✅ Salida registrada y stock actualizado', 'success');
        document.getElementById('formSalidas').reset();
        cargarSalidasDesdeUltimoCierre(); // recarga la tabla
    } catch (e) {
        console.error(e);
        mostrarNotificacion('❌ Error al registrar salida', 'error');
    }
}
// ============================================
// VERIFICACIÓN DE CARGA - DEBUG
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        console.log('=== VERIFICACIÓN DE SALIDAS ===');
        console.log('✅ Función cargarSalidasDesdeUltimoCierre:', typeof window.cargarSalidasDesdeUltimoCierre);
        console.log('✅ Función abrirModalEditarSalida:', typeof window.abrirModalEditarSalida);

        // Verificar botones después de 3 segundos
        setTimeout(() => {
            const botonesEditar = document.querySelectorAll('.btn-editar[data-tipo="salida"]');
            console.log('🔍 Botones editar encontrados:', botonesEditar.length);

            if (botonesEditar.length === 0) {
                console.warn('⚠️ No se encontraron botones de editar en salidas');
            } else {
                botonesEditar.forEach((btn, index) => {
                    console.log(`Botón ${index + 1}: ID=${btn.dataset.id}`);
                });
            }
        }, 3000);

    }, 2000);
});