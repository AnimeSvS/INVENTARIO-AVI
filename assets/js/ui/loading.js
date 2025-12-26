// assets/js/ui/loading.js

class LoadingManager {
    mostrar(mensaje = 'Cargando...') {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="mt-2">${mensaje}</div>
      </div>
    `;
        document.body.appendChild(overlay);
    }

    ocultar() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.remove();
    }
}

const loading = new LoadingManager();
window.loading = loading;