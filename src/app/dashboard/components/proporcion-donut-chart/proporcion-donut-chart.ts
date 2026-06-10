import { Component, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from 'ng-apexcharts';
import { TipoProporcion } from '../../models/dashboard.models';

@Component({
  selector: 'app-proporcion-donut-chart',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="flex flex-col p-4 h-[268px] bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl transition-all duration-300">
      <div class="flex flex-col gap-0 w-full mb-2 shrink-0">
        <h3 class="font-['Work_Sans'] font-bold text-xl text-[#111D23] dark:text-white">
          Proporción por Tipo
        </h3>
        <p class="font-['Inter'] font-medium text-sm text-[#4C616C] dark:text-[#8A9BA8]">
          Distribución de movimientos por categoría
        </p>
      </div>
      <div class="w-full flex-1 flex items-center justify-center">
        <apx-chart
          [series]="chartSeries()"
          [chart]="chartOptions()"
          [labels]="labels()"
          [colors]="colors()"
          [legend]="legend()"
          [dataLabels]="dataLabels()"
          [plotOptions]="plotOptions()"
          [stroke]="stroke()"
          [tooltip]="tooltip()"
          [responsive]="responsive()"
        />
      </div>
    </div>
  `
})
export class ProporcionDonutChart {
  data = input<TipoProporcion[]>([]);

  chartSeries = signal<number[]>([]);
  chartOptions = signal<any>({});
  labels = signal<string[]>([]);
  colors = signal<string[]>([]);
  legend = signal<any>({});
  dataLabels = signal<any>({});
  plotOptions = signal<any>({});
  stroke = signal<any>({});
  tooltip = signal<any>({});
  responsive = signal<any[]>([]);

  constructor() {
    effect(() => {
      const pts = this.data();
      if (pts.length) this.buildChart(pts);
    });
  }

  private buildChart(pts: TipoProporcion[]) {
    this.chartSeries.set(pts.map(p => p.value));
    this.labels.set(pts.map(p => p.label));
    this.colors.set(pts.map(p => p.color));
    this.chartOptions.set({
      type: 'donut',
      height: '180%',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      },
      toolbar: { show: false }
    });
    this.legend.set({
      position: 'right',
      horizontalAlign: 'center',
      labels: { colors: '#8A9BA8' },
      markers: { width: 8, height: 8, radius: 2 },
      fontSize: '11px',
      fontFamily: 'Inter',
      fontWeight: 200,
      itemMargin: { horizontal: 6, vertical: 0 },
      offsetY: 10
    });
    this.dataLabels.set({
      enabled: true,
      style: { fontSize: '13px', fontFamily: 'Inter', fontWeight: 'bold', colors: ['#fff'] },
      dropShadow: { enabled: false },
      formatter: function (val: number) { return Math.round(val) + '%'; }
    });
    this.plotOptions.set({
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontFamily: 'Inter',
              fontWeight: 700,
              color: '#8A9BA8',
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
              }
            }
          }
        }
      }
    });
    this.stroke.set({
      show: true,
      width: 2,
      colors: ['#ffffff']
    });
    this.tooltip.set({
      theme: 'dark',
      style: { fontSize: '12px', fontFamily: 'Inter' },
      y: { formatter: (val: number) => val + ' movimientos' }
    });
    this.responsive.set([{
      breakpoint: 1024,
      options: {
        legend: { position: 'bottom', fontSize: '10px', offsetY: 0 },
        plotOptions: {
          pie: {
            donut: {
              size: '55%'
            }
          }
        }
      }
    }]);
  }
}
