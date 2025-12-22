// ui.js - MODIFICAR (quitar cálculo automático, mantener solo validación)
document.addEventListener('DOMContentLoaded', function () {
    // Mostrar/ocultar campo "OTRO DESTINO" (mantener igual)
    const destinoSelect = document.getElementById('salidaDestino');
    const otroDestinoDiv = document.getElementById('otroDestinoDiv');

    if (destinoSelect && otroDestinoDiv) {
        destinoSelect.addEventListener('change', function () {
            if (this.value === 'OTRO') {
                otroDestinoDiv.classList.remove('d-none');
                document.getElementById('otroDestino').required = true;
            } else {
                otroDestinoDiv.classList.add('d-none');
                document.getElementById('otroDestino').required = false;
                document.getElementById('otroDestino').value = '';
            }
        });
    }

    // Función para validar en tiempo real (sin cálculo automático)
    const validarFormularioSalida = () => {
        const tinas = parseFloat(document.getElementById('salidaJabas')?.value) || 0;
        const pollosPorTina = parseFloat(document.getElementById('salidaPollosJaba')?.value) || 0;
        const kgPorTina = parseFloat(document.getElementById('salidaPesoPorTina')?.value) || 0;
        const pesoBruto = parseFloat(document.getElementById('salidaPesoBruto')?.value) || 0;
        const btnRegistrar = document.querySelector('#formSalida button[type="submit"]');

        // Habilitar/deshabilitar botón basado en validación
        const esValido = tinas > 0 && pollosPorTina > 0 && kgPorTina > 0 && pesoBruto > 0;
        if (btnRegistrar) {
            btnRegistrar.disabled = !esValido;
            btnRegistrar.title = esValido ? 'Haga clic para registrar' : 'Complete todos los campos requeridos';
        }
    };

    // Agregar event listeners a todos los campos
    ['salidaJabas', 'salidaPollosJaba', 'salidaPesoPorTina', 'salidaPesoBruto'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', validarFormularioSalida);
    });

    // Validar inicialmente
    validarFormularioSalida();
});
// botones.js - AGREGAR este archivo nuevo

document.addEventListener('DOMContentLoaded', function () {
    // Botones de REGISTROS
    document.getElementById('btnBuscarFecha')?.addEventListener('click', () => {
        const fechaStr = document.getElementById('buscarFecha').value;
        if (!fechaStr) {
            alert('Seleccione una fecha para buscar');
            return;
        }
        if (typeof buscarRegistrosPorFecha === 'function') {
            buscarRegistrosPorFecha(fechaStr);
        }
    });

    document.getElementById('btnLimpiarBusqueda')?.addEventListener('click', () => {
        if (typeof limpiarBusquedaRegistros === 'function') {
            limpiarBusquedaRegistros();
        }
    });

    // document.getElementById('btnImprimir')?.addEventListener('click', () => {
    //     imprimirResumen('tablaRegistros');
    // });

    document.getElementById('btnExportarExcel')?.addEventListener('click', () => {
        if (typeof exportarRegistrosAXLS === 'function') {
            exportarRegistrosAXLS();
        }
    });
});
// ui.js - Agregar al final del archivo existente

// Botones de SALIDAS
document.addEventListener('DOMContentLoaded', function () {
    // Botones de SALIDAS
    document.getElementById('btnBuscarFechaSalidas')?.addEventListener('click', () => {
        buscarSalidasPorFecha();
    });

    document.getElementById('btnLimpiarBusquedaSalidas')?.addEventListener('click', () => {
        limpiarBusquedaSalidas();
    });

    document.getElementById('btnExportarExcelSalidas')?.addEventListener('click', () => {
        if (typeof exportarSalidasAXLS === 'function') {
            exportarSalidasAXLS();
        } else {
            alert('La función de exportación no está disponible');
        }
    });

    // Inicializar paginación de salidas al cargar
    if (typeof cargarPaginaSalidas === 'function') {
        setTimeout(() => {
            cargarPaginaSalidas('primera');
        }, 500);
    }
});
// ui.js - Agregar función de depuración

