// utilitarios.js - VERSIÓN CORREGIDA (eliminar duplicados)

function fechaInputADate(fechaInput) {
    if (!fechaInput) return null;
    const partes = fechaInput.split('-'); // [yyyy, mm, dd]
    if (partes.length !== 3) return null;
    return new Date(partes[0], partes[1] - 1, partes[2]);
}


// -----------------------
function getInicioDelDia(fecha) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    return inicio;
}

function getFinDelDia(fecha) {
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);
    return fin;
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alerta);

    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.remove();
        }
    }, 3000);
}
// ---------------------

function calcular(cj, pj, pb, pesoJaba) {
    const totalJ = pesoJaba * cj;  // Total Jabas
    const cPollos = cj * pj;      // Cantidad de Pollos
    const neto = pb - totalJ;     // Peso Neto
    const prom = neto / cPollos;  // Promedio por Pollo
    return { totalJ, cPollos, neto, prom };
}

function formatearID(num) {
    return 'PLIP' + String(num).padStart(5, '0');
}

function ahoraTimestamp() {
    return firebase.firestore.Timestamp.fromDate(new Date());
}
// En utilitarios.js, asegurar todas las funciones necesarias
function formatearFecha(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Fecha inválida';
    return timestamp.toDate().toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
// Reemplazar alerts por un sistema centralizado
function mostrarAlerta(mensaje, tipo = 'error') {
    const tipos = {
        success: { clase: 'alert-success', icono: '✅' },
        error: { clase: 'alert-danger', icono: '❌' },
        warning: { clase: 'alert-warning', icono: '⚠️' },
        info: { clase: 'alert-info', icono: 'ℹ️' }
    };

    const config = tipos[tipo] || tipos.error;
    mostrarNotificacionDiscreta(mensaje, tipo);
}
// Sistema de notificaciones persistente
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    // Eliminar notificaciones anteriores
    const notificacionesAnteriores = document.querySelectorAll('.global-notification');
    notificacionesAnteriores.forEach(n => n.remove());

    const tipos = {
        success: { clase: 'alert-success', icono: '✅' },
        error: { clase: 'alert-danger', icono: '❌' },
        warning: { clase: 'alert-warning', icono: '⚠️' },
        info: { clase: 'alert-info', icono: 'ℹ️' }
    };

    const config = tipos[tipo] || tipos.info;

    const notificacion = document.createElement('div');
    notificacion.className = `global-notification alert ${config.clase} alert-dismissible fade show position-fixed`;
    notificacion.style.cssText = `
        top: 20px; 
        right: 20px; 
        z-index: 9999; 
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
    `;

    notificacion.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="me-2">${config.icono}</span>
            <span class="flex-grow-1">${mensaje}</span>
            <button type="button" class="btn-close ms-2" data-bs-dismiss="alert"></button>
        </div>
    `;

    document.body.appendChild(notificacion);

    // Auto-eliminar
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.classList.remove('show');
            setTimeout(() => notificacion.remove(), 300);
        }
    }, duracion);
}
// Validación de formularios mejorada
function validarFormulario(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required]');
    let esValido = true;
    let errores = [];

    inputs.forEach(input => {
        // Limpiar clases anteriores
        input.classList.remove('is-invalid', 'is-valid');

        // Validar campo
        if (!input.value || input.value.trim() === '') {
            input.classList.add('is-invalid');
            errores.push(`El campo ${input.labels[0]?.textContent || input.placeholder} es requerido`);
            esValido = false;
        } else if (input.type === 'number' && parseFloat(input.value) <= 0) {
            input.classList.add('is-invalid');
            errores.push(`El campo ${input.labels[0]?.textContent || input.placeholder} debe ser mayor a 0`);
            esValido = false;
        } else {
            input.classList.add('is-valid');
        }
    });

    // Mostrar errores
    if (!esValido) {
        mostrarNotificacion('❌ ' + errores.join(', '), 'error');
    }

    return esValido;
}

// Agregar al final de utilitarios.js
// Sistema de notificaciones que reemplaza alert()

// Reemplazar alert() global
window.originalAlert = window.alert;
window.alert = function (message, type = 'info') {
    console.log('Alert interceptado:', message);
    mostrarNotificacion(message, type, type === 'error' ? 0 : 5000);
};

// Función para reemplazar todos los alert() existentes
function reemplazarAlertsEnFunciones() {
    // Lista de funciones que usan alert
    const funcionesConAlert = [
        'agregarRegistro',
        'eliminarRegistro',
        'abrirEditar',
        'cargarDatosInicial',
        'registrarSalida',
        'buscarSalidasPorFecha',
        'cargarInventarioPorFecha'
    ];

    // Reemplazar en el código existente
    funcionesConAlert.forEach(nombreFuncion => {
        if (typeof window[nombreFuncion] === 'function') {
            console.log(`Reemplazando alerts en ${nombreFuncion}`);
        }
    });
}

// Llamar al cargar
document.addEventListener('DOMContentLoaded', reemplazarAlertsEnFunciones);

// Agregar al final de utilitarios.js
class LoadingManager {
    constructor() {
        this.loadingCount = 0;
        this.loadingElement = null;
    }

    mostrar(mensaje = 'Procesando...') {
        this.loadingCount++;

        if (this.loadingCount === 1) {
            this.crearIndicador(mensaje);
        }
    }

    ocultar() {
        this.loadingCount--;

        if (this.loadingCount <= 0) {
            this.loadingCount = 0;
            this.eliminarIndicador();
        }
    }

    crearIndicador(mensaje) {
        if (this.loadingElement) return;

        this.loadingElement = document.createElement('div');
        this.loadingElement.id = 'global-loading-overlay';
        this.loadingElement.className = 'loading-overlay';
        this.loadingElement.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${mensaje}</div>
            </div>
        `;

        document.body.appendChild(this.loadingElement);

        // Prevenir scroll
        document.body.style.overflow = 'hidden';
    }

    eliminarIndicador() {
        if (this.loadingElement) {
            this.loadingElement.remove();
            this.loadingElement = null;

            // Restaurar scroll
            document.body.style.overflow = '';
        }
    }

    // Helper para operaciones async
    async ejecutarConLoading(asyncFn, mensaje = 'Procesando...') {
        this.mostrar(mensaje);
        try {
            const resultado = await asyncFn();
            return resultado;
        } catch (error) {
            console.error('Error en operación:', error);
            throw error;
        } finally {
            this.ocultar();
        }
    }
}

