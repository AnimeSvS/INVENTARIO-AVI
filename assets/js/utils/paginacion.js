// assets/js/utils/paginacion.js

class Paginacion {
    constructor(tbodyId, pageSize = 10) {
        this.tbody = document.getElementById(tbodyId);
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.data = [];
        this.filteredData = [];
    }

    setData(data) {
        this.data = data;
        this.filteredData = [...data];
        this.currentPage = 1;
        this.render();
    }

    filter(predicate) {
        this.filteredData = this.data.filter(predicate);
        this.currentPage = 1;
        this.render();
    }

    render() {
        if (!this.tbody) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        this.tbody.innerHTML = '';

        if (pageData.length === 0) {
            this.tbody.innerHTML = '<tr><td colspan="20" class="text-muted">No hay datos</td></tr>';
            this.renderPagination();
            return;
        }

        pageData.forEach((item, index) => {
            const row = this.createRow(item, start + index);
            this.tbody.appendChild(row);
        });

        this.renderPagination();
    }

    createRow(item, index) {
        const row = document.createElement('tr');
        row.style.animation = `fadeInRow 0.3s ease ${index * 0.05}s both`;
        // Override this method in subclasses
        return row;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const btnPrev = document.getElementById('btnPaginaAnterior' + this.tbody.id.replace('tabla', ''));
        const btnNext = document.getElementById('btnPaginaSiguiente' + this.tbody.id.replace('tabla', ''));

        if (btnPrev) btnPrev.disabled = this.currentPage === 1;
        if (btnNext) btnNext.disabled = this.currentPage === totalPages;
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.render();
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.render();
        }
    }
}

// Ejemplo de uso para ingresos
class PaginacionIngresos extends Paginacion {
    constructor() {
        super('tablaIngresos', 10);
    }

    createRow(item, index) {
        const pesoJaba = item.pesoJaba || 0;
        const { totalJ, cPollos, neto, prom } = calcular(item.cantidadJabas, item.pollosPorJaba, item.pesoBruto, pesoJaba);

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${item.id}</td>
      <td>${formatearFecha(item.fecha)}</td>
      <td>${item.producto}</td>
      <td>${item.cantidadJabas}</td>
      <td>${pesoJaba.toFixed(2)} KG</td>
      <td>${totalJ.toFixed(2)} KG</td>
      <td>${item.pollosPorJaba}</td>
      <td>${cPollos}</td>
      <td>${item.pesoBruto.toFixed(2)} KG</td>
      <td>${neto.toFixed(2)} KG</td>
      <td>${prom.toFixed(3)} KG</td>
      <td>
        <button class="btn btn-warning btn-sm btn-editar" data-id="${item.id}" data-tipo="ingreso">✏️</button>
      </td>
      <td>
        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${item.id}" data-tipo="ingreso">🗑️</button>
      </td>
    `;
        return row;
    }
}

// Instanciar
const paginacionIngresos = new PaginacionIngresos();
window.paginacionIngresos = paginacionIngresos;

// Eventos de paginación
document.addEventListener('DOMContentLoaded', () => {
    const btnPrev = document.getElementById('btnPaginaAnteriorIngresos');
    const btnNext = document.getElementById('btnPaginaSiguienteIngresos');

    if (btnPrev) btnPrev.addEventListener('click', () => paginacionIngresos.previousPage());
    if (btnNext) btnNext.addEventListener('click', () => paginacionIngresos.nextPage());
});