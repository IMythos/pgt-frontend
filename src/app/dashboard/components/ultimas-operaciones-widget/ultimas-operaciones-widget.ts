import { Component, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Operation } from '../../models/dashboard.models';

@Component({
  selector: 'app-ultimas-operaciones-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ultimas-operaciones-widget.html',
  styleUrl: './ultimas-operaciones-widget.css'})
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
