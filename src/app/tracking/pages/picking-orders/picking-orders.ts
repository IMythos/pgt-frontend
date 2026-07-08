import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PickingApiService } from '../../services/picking-api.service';
import { PickingOrder } from '../../models/picking.model';
import { Pagination } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-picking-orders',
  imports: [CommonModule, RouterModule, Pagination],
  templateUrl: './picking-orders.html',
})
export class PickingOrders implements OnInit {
  private readonly pickingApi = inject(PickingApiService);

  orders = signal<PickingOrder[]>([]);
  loading = signal(true);
  activeTab = signal<string>('TODAS');
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    const estado = this.activeTab() === 'TODAS' ? undefined : this.activeTab();
    this.pickingApi.listar(estado, this.currentPage(), this.pageSize()).subscribe({
      next: (data) => {
        this.orders.set(data.items ?? []);
        this.totalItems.set(data.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar órdenes de picking:', err);
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.cargar();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.cargar();
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.currentPage.set(0);
    this.cargar();
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'text-[#F5A623] bg-[#FEF3C7] dark:bg-[rgba(245,166,35,0.15)]';
      case 'EN_PROCESO':
        return 'text-[#3B82F6] bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.15)]';
      case 'COMPLETADO':
        return 'text-[#34A853] bg-[#D1FAE5] dark:bg-[rgba(52,168,83,0.15)]';
      case 'CANCELADO':
        return 'text-[#6B7280] bg-[#F3F4F6] dark:bg-[rgba(107,114,128,0.15)]';
      default:
        return 'text-[#4C616C] bg-gray-100 dark:bg-[#1F1F1F]';
    }
  }

  tipoClass(tipo: string | undefined): string {
    switch (tipo) {
      case 'TRANSFERENCIA':
        return 'text-[#3B82F6] bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.15)]';
      case 'NOTA_CREDITO':
        return 'text-[#8B5CF6] bg-[#EDE9FE] dark:bg-[rgba(139,92,246,0.15)]';
      default:
        return 'text-[#34A853] bg-[#D1FAE5] dark:bg-[rgba(52,168,83,0.15)]';
    }
  }

  fechaFormateada(fecha: string | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