function depurarBusquedaSalidas() {
    console.log('=== DEPURACIÓN BÚSQUEDA SALIDAS ===');

    // Verificar elementos del DOM
    const btnBuscar = document.getElementById('btnBuscarFechaSalidas');
    const inputFecha = document.getElementById('buscarFechaSalidas');
    const tablaSalidas = document.getElementById('tablaSalidas');

    console.log('Elementos encontrados:', {
        btnBuscar: !!btnBuscar,
        inputFecha: !!inputFecha,
        tablaSalidas: !!tablaSalidas,
        inputFechaValue: inputFecha ? inputFecha.value : 'N/A'
    });

    // Verificar funciones
    console.log('Funciones disponibles:', {
        buscarSalidasPorFecha: typeof buscarSalidasPorFecha,
        fechaInputADate: typeof fechaInputADate,
        getInicioDelDia: typeof getInicioDelDia,
        salidasRef: salidasRef ? 'Definida' : 'No definida'
    });

    return true;
}

// Modificar el event listener
document.addEventListener('DOMContentLoaded', function () {
    // Botones de SALIDAS - Versión mejorada
    const btnBuscarSalidas = document.getElementById('btnBuscarFechaSalidas');

    if (btnBuscarSalidas) {
        console.log('✅ Botón buscar salidas encontrado, asignando evento...');

        // Primero remover event listeners anteriores
        btnBuscarSalidas.removeEventListener('click', buscarSalidasPorFecha);

        // Asignar nuevo event listener
        btnBuscarSalidas.addEventListener('click', function (e) {
            console.log('🖱️ Botón buscar salidas clickeado');
            e.preventDefault();
            e.stopPropagation();

            // Ejecutar depuración
            depurarBusquedaSalidas();

            // Ejecutar búsqueda
            if (typeof buscarSalidasPorFecha === 'function') {
                console.log('🚀 Ejecutando buscarSalidasPorFecha...');
                buscarSalidasPorFecha();
            } else {
                alert('Error: Función buscarSalidasPorFecha no disponible');
                console.error('❌ buscarSalidasPorFecha no es una función');
            }
        });
    } else {
        console.error('❌ Botón buscar salidas NO encontrado en el DOM');
    }

    // Resto de los botones...
    document.getElementById('btnLimpiarBusquedaSalidas')?.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('🧹 Limpiando búsqueda de salidas...');
        limpiarBusquedaSalidas();
    });
});

// En ui.js, usar delegación de eventos
document.addEventListener('click', (e) => {
    // Botones de exportación
    if (e.target.closest('#btnExportarExcel')) {
        e.preventDefault();
        exportarRegistrosAXLS();
    }

    if (e.target.closest('#btnExportarExcelSalidas')) {
        e.preventDefault();
        exportarSalidasAXLS();
    }

    // Botones de búsqueda
    if (e.target.closest('#btnBuscarFecha')) {
        e.preventDefault();
        buscarRegistrosPorFecha(document.getElementById('buscarFecha').value);
    }
});
// Indicador de carga global
class LoadingManager {
    constructor() {
        this.loadingCount = 0;
    }

    mostrar() {
        this.loadingCount++;
        if (this.loadingCount === 1) {
            this.crearIndicador();
        }
    }

    ocultar() {
        this.loadingCount--;
        if (this.loadingCount <= 0) {
            this.loadingCount = 0;
            this.eliminarIndicador();
        }
    }

    crearIndicador() {
        const indicador = document.createElement('div');
        indicador.id = 'global-loading';
        indicador.className = 'position-fixed top-50 start-50 translate-middle';
        indicador.style.cssText = 'z-index: 9999;';
        indicador.innerHTML = `
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Cargando...</span>
            </div>
        `;
        document.body.appendChild(indicador);
    }

    eliminarIndicador() {
        const indicador = document.getElementById('global-loading');
        if (indicador) {
            indicador.remove();
        }
    }
}

const loadingManager = new LoadingManager();
window.loadingManager = loadingManager;