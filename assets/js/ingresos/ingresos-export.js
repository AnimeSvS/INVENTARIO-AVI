// assets/js/ingresos/ingresos-export.js

function exportarIngresosExcel() {
    const tabla = document.getElementById('tablaIngresos');
    if (tabla.rows.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(tabla.closest('table'));

    XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `ingresos_${fecha}.xlsx`);
}