// js/admin-init.js - Pestaña Admin: crear usuarios + listar existentes

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCrearUsuario');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        const nombre = form.nombre.value.trim();
        const password = form.password.value.trim();
        const codigo = form.codigoInvitacion.value.trim();
        const rol = form.rol.value;

        const permisos = {
            ver: form.ver.checked,
            crear: form.crear.checked,
            editar: form.editar.checked,
            eliminar: form.eliminar.checked
        };

        if (!email || !nombre || !password || !codigo) {
            alert('❌ Completa todos los campos');
            return;
        }

        if (!validarCodigoInvitacion(codigo)) {
            alert('❌ Código de invitación inválido');
            return;
        }

        try {
            await db.collection('usuarios').doc(email).set({
                email,
                nombre,
                password: btoa(password),
                rol,
                permisos,
                activo: true,
                fechaRegistro: new Date().toISOString(),
                creadoPor: obtenerUsuarioActual().email
            });

            alert(`✅ Usuario creado: ${nombre}`);
            form.reset();
            cargarUsuariosAdmin(); // recargar tabla
        } catch (err) {
            console.error(err);
            alert('❌ Error al crear usuario');
        }
    });

    cargarUsuariosAdmin();
});

// Cargar usuarios en la tabla
async function cargarUsuariosAdmin() {
    const tbody = document.getElementById('tablaUsuariosAdmin');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="text-muted">Cargando...</td></tr>';

    try {
        const snap = await db.collection('usuarios').get();
        tbody.innerHTML = '';
        snap.forEach(doc => {
            const u = doc.data();
            tbody.innerHTML += `
  <tr>
    <td>${u.email}</td>
    <td>${u.nombre}</td>
    <td><span class="badge bg-secondary">${u.rol}</span></td>
    <td>${u.permisos?.ver ? '✅' : '❌'}</td>
    <td>${u.permisos?.crear ? '✅' : '❌'}</td>
    <td>${u.permisos?.editar ? '✅' : '❌'}</td>
    <td>${u.permisos?.eliminar ? '✅' : '❌'}</td>
    <td>${u.activo ? '✅' : '❌'}</td>
    <td>
      <button class="btn btn-sm btn-warning" onclick="abrirEditarUsuario('${u.email}')">
        ✏️
      </button>
      <button class="btn btn-sm btn-danger" onclick="toggleUsuario('${u.email}', ${!u.activo})">
        ${u.activo ? '❌' : '✅'}
      </button>
      <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuarioDefinitivo('${u.email}', '${u.nombre}')">
    🗑️
  </button>
    </td>
  </tr>`;
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="8" class="text-danger">Error al cargar usuarios</td></tr>';
    }
}
// Abrir modal con datos del usuario
async function abrirEditarUsuario(email) {
    const doc = await db.collection('usuarios').doc(email).get();
    if (!doc.exists) return;

    const u = doc.data();

    document.getElementById('emailOriginal').value = u.email;
    document.forms.formEditarUsuario.email.value = u.email;
    document.forms.formEditarUsuario.nombre.value = u.nombre;
    document.forms.formEditarUsuario.rol.value = u.rol;

    document.getElementById('editVer').checked = u.permisos?.ver || false;
    document.getElementById('editCrear').checked = u.permisos?.crear || false;
    document.getElementById('editEditar').checked = u.permisos?.editar || false;
    document.getElementById('editEliminar').checked = u.permisos?.eliminar || false;

    const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    modal.show();
}

// Guardar cambios del usuario editado
document.getElementById('formEditarUsuario')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const originalEmail = document.getElementById('emailOriginal').value;
    const nuevoEmail = e.target.email.value.trim();
    const nombre = e.target.nombre.value.trim();
    const rol = e.target.rol.value;

    const permisos = {
        ver: e.target.ver.checked,
        crear: e.target.crear.checked,
        editar: e.target.editar.checked,
        eliminar: e.target.eliminar.checked
    };

    try {
        const datos = { email: nuevoEmail, nombre, rol, permisos };

        // Si cambió el email, crear nuevo y borrar anterior
        if (originalEmail !== nuevoEmail) {
            await db.collection('usuarios').doc(nuevoEmail).set(datos);
            await db.collection('usuarios').doc(email).update({
                eliminadoPor: obtenerUsuarioActual().email,
                fechaEliminacion: new Date().toISOString()
            });
            await db.collection('usuarios').doc(originalEmail).delete();
        } else {
            await db.collection('usuarios').doc(originalEmail).update(datos);
        }

        alert('✅ Usuario actualizado');
        bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
        cargarUsuariosAdmin();
    } catch (err) {
        console.error(err);
        alert('❌ Error al actualizar usuario');
    }
});

// Activar/desactivar usuario
async function toggleUsuario(email, nuevoEstado) {
    if (!confirm(`¿${nuevoEstado ? 'Activar' : 'Desactivar'} este usuario?`)) return;

    try {
        await db.collection('usuarios').doc(email).update({ activo: nuevoEstado });
        cargarUsuariosAdmin();
    } catch (err) {
        console.error(err);
        alert('❌ Error al cambiar estado');
    }
}
// Eliminar usuario definitivamente
async function eliminarUsuarioDefinitivo(email, nombre) {
    const confirmar = confirm(`⚠️ ¿Estás seguro de ELIMINAR DEFINITIVAMENTE al usuario "${nombre}" (${email})?\n\nEsta acción no se puede deshacer.`);

    if (!confirmar) return;

    try {
        await db.collection('usuarios').doc(email).delete();
        alert(`✅ Usuario "${nombre}" eliminado definitivamente.`);
        cargarUsuariosAdmin(); // Recargar tabla
    } catch (err) {
        console.error(err);
        alert('❌ Error al eliminar usuario');
    }
    const usuarioActual = obtenerUsuarioActual();
    if (email === usuarioActual?.email) {
        alert('❌ No puedes eliminar tu propio usuario.');
        return;
    }
}