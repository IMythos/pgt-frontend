import { Component, input, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZoneCapacity } from '../../models/dashboard.models';
import { Card } from '../../../shared/components/card/card';

@Component({
  selector: 'app-capacidad-zona-widget',
  standalone: true,
  imports: [CommonModule, Card],
  templateUrl: './capacidad-zona-widget.html',
  styleUrl: './capacidad-zona-widget.css'})
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
