// assets/js/auth/auth-system.js

function obtenerUsuarioActual() {
    const usuario = localStorage.getItem('usuario_actual');
    return usuario ? JSON.parse(usuario) : null;
}

async function aplicarPermisosUsuario() {
    const user = obtenerUsuarioActual();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userName').textContent = user.nombre;

    if (user.rol === 'admin') {
        document.getElementById('tabAdmin').classList.remove('d-none');
    }

    // Ocultar botones según permisos
    const doc = await db.collection('usuarios').doc(user.email).get();
    if (!doc.exists) return;

    const permisos = doc.data().permisos || {};

    if (!permisos.crear) {
        document.querySelectorAll('#formIngresos button[type="submit"], #formSalidas button[type="submit"]').forEach(btn => btn.style.display = 'none');
    }
    if (!permisos.editar) {
        document.querySelectorAll('.btn-editar').forEach(btn => btn.style.display = 'none');
    }
    if (!permisos.eliminar) {
        document.querySelectorAll('.btn-eliminar').forEach(btn => btn.style.display = 'none');
    }
}

document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    localStorage.removeItem('usuario_actual');
    window.location.href = 'login.html';
});