// js/auth-system.js - Sistema completo de autenticación y permisos

// ============================================
// 1. FUNCIONES BÁSICAS
// ============================================

function obtenerUsuarioActual() {
    const usuario = localStorage.getItem('usuario_actual');
    return usuario ? JSON.parse(usuario) : null;
}

function estaAutenticado() {
    return !!obtenerUsuarioActual();
}

function cerrarSesion() {
    localStorage.removeItem('usuario_actual');
    window.location.href = 'login.html';
}

// ============================================
// 2. PERMISOS POR ROL (fallback)
// ============================================

function obtenerPermisosPorRol(rol) {
    switch (rol) {
        case 'admin':
            return {
                ver: ['registros', 'salidas', 'reporteTiendas', 'eliminados', 'tiendas', 'inventario'],
                crear: ['usuarios', 'registros', 'salidas'],
                editar: ['registros', 'salidas'],
                eliminar: ['registros', 'salidas']
            };
        case 'operador':
            return {
                ver: ['registros', 'salidas', 'reporteTiendas', 'inventario'],
                crear: ['registros', 'salidas'],
                editar: ['registros', 'salidas'],
                eliminar: []
            };
        case 'visor':
        default:
            return {
                ver: ['registros', 'salidas', 'reporteTiendas', 'inventario'],
                crear: [],
                editar: [],
                eliminar: []
            };
    }
}

// ============================================
// 3. OBTENER PERMISOS DE USUARIO (personalizados o por rol)
// ============================================

async function obtenerPermisosDeUsuario(email) {
    try {
        const doc = await db.collection('usuarios').doc(email).get();
        if (!doc.exists) return null;

        const data = doc.data();
        if (data.permisos) {
            // Es permiso personalizado (booleanos)
            return {
                ver: data.permisos.ver,
                crear: data.permisos.crear,
                editar: data.permisos.editar,
                eliminar: data.permisos.eliminar
            };
        }

        // Fallback por rol
        return obtenerPermisosPorRol(data.rol);
    } catch (err) {
        console.error('Error obteniendo permisos:', err);
        return null;
    }
}

// ============================================
// 4. APLICAR PERMISOS EN LA INTERFAZ
// ============================================

async function aplicarPermisosUsuario() {
    const usuario = obtenerUsuarioActual();
    if (!usuario || !usuario.email) {
        cerrarSesion();
        return;
    }

    const permisos = await obtenerPermisosDeUsuario(usuario.email);
    if (!permisos) {
        console.error('❌ permisos es null. Usuario:', usuario, 'Doc:', await db.collection('usuarios').doc(usuario.email).get());
        alert('❌ No se pudieron cargar los permisos del usuario. Revisa la consola.');
        cerrarSesion();
        return;
    }


    // Detectar si usamos permisos personalizados (booleanos) o por rol (array)
// Detectar si usamos permisos personalizados (booleanos) o por rol (array)
const esBooleano = typeof permisos.ver === 'boolean';

// Funciones auxiliares según tipo
const puedeVer = (pestana) => (esBooleano ? permisos.ver : permisos.ver.includes(pestana));
const puedeCrear = (tipo) => (esBooleano ? permisos.crear : permisos.crear.includes(tipo));
const puedeEditar = (tipo) => (esBooleano ? permisos.editar : permisos.editar.includes(tipo));
const puedeEliminar = (tipo) => (esBooleano ? permisos.eliminar : permisos.eliminar.includes(tipo));

// Ocultar pestañas que no puede ver
const todasLasPestanas = ['registros', 'salidas', 'reporteTiendas', 'eliminados', 'tiendas', 'inventario', 'admin'];
todasLasPestanas.forEach(pestaña => {
    const pestañaElement = document.querySelector(`[data-bs-target="#${pestaña}"]`);
    if (pestañaElement && !puedeVer(pestaña)) {
        pestañaElement.closest('li').style.display = 'none';
    }
});

// Mostrar/ocultar panel de crear usuarios (solo admin)
const tabAdmin = document.getElementById('tabAdmin');
if (tabAdmin) {
    tabAdmin.style.display = usuario.rol === 'admin' ? 'block' : 'none';
}

// Ocultar botones de acción no permitidos
if (!puedeCrear('registros')) {
    const btn = document.querySelector('#formRegistro button[type="submit"]');
    if (btn) btn.style.display = 'none';
}
if (!puedeCrear('salidas')) {
    const btn = document.querySelector('#formSalida button[type="submit"]');
    if (btn) btn.style.display = 'none';
}
if (!puedeEditar('registros')) {
    document.querySelectorAll('.btnEditar').forEach(btn => btn.style.display = 'none');
}
if (!puedeEliminar('registros')) {
    document.querySelectorAll('.btnEliminar').forEach(btn => btn.style.display = 'none');
}
} // ← CIERRA BIEN LA FUNCIÓN


// ============================================
// 5. INICIALIZAR SISTEMA
// ============================================

function inicializarAuthSystem() {
    if (!estaAutenticado() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    if (window.location.pathname.includes('login.html') && estaAutenticado()) {
        window.location.href = 'index.html';
        return;
    }
}

// ============================================
// 6. CERRAR SESIÓN SEGURO (sin duplicados)
// ============================================

// Delegación global para cerrar sesión
document.addEventListener('click', e => {
    if (e.target && e.target.closest && e.target.closest('#btnCerrarSesion')) {
        e.preventDefault();
        cerrarSesion();
    }
});
// ============================================
// 7. INICIALIZAR AL CARGAR
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    inicializarAuthSystem();
    if (!window.location.pathname.includes('login.html')) {
        await aplicarPermisosUsuario();
    }
});

// ============================================
// 8. EXPORTAR GLOBALES
// ============================================

window.obtenerUsuarioActual = obtenerUsuarioActual;
window.estaAutenticado = estaAutenticado;
window.cerrarSesion = cerrarSesion;
window.obtenerPermisosDeUsuario = obtenerPermisosDeUsuario;
window.aplicarPermisosUsuario = aplicarPermisosUsuario;
window.inicializarAuthSystem = inicializarAuthSystem;