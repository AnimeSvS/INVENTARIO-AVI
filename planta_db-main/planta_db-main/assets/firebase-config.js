// assets/firebase-config.js
// CONFIGURACIÓN CORREGIDA

const firebaseConfig = {
    apiKey: "AIzaSyC89hbHrHZW6-wqzEb4b0JfPbuqK5xjTqA",
    authDomain: "navidad-98236.firebaseapp.com",
    projectId: "navidad-98236",
    storageBucket: "navidad-98236.firebasestorage.app",
    messagingSenderId: "970059975348",
    appId: "1:970059975348:web:fa4ee3da24be222af965e1",
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

// Exportar referencias con verificación
const db = firebase.firestore ? firebase.firestore() : null;
const auth = firebase.auth ? firebase.auth() : null;

if (!db) {
    console.error('❌ Firestore no está disponible');
}

if (!auth) {
    console.warn('⚠️ Auth no está disponible (puede ser normal si no lo necesitas)');
}

// Hacer disponibles globalmente
window.db = db;
window.auth = auth;
window.firebase = firebase;



// Cargar datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM listo, cargando datos...');

    // Verificar que Firebase esté funcionando
    if (db) {
        console.log('✅ Firestore listo');
    } else {
        console.error('❌ Firestore no disponible');
    }

    if (auth) {
        console.log('✅ Auth listo');
    }
});
if (db) {
    db.settings({
        experimentalForceLongPolling: true
    });
}

// Configurar persistencia
// Persistencia offline
if (db && db.enablePersistence) {
    db.enablePersistence()
        .then(() => console.log('✅ Persistencia habilitada'))
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Múltiples pestañas abiertas');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Persistencia no soportada');
            }
        });
}
