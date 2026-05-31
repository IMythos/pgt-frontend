import { Component, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockAlert } from '../../models/dashboard.models';

@Component({
  selector: 'app-stock-alerts-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-start p-6 h-[400px] bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl transition-all duration-300 relative overflow-hidden">
      <div class="flex flex-col gap-1 w-full mb-6">
        <h3 class="font-['Work_Sans'] font-bold text-xl text-[#111D23] dark:text-white">
          Alertas de Stock Crítico
        </h3>
        <p class="font-['Inter'] font-medium text-sm text-[#4C616C] dark:text-[#8A9BA8]">
          Repuestos por debajo del mínimo operativo
        </p>
      </div>

      <div class="flex flex-col gap-2 w-full flex-1 overflow-y-auto pr-2">
        @for (alert of data(); track alert.sku; let i = $index) {
          <div class="flex justify-between items-center w-full py-3 border-b border-gray-50 dark:border-[#1F1F1F] last:border-0 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-[#141414] rounded-lg px-2"
               [style.animation-delay.ms]="i * 80"
               [class.animate-fadeIn]="!loaded()"
               [class.new-alert]="newAlertSku() === alert.sku">
            <div class="flex items-center gap-3">
              <div class="flex justify-center items-center w-10 h-10 rounded-md bg-[rgba(129,0,10,0.05)] dark:bg-[rgba(239,68,68,0.15)] shrink-0">
                <svg class="w-5 h-5 text-[#81000A] dark:text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="flex flex-col">
                <span class="font-['Inter'] font-bold text-sm text-[#111D23] dark:text-white">{{ alert.name }}</span>
                <span class="font-['Inter'] font-medium text-xs text-[#4C616C] dark:text-[#8A9BA8]">SKU: {{ alert.sku }}</span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="font-['Inter'] font-bold text-[10px] tracking-[1px] uppercase transition-colors px-2 py-0.5 rounded"
                    [ngClass]="alert.status === 'Crítico'
                      ? 'text-[#81000A] dark:text-[#EF4444] bg-[rgba(129,0,10,0.1)] dark:bg-[rgba(239,68,68,0.25)]'
                      : 'text-[#B45309] bg-[#FEF3C7] dark:bg-[rgba(180,83,9,0.2)]'">
                {{ alert.status }}
              </span>
              <span class="font-['Inter'] font-medium text-xs text-[#4C616C] dark:text-[#8A9BA8]">
                Stock: {{ alert.stock }}
              </span>
            </div>
          </div>
        }
      </div>

      <a href="#" class="mt-4 font-['Inter'] font-bold text-sm text-[#81000A] dark:text-[#EF4444] hover:underline transition-colors w-full text-center py-2">
        Ver todas las alertas
      </a>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out both;
    }
    @keyframes newAlertPulse {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(239, 68, 68, 0.08); }
    }
    .new-alert {
      animation: newAlertPulse 1.5s ease-in-out 3;
    }
  `]
})
export class StockAlertsWidget {
  data = input<StockAlert[]>([]);
  loaded = signal(false);

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
