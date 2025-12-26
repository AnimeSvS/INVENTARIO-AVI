// assets/js/utils/formatters.js
// ✅ Fecha/hora de Perú (GMT-5) sin importar la zona del navegador o servidor
function obtenerFechaPeru() {
    const ahoraUTC = new Date();
    const offsetPeru = -5 * 60; // GMT-5 en minutos
    const peruTime = new Date(ahoraUTC.getTime() + (ahoraUTC.getTimezoneOffset() + offsetPeru) * 60000);
    return peruTime;
}

// ✅ Formatear como YYYY-MM-DD (para filtros de fecha)
function formatearFechaPeruISO(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatearFecha(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Fecha inválida';
    return timestamp.toDate().toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatearID(num) {
    return 'PLIP' + String(num).padStart(5, '0');
}

function formatearIDSalida(num) {
    return 'PLSP' + String(num).padStart(5, '0');
}

function calcular(cj, pj, pb, pesoJaba) {
    const totalJ = pesoJaba * cj;
    const cPollos = cj * pj;
    const neto = pb - totalJ;
    const prom = neto / cPollos;
    return { totalJ, cPollos, neto, prom };
}