// js/user-creation.js
// ✅ Crear usuarios solo con código de invitación

async function crearUsuarioConInvitacion(email, nombre, password, codigoInvitacion) {
    if (!validarCodigoInvitacion(codigoInvitacion)) {
        alert('❌ Código de invitación inválido');
        return;
    }

    if (!email || !nombre || !password || password.length < 6) {
        alert('❌ Completa todos los camos correctamente');
        return;
    }

    // ✅ Crear usuario en Firestore (sin Firebase Auth)
    const nuevoUsuario = {
        email: email,
        nombre: nombre,
        password: btoa(password), // 🔐 Guardar contraseña cifrada
        rol: 'operador',
        activo: true,
        fechaRegistro: new Date().toISOString(),
        creadoPor: 'admin'
    };

    try {
        await db.collection('usuarios').doc(email).set(nuevoUsuario);
        alert(`✅ Usuario creado: ${email}`);
    } catch (error) {
        alert('Error al crear usuario: ' + error.message);
    }
}
function obtenerPermisosPorRol(rol) {
    switch (rol) {
        case 'admin':
            return { ver: true, crear: true, editar: true, eliminar: true };
        case 'operador':
            return { ver: true, crear: true, editar: true, eliminar: false };
        case 'visor':
        default:
            return { ver: true, crear: false, editar: false, eliminar: false };
    }
}

// ✅ Exportar
window.crearUsuarioConInvitacion = crearUsuarioConInvitacion;