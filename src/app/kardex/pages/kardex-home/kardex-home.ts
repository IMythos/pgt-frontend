import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KardexApiService } from '../../services/kardex-api.service';
import { KardexDto, FiltroKardexDto } from '../../models/kardex.model';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-kardex-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex-home.html',
  styleUrl: './kardex-home.css'
})
export class KardexHome implements OnInit {
  private readonly kardexApi = inject(KardexApiService);
  private readonly ws = inject(WebSocketService);
  kardexEntries = signal<KardexDto[]>([]);
  loading = signal(false);
  filtroProducto = signal('');
  filtroFechaDesde = signal('');
  filtroFechaHasta = signal('');
  filtroTipo = signal('');
  isExportModalOpen = signal(false);
  ngOnInit(): void {
    this.cargarKardex();
    this.ws.onMovement().subscribe(() => this.cargarKardex());
  }

  cargarKardex(): void {
    this.loading.set(true);
    const filtros: FiltroKardexDto = {};
    if (this.filtroTipo()) filtros.tipoMovimiento = this.filtroTipo();
    if (this.filtroFechaDesde()) filtros.fechaDesde = this.filtroFechaDesde();
    if (this.filtroFechaHasta()) filtros.fechaHasta = this.filtroFechaHasta();
    this.kardexApi.listar(filtros).subscribe({
      next: (data) => {
        this.kardexEntries.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
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
    this.kardexApi.exportar(formato).subscribe({
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

  getBadgeClass(tipo: string): string {
    switch(tipo) {
      case 'INGRESO':
        return 'bg-[rgba(129,0,10,0.08)] dark:bg-[rgba(226,190,186,0.15)] text-[#81000A] dark:text-[#E2BEBA]';
      case 'SALIDA':
        return 'border border-[#81000A] text-[#81000A] dark:border-[#E2BEBA] dark:text-[#E2BEBA]';
      case 'AJUSTE':
        return 'bg-gray-100 dark:bg-[#313131] text-[#4C616C] dark:text-[#8A9BA8]';
      default:
        return 'bg-gray-100 dark:bg-[#313131] text-[#4C616C] dark:text-[#8A9BA8]';
    }
  }

  getCantidadClass(tipo: string, valor: number): string {
    if (tipo === 'INGRESO' && valor > 0) return 'text-[#34A853]';
    if (tipo === 'SALIDA' && valor > 0) return 'text-[#81000A] dark:text-[#E2BEBA]';
    if (valor > 0) return 'text-[#34A853]';
    return '';
  }
}