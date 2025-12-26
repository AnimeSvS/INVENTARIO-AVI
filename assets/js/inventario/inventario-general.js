// assets/js/inventario/inventario-general.js - INVENTARIO FUNCIONAL

// assets/js/inventario/inventario-general.js - SIN TABLA DE PRODUCTOS, CON TOTALES EN DISTRIBUCIÓN

let PRECIO_KG = 8.50;

// Cargar precio desde localStorage si existe
const precioGuardado = localStorage.getItem('precio_kg_inventario');
if (precioGuardado) {
    PRECIO_KG = parseFloat(precioGuardado);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Inicializando módulo de inventario...');

    const container = document.getElementById('inventario');
    if (!container) {
        console.error('❌ No se encontró el contenedor de inventario');
        return;
    }

    container.innerHTML = `
    <div class="card p-4 mb-4">
      <h4 class="text-info mb-4">📦 INVENTARIO GENERAL ACUMULADO</h4>
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card text-center border-primary shadow-sm h-100">
            <div class="card-body">
              <h6 class="card-title text-muted">🐓 STOCK POLLO VIVO</h6>
              <h3 id="stockPollos" class="text-primary">0</h3>
              <small class="text-muted">Pollos en stock</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-center border-success shadow-sm h-100">
            <div class="card-body">
              <h6 class="card-title text-muted">⚖️ TOTAL DE KG</h6>
              <h3 id="stockKilos" class="text-success">0 KG</h3>
              <small class="text-muted">Peso total</small>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-center border-warning shadow-sm h-100">
            <div class="card-body">
              <h6 class="card-title text-muted">💰 VALOR ESTIMADO</h6>
              <h3 id="stockValor" class="text-warning">S/ 0.00</h3>
              <small class="text-muted">A S/ <span id="precioDisplay">${PRECIO_KG.toFixed(2)}</span> x kg</small>
         <button class="btn btn-sm btn-outline-warning mt-2" 
        onclick="(function(){ 
            // Crear modal directamente
            const precioActual = window.PRECIO_KG || 8.50;
            const nuevoPrecio = prompt('Editar precio por kg (actual: S/ ' + precioActual + ')', precioActual);
            if (nuevoPrecio && !isNaN(nuevoPrecio) && nuevoPrecio > 0) {
                window.PRECIO_KG = parseFloat(nuevoPrecio);
                localStorage.setItem('precio_kg_inventario', nuevoPrecio);
                
                // Actualizar display
                const display = document.getElementById('precioDisplay');
                if (display) display.textContent = parseFloat(nuevoPrecio).toFixed(2);
                
                // Actualizar valor si hay stock
                obtenerStockActual().then(stock => {
                    const stockKilos = stock.pesoNeto || 0;
                    const valorElement = document.getElementById('stockValor');
                    if (valorElement) {
                        valorElement.textContent = 'S/ ' + (stockKilos * parseFloat(nuevoPrecio)).toFixed(2);
                    }
                });
                
                mostrarNotificacion('✅ Precio actualizado: S/ ' + parseFloat(nuevoPrecio).toFixed(2), 'success');
            }
        })()">✏️ Editar Precio</button>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h6 class="mb-0">📈 MOVIMIENTOS DEL DÍA</h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <h5 class="text-success" id="ingresosDia">0</h5>
                  <small>Ingresos</small>
                </div>
                <div class="col-6">
                  <h5 class="text-danger" id="salidasDia">0</h5>
                  <small>Salidas</small>
                </div>
              </div>
              <div class="mt-3">
                <small class="text-muted">Última actualización: <span id="ultimaActualizacion">--:--</span></small>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h6 class="mb-0">📊 PROMEDIOS DEL DÍA</h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <h5 id="promedioPeso">0.000</h5>
                  <small>Kg por pollo</small>
                </div>
                <div class="col-6">
                  <h5 id="promedioPollos">0.0</h5>
                  <small>Pollos x movimiento</small>
                </div>
              </div>
              <div class="mt-2">
                <small class="text-muted" id="totalMovimientos">0 movimientos registrados</small>
              </div>
            </div>
          </div>
        </div>
      </div>
</div>
  `;

// por si se desea detallle de tiendas por dia
//   <div class="d-flex justify-content-end mb-3 gap-2">
//         <button onclick="actualizarInventario()" class="btn btn-primary btn-sm">
//             <span>🔄 Actualizar</span>
//         </button>
//         <button onclick="exportarInventarioExcel()" class="btn btn-success btn-sm">
//             <span>📊 Exportar Excel</span>
//         </button>
//       </div>

//       <!--DISTRIBUCIÓN POR TIENDA CON TOTALES-- >
//         <div class="card mt-4">
//             <div class="card-header bg-light d-flex justify-content-between align-items-center">
//                 <h6 class="mb-0">🏪 DISTRIBUCIÓN POR TIENDA (HOY)</h6>
//                 <div class="text-end">
//                     <small class="text-muted d-block">Resumen del día</small>
//                     <small class="text-primary fw-bold" id="totalDistribucion">0 tiendas</small>
//                 </div>
//             </div>
//             <div class="card-body">
//                 <div class="table-responsive">
//                     <table class="table table-sm">
//                         <thead>
//                             <tr>
//                                 <th>TIENDA</th>
//                                 <th>POLLOS ENVIADOS</th>
//                                 <th>PESO TOTAL</th>
//                                 <th>ENVÍOS</th>
//                                 <th>ÚLTIMO ENVÍO</th>
//                             </tr>
//                         </thead>
//                         <tbody id="tablaDistribucionTiendas">
//                             <tr>
//                                 <td colspan="5" class="text-center text-muted">Cargando distribución...</td>
//                             </tr>
//                         </tbody>
//                         <tfoot class="table-light">
//                             <tr>
//                                 <td><strong>📊 TOTAL GENERAL</strong></td>
//                                 <td><strong id="totalPollosGeneral">0</strong></td>
//                                 <td><strong id="totalPesoGeneral">0 KG</strong></td>
//                                 <td><strong id="totalEnviosGeneral">0</strong></td>
//                                 <td>-</td>
//                             </tr>
//                         </tfoot>
//                     </table>
//                 </div>
//             </div>
//         </div>
// fin



    console.log('✅ Interfaz de inventario cargada');

    // Cargar datos del inventario
    cargarInventarioGeneral();
});

