import { Component, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Operation } from '../../models/dashboard.models';

@Component({
  selector: 'app-ultimas-operaciones-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col p-6 w-full h-[404px] bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-[#1F1F1F] shadow-sm rounded-xl transition-all duration-300 overflow-hidden">
      <div class="flex justify-between items-center mb-6 shrink-0">
        <h3 class="font-['Work_Sans'] font-bold text-xl text-[#111D23] dark:text-white">
          Últimas Operaciones
        </h3>
        <a href="#" class="font-['Inter'] font-semibold text-sm text-[#81000A] dark:text-[#EF4444] hover:underline">
          Ver historial
        </a>
      </div>

      <div class="w-full flex-1 overflow-y-auto pr-2">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 bg-white dark:bg-[#0A0A0A] z-10 transition-colors">
            <tr class="border-b border-gray-100 dark:border-[#1F1F1F]">
              <th class="pb-3 font-['Inter'] font-bold text-xs tracking-[1px] uppercase text-[#81000A] dark:text-[#EF4444] opacity-80">
                ID Operación
              </th>
              <th class="pb-3 font-['Inter'] font-bold text-xs tracking-[1px] uppercase text-[#81000A] dark:text-[#EF4444] opacity-80">
                Tipo
              </th>
              <th class="pb-3 font-['Inter'] font-bold text-xs tracking-[1px] uppercase text-[#81000A] dark:text-[#EF4444] opacity-80">
                Producto
              </th>
              <th class="pb-3 font-['Inter'] font-bold text-xs tracking-[1px] uppercase text-[#81000A] dark:text-[#EF4444] opacity-80">
                Fecha
              </th>
              <th class="pb-3 font-['Inter'] font-bold text-xs tracking-[1px] uppercase text-[#81000A] dark:text-[#EF4444] opacity-80 text-right">
                Estado
              </th>
            </tr>
          </thead>
          <tbody class="font-['Inter'] text-sm">
            @for (op of data(); track op.id; let i = $index) {
              <tr class="border-b border-gray-50 dark:border-[#1F1F1F] hover:bg-gray-50 dark:hover:bg-[#141414] transition-all duration-300"
                  [style.animation-delay.ms]="i * 60"
                  [class.slide-in]="!loaded()">
                <td class="py-3.5 font-semibold text-[#111D23] dark:text-white">{{ op.id }}</td>
                <td class="py-3.5">
                  <span class="px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase"
                        [ngClass]="typeClass(op.type)">
                    {{ op.type }}
                  </span>
                </td>
                <td class="py-3.5 text-[#4C616C] dark:text-[#8A9BA8]">{{ op.product }}</td>
                <td class="py-3.5 text-[#4C616C] dark:text-[#8A9BA8]">{{ op.date }}</td>
                <td class="py-3.5 text-right font-semibold text-xs"
                    [ngClass]="op.status === 'COMPLETADO' ? 'text-[#34A853]' : 'text-[#F5A623]'">
                  {{ op.status }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideInRow {
      from { opacity: 0; transform: translateX(-15px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .slide-in {
      animation: slideInRow 0.35s ease-out both;
    }
  `]
})
export class UltimasOperacionesWidget {
  data = input<Operation[]>([]);
  loaded = signal(false);

  constructor() {
    effect(() => {
      const ops = this.data();
      if (ops.length && !this.loaded()) {
        setTimeout(() => this.loaded.set(true), 400);
      }
    });
  }

  typeClass(type: string): string {
    if (type === 'INGRESO' || type === 'PICKING') {
      return 'bg-[rgba(129,0,10,0.08)] dark:bg-[rgba(239,68,68,0.15)] text-[#81000A] dark:text-[#EF4444]';
    }
    return 'border border-[#81000A] text-[#81000A] dark:border-[#EF4444] dark:text-[#EF4444]';
  }
}
