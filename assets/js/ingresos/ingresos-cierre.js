// assets/js/ingresos/ingresos-cierre.js

document.addEventListener('DOMContentLoaded', () => {
    const btnCerrar = document.getElementById('btnCerrarIngreso');
    if (!btnCerrar) return;

    btnCerrar.addEventListener('click', () => {
        mostrarModalConfirmacion({
            titulo: '¿Cerrar el ingreso actual?',
            contenido: `
        <p>Esta acción <strong>finaliza el bloque actual</strong> y no se puede deshacer.</p>
        <p>Se creará un nuevo bloque para siguientes ingresos.</p>
      `,
            textoConfirmar: 'Cerrar ingreso',
            alConfirmar: async () => {
                const ultimo = await db.collection('ingresos_cerrados')
                    .orderBy('id', 'desc')
                    .limit(1)
                    .get();

                let next = 10001;
                if (!ultimo.empty) {
                    const last = ultimo.docs[0].data().id;
                    const num = parseInt(last.slice(4));
                    next = num + 1;
                }
                const nuevoId = 'CIPL' + String(next).padStart(5, '0');

                await db.collection('ingresos_cerrados').add({
                    id: nuevoId,
                    fechaCierre: firebase.firestore.Timestamp.fromDate(new Date()),
                    cerradoPor: obtenerUsuarioActual()?.email || 'sistema'
                });

                mostrarNotificacion(`✅ Ingreso cerrado. Nuevo bloque: ${nuevoId}`, 'success');
                location.reload();
            }
        });
    });
});