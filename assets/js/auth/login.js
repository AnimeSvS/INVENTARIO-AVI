// assets/js/auth/login.js

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    if (!user || !pass) {
        alert('❌ Completa usuario y contraseña');
        return;
    }

    // Validación de usuario secreto
    if (user === 'SedySecurity' && pass === 'SedySecurity') {
        localStorage.setItem('usuario_actual', JSON.stringify({
            email: user,
            nombre: 'Administrador Master',
            rol: 'admin'
        }));
        window.location.href = 'index.html';
    } else {
        alert('❌ Usuario o contraseña incorrectos');
    }
});