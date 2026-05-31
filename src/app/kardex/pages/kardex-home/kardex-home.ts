import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KardexApiService } from '../../services/kardex-api.service';
import { KardexDto, FiltroKardexDto } from '../../models/kardex.model';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-kardex-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex-home.html',
  styleUrl: './kardex-home.css',
})
export class KardexHome implements OnInit {
  private readonly kardexApi = inject(KardexApiService);
  private readonly ws = inject(WebSocketService);
  kardexEntries = signal<KardexDto[]>([]);
  loading = signal(false);
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  filtroProducto = signal('');
  filtroFechaDesde = signal('');
  filtroFechaHasta = signal('');
  filtroTipo = signal('');
  isExportModalOpen = signal(false);
  metodoCosto = signal<'PPP' | 'PEPS' | 'UEPS'>('PPP');

  ngOnInit(): void {
    this.cargarKardex();
    this.ws.onMovement().subscribe(() => this.cargarKardex());
  }

  cambiarMetodo(metodo: 'PPP' | 'PEPS' | 'UEPS'): void {
    this.metodoCosto.set(metodo);
    this.cargarKardex();
  }

  cargarKardex(): void {
    this.loading.set(true);
    const filtros: FiltroKardexDto = {
      pagina: this.currentPage(),
      tamanioPagina: this.pageSize(),
    };
    if (this.filtroTipo()) filtros.tipoMovimiento = this.filtroTipo();
    if (this.filtroFechaDesde()) filtros.fechaDesde = this.filtroFechaDesde();
    if (this.filtroFechaHasta()) filtros.fechaHasta = this.filtroFechaHasta();
    if (this.metodoCosto()) filtros.metodoCosto = this.metodoCosto();
    this.kardexApi.listar(filtros).subscribe({
      next: (data) => {
        this.kardexEntries.set(data.items ?? []);
        this.totalItems.set(data.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.cargarKardex();
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.cargarKardex();
    }
  }

  nextPage(): void {
    if ((this.currentPage() + 1) * this.pageSize() < this.totalItems()) {
      this.currentPage.update(p => p + 1);
      this.cargarKardex();
    }
  }

  openExportModal(): void {
    this.isExportModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeExportModal(): void {
    this.isExportModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }

  exportar(formato: 'excel' | 'pdf'): void {
    this.closeExportModal();
    this.kardexApi.exportar(formato, this.metodoCosto()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fecha = new Date().toISOString().split('T')[0];
        const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
        a.download = `kardex-${fecha}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(`Error exportando ${formato.toUpperCase()}:`, err);
        alert('No se pudo exportar. Verifica que el backend esté corriendo.');
      },
    });
  }

  getRowClass(tipo: string): string {
    const salida = tipo === 'SALIDA' || tipo === 'EGRESO' || tipo === 'AJUSTE_NEGATIVO';
    const ingreso = tipo === 'INGRESO' || tipo === 'AJUSTE_POSITIVO';
    if (salida) return 'bg-red-50 dark:bg-red-950/20';
    if (ingreso) return 'bg-green-50 dark:bg-green-950/20';
    return '';
  }

  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'INGRESO':
      case 'AJUSTE_POSITIVO':
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 'SALIDA':
      case 'EGRESO':
      case 'AJUSTE_NEGATIVO':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  }

  getCantidadClass(tipo: string, valor: number): string {
    if (tipo === 'SALIDA' && valor < 0) return 'text-[#81000A] dark:text-[#EF4444]';
    if (valor > 0) return 'text-[#34A853] dark:text-[#34A853]';
    return '';
  }
}
