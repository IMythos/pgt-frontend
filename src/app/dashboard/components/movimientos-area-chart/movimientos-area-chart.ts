import { Component, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts';
import { MovementPoint } from '../../models/dashboard.models';

@Component({
  selector: 'app-movimientos-area-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="flex flex-col items-start p-6 bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl transition-all duration-300">
      <div class="flex justify-between items-start w-full mb-4">
        <div class="flex flex-col gap-1">
          <h3 class="font-['Work_Sans'] font-bold text-xl text-[#111D23] dark:text-white">
            Movimientos por Tiempo
          </h3>
          <p class="font-['Inter'] font-medium text-sm text-[#4C616C] dark:text-[#8A9BA8]">
            Ingresos, salidas y ajustes registrados
          </p>
        </div>
      </div>
      <div class="w-full flex-1">
        <apx-chart
          [series]="chartSeries()"
          [chart]="chartOptions()"
          [xaxis]="xaxis()"
          [yaxis]="yaxis()"
          [stroke]="stroke()"
          [fill]="fill()"
          [colors]="colors()"
          [legend]="legend()"
          [dataLabels]="dataLabels()"
          [grid]="grid()"
          [tooltip]="tooltip()"
        />
      </div>
    </div>
  `
})
export class MovimientosAreaChart {
  data = input<MovementPoint[]>([]);

  chartSeries = signal<any[]>([]);
  chartOptions = signal<any>({});
  xaxis = signal<any>({});
  yaxis = signal<any>({});
  stroke = signal<any>({});
  fill = signal<any>({});
  colors = signal<string[]>(['#34A853', '#81000A', '#F5A623']);
  legend = signal<any>({});
  dataLabels = signal<any>({ enabled: false });
  grid = signal<any>({});
  tooltip = signal<any>({});

  constructor() {
    effect(() => {
      const pts = this.data();
      if (pts.length) this.buildChart(pts);
    });
  }

  private buildChart(pts: MovementPoint[]) {
    this.chartSeries.set([
      { name: 'Ingresos', data: pts.map(p => p.ingresos) },
      { name: 'Salidas', data: pts.map(p => p.salidas) },
      { name: 'Ajustes', data: pts.map(p => p.ajustes) }
    ]);
    this.chartOptions.set({
      type: 'area',
      height: '100%',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      },
      zoom: { enabled: false },
      toolbar: { show: false }
    });
    this.xaxis.set({
      categories: pts.map(p => p.label),
      labels: { style: { colors: '#8A9BA8', fontSize: '12px', fontFamily: 'Inter' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    });
    this.yaxis.set({
      labels: { style: { colors: '#8A9BA8', fontSize: '12px', fontFamily: 'Inter' } },
      min: 0
    });
    this.stroke.set({ curve: 'smooth', width: 2 });
    this.fill.set({
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    });
    this.legend.set({
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#8A9BA8', useSeriesColors: false },
      markers: { width: 8, height: 8, radius: 4 },
      fontSize: '12px',
      fontFamily: 'Inter',
      itemMargin: { horizontal: 10 }
    });
    this.grid.set({
      borderColor: 'rgba(0,0,0,0.05)',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    });
    this.tooltip.set({
      theme: 'dark',
      style: { fontSize: '12px', fontFamily: 'Inter' }
    });
  }
}
