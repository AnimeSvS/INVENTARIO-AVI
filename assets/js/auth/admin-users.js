// assets/js/auth/admin-users.js

document.addEventListener('DOMContentLoaded', () => {
    const user = obtenerUsuarioActual();
    if (!user || user.rol !== 'admin') return;

    const adminTab = document.getElementById('tabAdmin');
    if (adminTab) adminTab.classList.remove('d-none');

    cargarPanelAdmin();
});

async function cargarPanelAdmin() {
    const container = document.getElementById('admin');
    container.innerHTML = `
    <div class="card p-4">
      <h4 class="text-danger mb-4"><i class="fas fa-users-cog"></i> Panel de Administración</h4>
      <form id="formCrearUsuario" class="row g-3 needs-validation" novalidate>
        <div class="col-md-3">
          <label class="form-label">Email</label>
          <input type="email" name="email" class="form-control" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">Nombre</label>
          <input type="text" name="nombre" class="form-control" required>
        </div>
        <div class="col-md-2">
          <label class="form-label">Contraseña</label>
          <input type="password" name="password" class="form-control" required>
        </div>
        <div class="col-md-2">
          <label class="form-label">Código de Invitación</label>
          <input type="text" name="codigoInvitacion" class="form-control" placeholder="INVITE-2025-AVICRUZ" required>
        </div>
        <div class="col-md-2">
          <label class="form-label">Rol</label>
          <select name="rol" class="form-select" required>
            <option value="operador">Operador</option>
            <option value="visor">Visor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="col-12">
          <h6>Permisos:</h6>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="ver" checked>
            <label class="form-check-label">Ver</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="crear">
            <label class="form-check-label">Crear</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="editar">
            <label class="form-check-label">Editar</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" name="eliminar">
            <label class="form-check-label">Eliminar</label>
          </div>
        </div>
        <div class="col-12 text-end">
          <button type="submit" class="btn btn-primary">Crear Usuario</button>
        </div>
      </form>

      <hr class="my-4">
      <h5>Usuarios Registrados</h5>
      <div class="table-responsive">
        <table class="table table-sm table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Ver</th>
              <th>Crear</th>
              <th>Editar</th>
              <th>Eliminar</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tablaUsuariosAdmin"></tbody>
        </table>
      </div>
    </div>
  `;

    document.getElementById('formCrearUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = e.target.email.value.trim();
        const nombre = e.target.nombre.value.trim();
        const password = e.target.password.value.trim();
        const codigo = e.target.codigoInvitacion.value.trim();
        const rol = e.target.rol.value;

        const permisos = {
            ver: e.target.ver.checked,
            crear: e.target.crear.checked,
            editar: e.target.editar.checked,
            eliminar: e.target.eliminar.checked
        };

        if (!email || !nombre || !password || !codigo) {
            alert('❌ Completa todos los campos');
            return;
        }

        if (codigo !== 'INVITE-2025-AVICRUZ') {
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
                creadoPor: obtenerUsuarioActual()?.email || 'admin'
            });

            alert(`✅ Usuario creado: ${nombre}`);
            e.target.reset();
            cargarUsuariosAdmin();
        } catch (err) {
            console.error(err);
            alert('❌ Error al crear usuario');
        }
    });

    cargarUsuariosAdmin();
}

async function cargarUsuariosAdmin() {
    const tbody = document.getElementById('tablaUsuariosAdmin');
    tbody.innerHTML = '<tr><td colspan="9" class="text-muted">Cargando...</td></tr>';

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
            <button class="btn btn-sm btn-warning" onclick="toggleUsuario('${u.email}', ${!u.activo})">
              ${u.activo ? 'Desactivar' : 'Activar'}
            </button>
          </td>
        </tr>
      `;
        });
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="9" class="text-danger">Error al cargar usuarios</td></tr>';
    }
}

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