/**
 * Función principal para cargar todos los datos del inventario - CORREGIDA
 */
async function cargarInventarioGeneral() {
    try {
        console.log('🔄 Cargando datos del inventario...');

        // 1. OBTENER ELEMENTOS CON VERIFICACIÓN
        const elementos = {
            stockPollos: document.getElementById('stockPollos'),
            stockKilos: document.getElementById('stockKilos'),
            stockValor: document.getElementById('stockValor'),
            precioDisplay: document.getElementById('precioDisplay'),
            ingresosDia: document.getElementById('ingresosDia'),
            salidasDia: document.getElementById('salidasDia'),
            totalMovimientos: document.getElementById('totalMovimientos'),
            ultimaActualizacion: document.getElementById('ultimaActualizacion'),
            promedioPeso: document.getElementById('promedioPeso'),
            promedioPollos: document.getElementById('promedioPollos'),
            totalDistribucion: document.getElementById('totalDistribucion'),
            tablaDistribucionTiendas: document.getElementById('tablaDistribucionTiendas'),
            totalPollosGeneral: document.getElementById('totalPollosGeneral'),
            totalPesoGeneral: document.getElementById('totalPesoGeneral'),
            totalEnviosGeneral: document.getElementById('totalEnviosGeneral')
        };

        // Verificar qué elementos existen
        Object.entries(elementos).forEach(([nombre, elemento]) => {
            if (!elemento) {
                console.warn(`⚠️ Elemento no encontrado: ${nombre}`);
            }
        });

        // 2. OBTENER STOCK ACTUAL
        const stockSnap = await db.collection('stock').doc('POLLO_VIVO').get();
        let stockPollos = 0;
        let stockKilos = 0;

        if (stockSnap.exists) {
            const data = stockSnap.data();
            stockPollos = data.cantidadPollos || 0;
            stockKilos = data.pesoNeto || 0;
            console.log(`📊 Stock encontrado: ${stockPollos} pollos, ${stockKilos} kg`);
        } else {
            console.log('⚠️ No hay documento de stock, creando uno...');
            await db.collection('stock').doc('POLLO_VIVO').set({
                cantidadPollos: 0,
                pesoNeto: 0,
                ultimaActualizacion: firebase.firestore.Timestamp.now()
            });
        }

        // 3. ACTUALIZAR KPIs CON VERIFICACIÓN
        if (elementos.stockPollos) elementos.stockPollos.textContent = stockPollos.toLocaleString('es-PE');
        if (elementos.stockKilos) elementos.stockKilos.textContent = stockKilos.toFixed(2) + ' KG';
        if (elementos.stockValor) elementos.stockValor.textContent = 'S/ ' + (stockKilos * PRECIO_KG).toFixed(2);
        if (elementos.precioDisplay) elementos.precioDisplay.textContent = PRECIO_KG.toFixed(2);

        // 4. CARGAR MOVIMIENTOS DEL DÍA
        const hoy = obtenerFechaPeru();
        
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

        console.log('📅 Buscando movimientos del día:', inicio.toLocaleDateString());

        // Ingresos del día
        const ingresosSnap = await db.collection('ingresos')
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .get();

        // Salidas del día
        const salidasSnap = await db.collection('salidas')
            .where('fecha', '>=', firebase.firestore.Timestamp.fromDate(inicio))
            .where('fecha', '<=', firebase.firestore.Timestamp.fromDate(fin))
            .get();

        const ingresosCount = ingresosSnap.size;
        const salidasCount = salidasSnap.size;

        if (elementos.ingresosDia) elementos.ingresosDia.textContent = ingresosCount;
        if (elementos.salidasDia) elementos.salidasDia.textContent = salidasCount;
        if (elementos.totalMovimientos) elementos.totalMovimientos.textContent = `${ingresosCount + salidasCount} movimientos registrados`;
        if (elementos.ultimaActualizacion) elementos.ultimaActualizacion.textContent = new Date().toLocaleTimeString('es-PE');

        // 5. CALCULAR PROMEDIOS
        let totalPollosIngresados = 0;
        let totalPesoIngresado = 0;
        let totalPollosSalidos = 0;
        let totalPesoSalido = 0;

        // Calcular ingresos
        ingresosSnap.forEach(doc => {
            const d = doc.data();
            const { cPollos, neto } = calcular(d.cantidadJabas, d.pollosPorJaba, d.pesoBruto, d.pesoJaba || 0);
            totalPollosIngresados += cPollos;
            totalPesoIngresado += neto;
        });

        // Calcular salidas
        salidasSnap.forEach(doc => {
            const d = doc.data();
            totalPollosSalidos += d.totalPollos || 0;
            totalPesoSalido += d.pesoNeto || 0;
        });

        const promedioPeso = totalPollosIngresados > 0 ? (totalPesoIngresado / totalPollosIngresados) : 0;
        const promedioPollos = (ingresosCount + salidasCount) > 0 ? ((totalPollosIngresados + totalPollosSalidos) / (ingresosCount + salidasCount)) : 0;

        if (elementos.promedioPeso) elementos.promedioPeso.textContent = promedioPeso.toFixed(3);
        if (elementos.promedioPollos) elementos.promedioPollos.textContent = promedioPollos.toFixed(1);

        // 6. DISTRIBUCIÓN POR TIENDA - CON VERIFICACIÓN COMPLETA
        if (!elementos.tablaDistribucionTiendas) {
            console.warn('⚠️ tablaDistribucionTiendas no encontrada, saltando sección de distribución');
            console.log('✅ Inventario cargado (sin distribución)');
            return;
        }

        const distribucion = {};
        salidasSnap.forEach(doc => {
            const d = doc.data();
            const tienda = d.tienda || 'Sin destino';

            if (!distribucion[tienda]) {
                distribucion[tienda] = {
                    pollos: 0,
                    peso: 0,
                    envios: 0,
                    ultimoEnvio: null
                };
            }

            distribucion[tienda].pollos += d.totalPollos || 0;
            distribucion[tienda].peso += d.pesoNeto || 0;
            distribucion[tienda].envios += 1;

            const fechaEnvio = d.fecha?.toDate();
            if (!distribucion[tienda].ultimoEnvio || fechaEnvio > distribucion[tienda].ultimoEnvio) {
                distribucion[tienda].ultimoEnvio = fechaEnvio;
            }
        });

        // Calcular totales generales
        let totalPollosGeneral = 0;
        let totalPesoGeneral = 0;
        let totalEnviosGeneral = 0;

        Object.values(distribucion).forEach(datos => {
            totalPollosGeneral += datos.pollos;
            totalPesoGeneral += datos.peso;
            totalEnviosGeneral += datos.envios;
        });

        // Actualizar distribución
        if (elementos.totalDistribucion) elementos.totalDistribucion.textContent = `${Object.keys(distribucion).length} tiendas`;

        elementos.tablaDistribucionTiendas.innerHTML = '';

        if (Object.keys(distribucion).length === 0) {
            elementos.tablaDistribucionTiendas.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-3">
                        No hay distribuciones para hoy
                    </td>
                </tr>
            `;
            // Limpiar totales si no hay datos
            if (elementos.totalPollosGeneral) elementos.totalPollosGeneral.textContent = '0';
            if (elementos.totalPesoGeneral) elementos.totalPesoGeneral.textContent = '0 KG';
            if (elementos.totalEnviosGeneral) elementos.totalEnviosGeneral.textContent = '0';
        } else {
            // Mostrar totales generales
            if (elementos.totalPollosGeneral) elementos.totalPollosGeneral.textContent = totalPollosGeneral.toLocaleString('es-PE');
            if (elementos.totalPesoGeneral) elementos.totalPesoGeneral.textContent = totalPesoGeneral.toFixed(2) + ' KG';
            if (elementos.totalEnviosGeneral) elementos.totalEnviosGeneral.textContent = totalEnviosGeneral;

            Object.entries(distribucion)
                .sort((a, b) => b[1].pollos - a[1].pollos)
                .forEach(([tienda, datos]) => {
                    const fechaFormateada = datos.ultimoEnvio ?
                        datos.ultimoEnvio.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) :
                        '--:--';

                    elementos.tablaDistribucionTiendas.innerHTML += `
                        <tr>
                            <td><strong>🏪 ${tienda}</strong></td>
                            <td><span class="badge bg-primary">${datos.pollos.toLocaleString('es-PE')}</span></td>
                            <td>${datos.peso.toFixed(2)} KG</td>
                            <td><span class="badge bg-info">${datos.envios}</span></td>
                            <td><small>${fechaFormateada}</small></td>
                        </tr>
                    `;
                });
        }

        console.log('✅ Inventario cargado completamente');

    } catch (error) {
        console.error('❌ Error al cargar inventario:', error);
        mostrarNotificacion('Error al cargar inventario: ' + error.message, 'error');
    }
}

/**
 * Función para actualizar manualmente el inventario
 */
async function actualizarInventario() {
    console.log('🔄 Actualizando inventario manualmente...');

    mostrarNotificacion('Actualizando inventario...', 'info');

    try {
        await cargarInventarioGeneral();
        mostrarNotificacion('✅ Inventario actualizado', 'success');
    } catch (error) {
        console.error('❌ Error al actualizar:', error);
        mostrarNotificacion('Error al actualizar inventario', 'error');
    }
}
/**
 * Exportar inventario a Excel - SIN REFERENCIA A TABLA INVENTARIO
 */
function exportarInventarioExcel() {
    try {
        const tablaDist = document.getElementById('tablaDistribucionTiendas');
        const totalPollos = document.getElementById('totalPollosGeneral')?.textContent || '0';
        const totalPeso = document.getElementById('totalPesoGeneral')?.textContent || '0 KG';
        const totalEnvios = document.getElementById('totalEnviosGeneral')?.textContent || '0';

        if (!tablaDist || tablaDist.rows.length === 0) {
            mostrarNotificacion('No hay distribución para exportar', 'warning');
            return;
        }

        // Crear libro de Excel
        const wb = XLSX.utils.book_new();

        // Datos de distribución por tienda (incluye el footer con totales)
        const tablaCompleta = tablaDist.closest('table');
        const wsDistribucion = XLSX.utils.table_to_sheet(tablaCompleta);

        // Agregar datos adicionales
        const fecha = new Date().toLocaleDateString('es-PE');
        XLSX.utils.sheet_add_aoa(wsDistribucion, [
            [],
            ['📊 RESUMEN DE DISTRIBUCIÓN - ' + fecha],
            ['Total de Pollos:', totalPollos],
            ['Total de Peso (KG):', totalPeso],
            ['Total de Envíos:', totalEnvios],
            ['Precio por KG:', 'S/ ' + PRECIO_KG.toFixed(2)],
            ['Valor Estimado Total:', 'S/ ' + (parseFloat(totalPeso) * PRECIO_KG).toFixed(2)]
        ], { origin: -1 });

        XLSX.utils.book_append_sheet(wb, wsDistribucion, 'Distribución por Tienda');

        // Descargar archivo con fecha
        const fechaArchivo = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `distribucion_tiendas_${fechaArchivo}.xlsx`);

        mostrarNotificacion('📊 Distribución exportada exitosamente', 'success');

    } catch (error) {
        console.error('❌ Error al exportar:', error);
        mostrarNotificacion('Error al exportar distribución', 'error');
    }
}
// ============================================
// FUNCIONES GLOBALES
// ============================================

// Hacer funciones disponibles globalmente
window.cargarInventarioGeneral = cargarInventarioGeneral;
window.actualizarInventario = actualizarInventario;
window.exportarInventarioExcel = exportarInventarioExcel;
window.PRECIO_KG = PRECIO_KG;

console.log('✅ Módulo de inventario general cargado');