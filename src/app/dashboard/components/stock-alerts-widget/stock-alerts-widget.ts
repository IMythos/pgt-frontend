import { Component, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockAlert } from '../../models/dashboard.models';
import { StockAlertsModal } from '../stock-alerts-modal/stock-alerts-modal';
import { Card } from '../../../shared/components/card/card';

@Component({
  selector: 'app-stock-alerts-widget',
  standalone: true,
  imports: [CommonModule, StockAlertsModal, Card],
  templateUrl: './stock-alerts-widget.html',
  styleUrl: './stock-alerts-widget.css'})
export class StockAlertsWidget {
  data = input<StockAlert[]>([]);
  loaded = signal(false);
  showModal = signal(false);

  newAlertSku = signal<string | null>(null);

  constructor() {
    effect(() => {
      const alerts = this.data();
      if (alerts.length && !this.loaded()) {
        setTimeout(() => this.loaded.set(true), 500);
      }
    });
  }

  addAlert(alert: StockAlert) {
    this.newAlertSku.set(alert.sku);
    setTimeout(() => this.newAlertSku.set(null), 4500);
  }
}