// Crear instancia global
const loadingManager = new LoadingManager();

// Agregar al final de utilitarios.js
class ValidadorFormularios {
    constructor() {
        this.reglas = {
            // Reglas específicas por ID de campo
            'cantidadJabas': {
                min: 1,
                max: 100,
                mensaje: 'La cantidad de jabas debe estar entre 1 y 100'
            },
            'pollosPorJaba': {
                min: 1,
                max: 20,
                mensaje: 'Los pollos por jaba deben estar entre 1 y 20'
            },
            'inputPesoJaba': {
                min: 0.1,
                max: 5,
                mensaje: 'El peso por jaba debe estar entre 0.1 y 5 kg'
            },
            'pesoBruto': {
                min: 1,
                max: 1000,
                mensaje: 'El peso bruto debe estar entre 1 y 1000 kg'
            },
            'salidaJabas': {
                min: 1,
                max: 50,
                mensaje: 'La cantidad de tinas debe estar entre 1 y 50'
            },
            'salidaPollosJaba': {
                min: 1,
                max: 30,
                mensaje: 'Los pollos por tina deben estar entre 1 y 30'
            },
            'salidaPesoPorTina': {
                min: 0.1,
                max: 10,
                mensaje: 'El peso por tina debe estar entre 0.1 y 10 kg'
            },
            'salidaPesoBruto': {
                min: 1,
                max: 1000,
                mensaje: 'El peso bruto de salida debe estar entre 1 y 1000 kg'
            }
        };
    }

