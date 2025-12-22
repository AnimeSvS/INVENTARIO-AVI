// js/offline-auth.js
// 🔐 Login con usuarios creados manualmente

async function loginOffline(email, password) {
    if (!email || !password) {
        alert('Completa email y contraseña');
        return;
    }

    try {
        const doc = await db.collection('usuarios').doc(email).get();

        if (!doc.exists) {
            alert('❌ Usuario no encontrado');
            return;
        }

        const usuario = doc.data();

        // 🔐 Validar contraseña (cifrada)
        if (usuario.password !== btoa(password)) {
            alert('❌ Contraseña incorrecta');
            return;
        }

        if (!usuario.activo) {
            alert('❌ Usuario desactivado');
            return;
        }

        // ✅ Login exitoso
        localStorage.setItem('usuario_actual', JSON.stringify({
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol
        }));

        alert(`✅ Bienvenido, ${usuario.nombre}`);
        window.location.href = 'index.html';

    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
}

// ✅ Exportar
window.loginOffline = loginOffline;