// assets/js/ui/animations.js

// Animación de entrada para cards
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.5s ease-out';
                entry.target.style.opacity = '1';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
});

// Animación de filas de tabla
function animarFilas(tablaId) {
    const filas = document.querySelectorAll(`#${tablaId} tr`);
    filas.forEach((fila, index) => {
        fila.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;
    });
}