import { Component, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts';
import { ProductTop } from '../../models/dashboard.models';

@Component({
  selector: 'app-top-products-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="flex flex-col items-start p-6 h-[400px] bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl transition-all duration-300">
      <div class="flex justify-between items-start w-full mb-4">
        <div class="flex flex-col gap-1">
          <h3 class="font-['Work_Sans'] font-bold text-xl text-[#111D23] dark:text-white">
            Top Productos (Alta Rotación)
          </h3>
          <p class="font-['Inter'] font-medium text-sm text-[#4C616C] dark:text-[#8A9BA8]">
            Productos con mayor movimiento
          </p>
        </div>
        <select class="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#1F1F1F] text-[#111D23] dark:text-white font-['Inter'] text-sm font-medium rounded-md px-3 py-1.5 focus:outline-none cursor-pointer">
          <option>Este mes</option>
          <option>Últimos 3 meses</option>
        </select>
      </div>
      <div class="w-full flex-1 relative">
        @if (data().length === 0) {
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <svg class="w-12 h-12 text-[#4C616C] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p class="font-['Inter'] font-medium text-sm text-[#4C616C] dark:text-[#8A9BA8]">No hay datos de productos</p>
            <p class="font-['Inter'] text-xs text-[#8A9BA8] dark:text-[#6B7D8A]">Las salidas de inventario aparecerán aquí</p>
          </div>
        } @else {
          <apx-chart
            [series]="chartSeries()"
            [chart]="chartOptions()"
            [xaxis]="xaxis()"
            [yaxis]="yaxis()"
            [stroke]="stroke()"
            [colors]="colors()"
            [plotOptions]="plotOptions()"
            [dataLabels]="dataLabels()"
            [grid]="grid()"
            [tooltip]="tooltip()"
          />
        }
      </div>
    </div>
  `
})
export class TopProductsChart {
  data = input<ProductTop[]>([]);

  chartSeries = signal<any[]>([]);
  chartOptions = signal<any>({});
  xaxis = signal<any>({});
  yaxis = signal<any>({});
  stroke = signal<any>({});
  colors = signal<string[]>(['#81000A']);
  plotOptions = signal<any>({});
  dataLabels = signal<any>({ enabled: false });
  grid = signal<any>({});
  tooltip = signal<any>({});

  constructor() {
    effect(() => {
      const products = this.data();
      if (products.length) this.buildChart(products);
    });
  }

  private buildChart(products: ProductTop[]) {
    this.chartSeries.set([
      { name: 'Movimientos', data: products.map(p => p.value) }
    ]);
    this.chartOptions.set({
      type: 'bar',
      height: '180%',
      offsetY: 5,
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
      categories: products.map(p => p.name),
      labels: { style: { colors: '#8A9BA8', fontSize: '12px', fontFamily: 'Inter' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    });
    this.yaxis.set({
      labels: { style: { colors: '#8A9BA8', fontSize: '12px', fontFamily: 'Inter' } },
      min: 0
    });
    this.stroke.set({ show: false });
    this.plotOptions.set({
      bar: {
        horizontal: false,
        columnWidth: '70%',
        borderRadius: 4,
        dataLabels: { position: 'top' }
      }
    });
    this.dataLabels.set({
      enabled: true,
      offsetY: -16,
      style: { fontSize: '12px', fontFamily: 'Inter', fontWeight: 'bold', colors: ['#8A9BA8'] }
    });
    this.grid.set({
      borderColor: 'rgba(0,0,0,0.05)',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    });
    this.tooltip.set({
      theme: 'dark',
      style: { fontSize: '12px', fontFamily: 'Inter' },
      y: { formatter: (val: number) => val + ' movimientos' }
    });
  }
}
