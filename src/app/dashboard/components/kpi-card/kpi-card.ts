import { Component, input, effect, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts';
import { DashboardKpi } from '../../models/dashboard.models';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="flex flex-col justify-between items-start p-6 h-[180px] bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl transition-all duration-300 hover:shadow-md relative overflow-hidden"
         [class.animate-pulse]="pulsing()">
      <div class="flex justify-between items-start w-full">
        <span class="font-['Inter'] font-bold text-xs tracking-[1px] uppercase text-[#81000A] dark:text-[#EF4444] opacity-90">
          {{ kpi().title }}
        </span>
        <div class="flex justify-center items-center w-10 h-10 rounded-full bg-[rgba(129,0,10,0.05)] dark:bg-[rgba(239,68,68,0.1)] transition-colors shrink-0">
          @switch (kpi().icon) {
            @case ('box') {
              <svg class="w-5 h-5 text-[#81000A] dark:text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            }
            @case ('clipboard') {
              <svg class="w-5 h-5 text-[#81000A] dark:text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
            }
            @case ('alert') {
              <svg class="w-5 h-5 text-[#81000A] dark:text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            }
            @case ('dollar') {
              <svg class="w-5 h-5 text-[#81000A] dark:text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          }
        </div>
      </div>

      <div class="flex items-end justify-between w-full gap-2">
        <div class="flex flex-col gap-1">
          <span class="font-['Work_Sans'] font-bold text-[40px] leading-none text-[#111D23] dark:text-white transition-all duration-500">
            {{ displayValue() }}
          </span>
          <div class="flex items-center gap-1.5 mt-1">
            <svg class="w-4 h-4" [class.text-[#34A853]]="kpi().isPositive" [class.text-[#EF4444]]="!kpi().isPositive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (kpi().isPositive) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              }
            </svg>
            <span class="font-['Inter'] font-bold text-xs" [class.text-[#34A853]]="kpi().isPositive" [class.text-[#EF4444]]="!kpi().isPositive">
              {{ kpi().trendLabel }}
            </span>
          </div>
        </div>
        <div class="w-24 h-12 shrink-0">
          <apx-chart
            [series]="sparklineSeries()"
            [chart]="sparklineChart()"
            [stroke]="sparklineStroke()"
            [fill]="sparklineFill()"
            [colors]="sparklineColors()"
            [tooltip]="sparklineTooltip()"
          />
        </div>
      </div>
    </div>
  `
})
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
    this.sparklineSeries.set([{ data: kpi.sparkline }]);
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
