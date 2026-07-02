import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockAlert } from '../../models/dashboard.models';
import { Modal } from '../../../shared/components/modal/modal';
import { ModalHeader } from '../../../shared/components/modal-header/modal-header';

type FilterTab = 'TODAS' | 'CRITICAS' | 'BAJAS';

@Component({
  selector: 'app-stock-alerts-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, ModalHeader],
  templateUrl: './stock-alerts-modal.html',
  styleUrl: './stock-alerts-modal.css'
})
export class StockAlertsModal {
  alerts = input<StockAlert[]>([]);
  loading = input(false);
  close = output<void>();

  searchQuery = signal('');
  activeFilter = signal<FilterTab>('TODAS');

  tabs = computed(() => [
    { value: 'TODAS' as FilterTab, label: 'Todas', count: this.alerts().length },
    { value: 'CRITICAS' as FilterTab, label: 'Críticas', count: this.alerts().filter(a => a.status === 'Crítico').length },
    { value: 'BAJAS' as FilterTab, label: 'Bajas', count: this.alerts().filter(a => a.status === 'Bajo').length },
  ]);

  totalCriticalCount = computed(() => this.alerts().filter(a => a.status === 'Crítico').length);
  totalLowCount = computed(() => this.alerts().filter(a => a.status === 'Bajo').length);

  filteredAlerts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.activeFilter();

    let result = this.alerts();

    if (filter === 'CRITICAS') {
      result = result.filter(a => a.status === 'Crítico');
    } else if (filter === 'BAJAS') {
      result = result.filter(a => a.status === 'Bajo');
    }

    if (query) {
      result = result.filter(a =>
        a.sku.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query)
      );
    }

    return result;
  });

  stockBarPercent(alert: StockAlert): number {
    if (alert.stock <= 0) return 0;
    return alert.status === 'Crítico' ? Math.min(alert.stock, 100) : Math.min(alert.stock, 100);
  }

  stockBarClass(alert: StockAlert): string {
    if (alert.stock <= 0) return 'bg-[#81000A] dark:bg-[#EF4444]';
    if (alert.status === 'Crítico') return 'bg-[#81000A] dark:bg-[#EF4444]';
    return 'bg-[#F5A623]';
  }

  formatCost(value: number): string {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
