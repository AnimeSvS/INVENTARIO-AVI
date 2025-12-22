// js/admin-secret.js
// 🔐 USUARIO SECRETO DEL ADMINISTRADOR (solo tú sabes esto)

// Cifrado simple (puedes usar algo más fuerte si quieres)
const ADMIN_USER = btoa('SedySecurity'); // "YXZpY3UyMDI1"
const ADMIN_PASS = btoa('SedySecurity'); // "czNjcjN0MjAyNSEx"

// 🔁 Función para validar login secreto
function validarAdminSecret(usuario, password) {
    return btoa(usuario) === ADMIN_USER && btoa(password) === ADMIN_PASS;
}

// 🔐 Función para crear usuario (requiere código secreto)
function validarCodigoInvitacion(codigo) {
    const CODIGO_SECRETO = btoa('INVITE-2025-AVICRUZ'); // "SU5WSVRFLTIwMjUtQVZJQ1JVWg=="
    return btoa(codigo) === CODIGO_SECRETO;
}

// ✅ Exportar funciones
window.validarAdminSecret = validarAdminSecret;
window.validarCodigoInvitacion = validarCodigoInvitacion;