    validarFormulario(formId) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`Formulario con ID ${formId} no encontrado`);
            return false;
        }

        const inputs = form.querySelectorAll('input[required], select[required]');
        let errores = [];
        let primerError = null;

        // Limpiar estados anteriores
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });

        inputs.forEach(input => {
            const valor = input.value.trim();
            const nombre = input.labels[0]?.textContent || input.placeholder || 'Campo';
            
            // Validación básica de vacío
            if (!valor) {
                this.marcarError(input, `${nombre} es requerido`);
                errores.push(`${nombre} es requerido`);
                if (!primerError) primerError = input;
                return;
            }

            // Validaciones por tipo de input
            if (input.type === 'number' || input.classList.contains('number-input')) {
                const numValor = parseFloat(valor);
                if (isNaN(numValor)) {
                    this.marcarError(input, `${nombre} debe ser un número válido`);
                    errores.push(`${nombre} debe ser un número válido`);
                    if (!primerError) primerError = input;
                    return;
                }

                if (numValor <= 0) {
                    this.marcarError(input, `${nombre} debe ser mayor a 0`);
                    errores.push(`${nombre} debe ser mayor a 0`);
                    if (!primerError) primerError = input;
                    return;
                }

                // Validar rangos específicos
                if (this.reglas[input.id]) {
                    const regla = this.reglas[input.id];
                    if (numValor < regla.min || numValor > regla.max) {
                        this.marcarError(input, regla.mensaje);
                        errores.push(regla.mensaje);
                        if (!primerError) primerError = input;
                        return;
                    }
                }
            }

            // Validaciones específicas
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(valor)) {
                    this.marcarError(input, `${nombre} debe ser un email válido`);
                    errores.push(`${nombre} debe ser un email válido`);
                    if (!primerError) primerError = input;
                    return;
                }
            }

            // Validar selects
            if (input.tagName === 'SELECT') {
                if (valor === '' || valor === 'Seleccione') {
                    this.marcarError(input, `Por favor seleccione una opción en ${nombre}`);
                    errores.push(`Por favor seleccione una opción en ${nombre}`);
                    if (!primerError) primerError = input;
                    return;
                }
            }

            // Si pasa todas las validaciones
            this.marcarValido(input);
        });

        // Mostrar resumen de errores
        if (errores.length > 0) {
            mostrarNotificacion('❌ Por favor corrija los siguientes errores:\n' + errores.join('\n'), 'error');
            if (primerError) {
                primerError.focus();
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }

        // Si todo está válido, agregar animación de éxito
        this.mostrarExitoValidacion(form);
        return true;
    }

    marcarError(input, mensaje) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        
        // Agregar tooltip con el mensaje de error
        input.setAttribute('data-bs-toggle', 'tooltip');
        input.setAttribute('data-bs-placement', 'top');
        input.setAttribute('title', mensaje);
        
        // Activar tooltip de Bootstrap
        if (typeof bootstrap !== 'undefined') {
            new bootstrap.Tooltip(input);
        }
    }

    marcarValido(input) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
        
        // Limpiar tooltip
        input.removeAttribute('data-bs-toggle');
        input.removeAttribute('data-bs-placement');
        input.removeAttribute('title');
    }

    mostrarExitoValidacion(form) {
        // Agregar efecto visual de éxito
        form.classList.add('was-validated');
        
        // Resaltar campos válidos temporalmente
        const validos = form.querySelectorAll('.is-valid');
        validos.forEach(input => {
            input.style.transition = 'all 0.3s ease';
            input.style.boxShadow = '0 0 0 0.25rem rgba(25, 135, 84, 0.25)';
            
            setTimeout(() => {
                input.style.boxShadow = '';
            }, 1000);
        });
    }

    // Validación en tiempo real
    habilitarValidacionEnTiempoReal(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validarCampoIndividual(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    this.validarCampoIndividual(input);
                }
            });
        });
    }

    validarCampoIndividual(input) {
        const valor = input.value.trim();
        
        // Limpiar estados anteriores
        input.classList.remove('is-invalid', 'is-valid');
        
        if (!valor) return;

        // Validar según tipo
        if (input.type === 'number' || input.classList.contains('number-input')) {
            const numValor = parseFloat(valor);
            if (isNaN(numValor) || numValor <= 0) {
                this.marcarError(input, 'Debe ser un número válido mayor a 0');
                return;
            }

            // Validar rangos
            if (this.reglas[input.id]) {
                const regla = this.reglas[input.id];
                if (numValor < regla.min || numValor > regla.max) {
                    this.marcarError(input, regla.mensaje);
                    return;
                }
            }
        }

        // Si pasa validación
        this.marcarValido(input);
    }
}

// Crear instancia global
const validador = new ValidadorFormularios();


// Hacer funciones disponibles globalmente
window.fechaInputADate = fechaInputADate;
window.getInicioDelDia = getInicioDelDia;
window.getFinDelDia = getFinDelDia;
window.calcular = calcular;
window.formatearID = formatearID;
window.ahoraTimestamp = ahoraTimestamp;