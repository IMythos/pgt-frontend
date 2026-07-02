import { Component, input, effect, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts';
import { DashboardKpi } from '../../models/dashboard.models';
import { Card } from '../../../shared/components/card/card';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, ChartComponent, Card],
  templateUrl: './kpi-card.html'})
export class KpiCard {
  kpi = input.required<DashboardKpi>();
  pulsing = signal(false);

  displayValue = signal('');

  sparklineSeries = signal<any[]>([{ data: [0] }]);
  sparklineChart = signal<any>({});
  sparklineStroke = signal<any>({});
  sparklineFill = signal<any>({});
  sparklineColors = signal<string[]>(['#81000A']);
  sparklineTooltip = signal<any>({});

  private countInterval: any;

  constructor() {
    effect(() => {
      const k = this.kpi();
      this.setupSparkline(k);
      this.animateCountUp(k);
    });
  }

  triggerPulse() {
    this.pulsing.set(true);
    setTimeout(() => this.pulsing.set(false), 1000);
  }

  updateValue(newKpi: DashboardKpi) {
    this.animateCountUp(newKpi);
    this.setupSparkline(newKpi);
    this.triggerPulse();
  }

  private setupSparkline(kpi: DashboardKpi) {
    const color = kpi.isPositive ? '#34A853' : '#EF4444';
    const data = kpi.sparkline?.length ? kpi.sparkline : [0];
    this.sparklineSeries.set([{ data }]);
    this.sparklineChart.set({
      type: 'line',
      height: 48,
      width: 96,
      sparkline: { enabled: true }
    });
    this.sparklineStroke.set({ curve: 'smooth', width: 2 });
    this.sparklineFill.set({ opacity: 1 });
    this.sparklineColors.set([color]);
    this.sparklineTooltip.set({ enabled: false });
  }

  private animateCountUp(kpi: DashboardKpi) {
    if (this.countInterval) clearInterval(this.countInterval);
    const target = kpi.value;
    const formattedTarget = kpi.formattedValue;
    const isCurrency = formattedTarget.startsWith('$');
    const parts = formattedTarget.split(' ');
    const suffix = parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '';
    const prefix = isCurrency ? '$ ' : '';
    const duration = 800;
    const steps = 30;
    let step = 0;

    this.countInterval = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const current = Math.round(target * progress);
      if (target >= 1000) {
        this.displayValue.set(prefix + current.toLocaleString() + (suffix.startsWith('K') ? 'K' : ''));
      } else {
        this.displayValue.set(prefix + current.toLocaleString() + (suffix.startsWith('K') ? 'K' : ''));
      }
      if (progress >= 1) {
        clearInterval(this.countInterval);
        this.displayValue.set(kpi.formattedValue);
      }
    }, duration / steps);
  }
}
