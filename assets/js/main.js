// assets/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
    actualizarFooter();
    aplicarPermisosUsuario(); // desde auth-system.js

    // Cargar pestañas dinámicamente
    document.querySelectorAll('#tabMenu button[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const target = e.target.getAttribute('data-bs-target');
            switch (target) {
                case '#salidas':
                    cargarSalidasDesdeUltimoCierre();
                    break;
                case '#inventario':
                    cargarInventarioGeneral();
                    break;
                // case '#reporteTiendas':
                //     generarReporteTiendas();
                //     break;
                case '#eliminados':
                    cargarEliminados();
                    break;
                case '#analitica':
                    cargarAnalitica();
                    break;
                case '#admin':
                    cargarUsuariosAdmin();
                    break;
            }
        });
    });
});
// Agrega al final de main.js
window.abrirModalEditarSalida = abrirModalEditarSalida;
window.abrirModalEditarIngreso = abrirModalEditarIngreso;