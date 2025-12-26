// assets/js/inventario/inventario-stock.js - FUNCIONES DE STOCK

/**
 * Obtiene el stock actual de pollo vivo
 */
async function obtenerStockActual() {
    try {
        const doc = await db.collection('stock').doc('POLLO_VIVO').get();

        if (!doc.exists) {
            console.log('⚠️ Documento de stock no existe, creando uno...');
            await db.collection('stock').doc('POLLO_VIVO').set({
                cantidadPollos: 0,
                pesoNeto: 0,
                ultimaActualizacion: firebase.firestore.Timestamp.now()
            });
            return { cantidadPollos: 0, pesoNeto: 0 };
        }

        return doc.data();
    } catch (error) {
        console.error('❌ Error al obtener stock:', error);
        return { cantidadPollos: 0, pesoNeto: 0 };
    }
}

/**
 * Suma al stock (cuando llegan ingresos o devoluciones)
 */
async function sumarStock(pollos, kilos) {
    try {
        console.log(`➕ Sumando al stock: ${pollos} pollos, ${kilos} kg`);

        const ref = db.collection('stock').doc('POLLO_VIVO');
        const doc = await ref.get();

        if (!doc.exists) {
            await ref.set({
                cantidadPollos: pollos,
                pesoNeto: kilos,
                ultimaActualizacion: firebase.firestore.Timestamp.now()
            });
            console.log('✅ Stock creado y actualizado');
        } else {
            await ref.update({
                cantidadPollos: firebase.firestore.FieldValue.increment(pollos),
                pesoNeto: firebase.firestore.FieldValue.increment(kilos),
                ultimaActualizacion: firebase.firestore.Timestamp.now()
            });
            console.log('✅ Stock actualizado');
        }
    } catch (error) {
        console.error('❌ Error al sumar stock:', error);
        throw error;
    }
}

/**
 * Resta del stock (cuando hay salidas o se eliminan devoluciones)
 */
async function restarStock(pollos, kilos) {
    try {
        console.log(`➖ Restando del stock: ${pollos} pollos, ${kilos} kg`);

        const ref = db.collection('stock').doc('POLLO_VIVO');
        const doc = await ref.get();

        if (!doc.exists) {
            await ref.set({
                cantidadPollos: -pollos,
                pesoNeto: -kilos,
                ultimaActualizacion: firebase.firestore.Timestamp.now()
            });
            console.log('✅ Stock creado en negativo');
        } else {
            await ref.update({
                cantidadPollos: firebase.firestore.FieldValue.increment(-pollos),
                pesoNeto: firebase.firestore.FieldValue.increment(-kilos),
                ultimaActualizacion: firebase.firestore.Timestamp.now()
            });
            console.log('✅ Stock reducido');
        }
    } catch (error) {
        console.error('❌ Error al restar stock:', error);
        throw error;
    }
}

// Hacer funciones globales
window.sumarStock = sumarStock;
window.restarStock = restarStock;
window.obtenerStockActual = obtenerStockActual;