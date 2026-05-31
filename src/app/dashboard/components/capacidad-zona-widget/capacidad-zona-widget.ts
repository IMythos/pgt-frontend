import { Component, input, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZoneCapacity } from '../../models/dashboard.models';

@Component({
  selector: 'app-capacidad-zona-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col p-6 w-full h-[404px] bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl transition-all duration-300">
      <div class="flex justify-between items-center w-full mb-5 shrink-0">
        <h3 class="font-['Work_Sans'] font-bold text-xl text-[#111D23] dark:text-white">
          Capacidad
        </h3>
        <div class="flex bg-gray-100 dark:bg-[#1F1F1F] rounded-lg p-0.5">
          <button (click)="viewMode.set('zona')"
            class="px-3 py-1.5 font-['Inter'] font-semibold text-xs rounded-md transition-all cursor-pointer"
            [ngClass]="viewMode() === 'zona'
              ? 'bg-white dark:bg-[#0A0A0A] text-[#81000A] dark:text-[#EF4444] shadow-sm'
              : 'text-[#4C616C] dark:text-[#8A9BA8] hover:text-[#111D23] dark:hover:text-white'">
            Por Zona
          </button>
          <button (click)="viewMode.set('general')"
            class="px-3 py-1.5 font-['Inter'] font-semibold text-xs rounded-md transition-all cursor-pointer"
            [ngClass]="viewMode() === 'general'
              ? 'bg-white dark:bg-[#0A0A0A] text-[#81000A] dark:text-[#EF4444] shadow-sm'
              : 'text-[#4C616C] dark:text-[#8A9BA8] hover:text-[#111D23] dark:hover:text-white'">
            General
          </button>
        </div>
      </div>

      @if (viewMode() === 'zona') {
        <div class="flex flex-col gap-4 w-full flex-1 overflow-y-auto pr-2">
          @for (zone of data(); track zone.zone; let i = $index) {
            <div class="flex flex-col gap-1.5 transition-all duration-300"
                 [style.animation-delay.ms]="i * 100"
                 [class.bar-animate]="!loaded()">
              <div class="flex justify-between items-center">
                <span class="font-['Inter'] font-semibold text-sm text-[#111D23] dark:text-white">
                  {{ zone.zone }}
                </span>
                <span class="font-['Inter'] font-bold text-xs text-[#81000A] dark:text-[#EF4444]">
                  {{ zone.percentage }}%
                </span>
              </div>
              <div class="relative w-full h-3 bg-gray-100 dark:bg-[#1F1F1F] rounded-full overflow-hidden">
                <div class="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                     [style.width.%]="zone.percentage"
                     [ngClass]="barColor(zone.percentage)">
                </div>
              </div>
              <span class="font-['Inter'] font-medium text-xs text-[#4C616C] dark:text-[#8A9BA8]">
                {{ zone.used }}/{{ zone.total }} locaciones
              </span>
            </div>
          }
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center w-full flex-1 gap-4">
          <div class="relative flex items-center justify-center">
            <svg class="w-44 h-44 transform -rotate-90" viewBox="0 0 36 36">
              <path class="text-gray-100 dark:text-[#313131] transition-colors"
                stroke-width="3" stroke="currentColor" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path [attr.stroke-dasharray]="totalPercent() + ', 100'"
                class="transition-all duration-1000 ease-out"
                stroke-width="3" stroke-linecap="round" stroke="currentColor" fill="none"
                [class.text-[#EF4444]]="totalPercent() >= 80"
                [class.text-[#F5A623]]="totalPercent() >= 65 && totalPercent() < 80"
                [class.text-[#34A853]]="totalPercent() < 65"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="font-['Work_Sans'] font-bold text-4xl text-[#111D23] dark:text-white transition-all duration-500">{{ totalPercent() }}%</span>
              <span class="font-['Inter'] font-semibold text-xs tracking-wider uppercase transition-colors"
                [class.text-[#EF4444]]="totalPercent() >= 80"
                [class.text-[#F5A623]]="totalPercent() >= 65 && totalPercent() < 80"
                [class.text-[#34A853]]="totalPercent() < 65">
                Ocupado
              </span>
            </div>
          </div>
          <div class="flex justify-between w-full max-w-xs px-4 pt-4 border-t border-gray-100 dark:border-[#1F1F1F]">
            <div class="flex flex-col items-start">
              <span class="font-['Inter'] text-[11px] font-bold tracking-[1px] uppercase text-[#4C616C] dark:text-[#8A9BA8]">Locaciones</span>
              <span class="font-['Work_Sans'] text-lg font-bold text-[#111D23] dark:text-white">{{ totalLocations() }}</span>
            </div>
            <div class="flex flex-col items-end">
              <span class="font-['Inter'] text-[11px] font-bold tracking-[1px] uppercase text-[#4C616C] dark:text-[#8A9BA8]">En Uso</span>
              <span class="font-['Work_Sans'] text-lg font-bold text-[#81000A] dark:text-[#EF4444]">{{ usedLocations() }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes barGrow {
      from { width: 0% !important; }
    }
    .bar-animate div div {
      animation: barGrow 1s ease-out both;
    }
  `]
})
export class CapacidadZonaWidget {
  data = input<ZoneCapacity[]>([]);
  loaded = signal(false);
  viewMode = signal<'zona' | 'general'>('zona');

  totalPercent = computed(() => {
    const zones = this.data();
    if (!zones.length) return 0;
    const totalUsed = zones.reduce((sum, z) => sum + z.used, 0);
    const totalCap = zones.reduce((sum, z) => sum + z.total, 0);
    return Math.round((totalUsed / totalCap) * 100);
  });

  totalLocations = computed(() => {
    return this.data().reduce((sum, z) => sum + z.total, 0).toLocaleString();
  });

  usedLocations = computed(() => {
    return this.data().reduce((sum, z) => sum + z.used, 0).toLocaleString();
  });

  constructor() {
    effect(() => {
      const zones = this.data();
      if (zones.length && !this.loaded()) {
        setTimeout(() => this.loaded.set(true), 300);
      }
    });
  }

  barColor(percentage: number): string {
    if (percentage >= 80) return 'bg-[#EF4444]';
    if (percentage >= 65) return 'bg-[#F5A623]';
    return 'bg-[#34A853]';
  }
}
