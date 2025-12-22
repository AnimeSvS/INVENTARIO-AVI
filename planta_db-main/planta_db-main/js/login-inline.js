document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    if (!user || !pass) {
        alert('❌ Completa los campos');
        return;
    }

    // 🔐 ¿Es admin?
    if (validarAdminSecret(user, pass)) {
        localStorage.setItem('usuario_actual', JSON.stringify({
            email: 'admin@avicruz.com',
            nombre: 'Administrador',
            rol: 'admin'
        }));

        alert('✅ Bienvenido Administrador');
        window.location.href = 'index.html';
        return;
    }

    // 👤 Si NO es admin → login normal
    await loginOffline(user, pass);
});
