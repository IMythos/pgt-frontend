import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseApiService } from '../../services/warehouse-api.service';
import { HeatmapApiService } from '../../services/heatmap-api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { WarehouseDto } from '../../models/warehouse.model';
import { HeatmapLocationDto, HeatmapLocationDetailDto } from '../../models/heatmap.model';

interface AisleGroup {
  pasillo: string;
  locaciones: HeatmapLocationDto[];
}

@Component({
  selector: 'app-tracking-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking-home.html'
})
export class TrackingHome implements OnInit {
  private warehouseApi = inject(WarehouseApiService);
  private heatmapApi = inject(HeatmapApiService);
  private wsService = inject(WebSocketService);

  almacenes = signal<WarehouseDto[]>([]);
  almacenSeleccionado = signal<WarehouseDto | null>(null);
  locaciones = signal<HeatmapLocationDto[]>([]);
  selectedLocation = signal<HeatmapLocationDetailDto | null>(null);
  loading = signal(false);

  locacionesAgrupadas = computed<AisleGroup[]>(() => {
    const pasilloMap = new Map<string, HeatmapLocationDto[]>();
    for (const loc of this.locaciones()) {
      const key = loc.pasillo;
      if (!pasilloMap.has(key)) {
        pasilloMap.set(key, []);
      }
      pasilloMap.get(key)!.push(loc);
    }
    return Array.from(pasilloMap.entries())
      .map(([pasillo, locaciones]) => ({ pasillo, locaciones }))
      .sort((a, b) => a.pasillo.localeCompare(b.pasillo));
  });

  ngOnInit() {
    this.cargarAlmacenes();
    this.wsService.onHeatmapUpdate().subscribe(event => {
      if (event.idAlmacen === this.almacenSeleccionado()?.id) {
        this.locaciones.update(list =>
          list.map(loc =>
            loc.idLocacion === event.locacionId
              ? { ...loc, intensity: event.intensity, movementCount: event.movementCount, dailyPicks: event.dailyPicks }
              : loc
          )
        );
      }
    });
  }

  private cargarAlmacenes() {
    this.loading.set(true);
    this.warehouseApi.listar().subscribe({
      next: (almacenes) => {
        this.almacenes.set(almacenes);
        if (almacenes.length > 0) {
          this.seleccionarAlmacen(almacenes[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  seleccionarAlmacen(almacen: WarehouseDto) {
    this.almacenSeleccionado.set(almacen);
    this.selectedLocation.set(null);
    this.loading.set(true);
    this.heatmapApi.obtenerPorAlmacen(almacen.id).subscribe({
      next: (data) => {
        this.locaciones.set(data.locaciones);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectLocation(locacion: HeatmapLocationDto, event: MouseEvent) {
    event.stopPropagation();
    this.locaciones.update(list =>
      list.map(l => ({ ...l, selected: l.idLocacion === locacion.idLocacion }))
    );
    this.heatmapApi.obtenerDetalleLocacion(locacion.idLocacion).subscribe({
      next: (detail) => this.selectedLocation.set(detail)
    });
  }

  getRackColorClass(intensity: number, isSelected: boolean): string {
    let baseClass = 'relative z-10 w-full h-full rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm ';

    if (isSelected) {
      baseClass += 'ring-2 ring-white dark:ring-[#EF4444] ring-offset-2 ring-offset-gray-100 dark:ring-offset-black scale-[1.04] z-20 shadow-2xl ';
    }

    if (intensity >= 80) return baseClass + 'bg-[#81000A]/90 text-white border-2 border-[#81000A] shadow-2xl shadow-[#81000A]/60';
    if (intensity >= 60) return baseClass + 'bg-[#C53030]/80 text-white border-2 border-[#C53030] shadow-2xl shadow-[#C53030]/50';
    if (intensity >= 40) return baseClass + 'bg-[#DD6B20]/80 text-white border-2 border-[#DD6B20] shadow-xl shadow-[#DD6B20]/45';
    if (intensity >= 20) return baseClass + 'bg-[#D69E2E]/80 text-white border-2 border-[#D69E2E] shadow-lg shadow-[#D69E2E]/40';

    return baseClass + 'bg-gray-200/60 dark:bg-[#1A1A1A]/90 border border-gray-300 dark:border-[#2A2A2A] text-[#4C616C] dark:text-[#8A9BA8] shadow-md shadow-gray-400/20 dark:shadow-black/30';
  }

  getIntensityLabel(intensity: number): string {
    if (intensity >= 80) return 'CRÍTICO';
    if (intensity >= 60) return 'ALTO';
    if (intensity >= 40) return 'MODERADO';
    if (intensity >= 20) return 'BAJO';
    return 'SIN MOVIMIENTO';
  }

  getProgressColor(intensity: number): string {
    if (intensity >= 80) return 'bg-[#81000A]';
    if (intensity >= 60) return 'bg-[#C53030]';
    if (intensity >= 40) return 'bg-[#DD6B20]';
    if (intensity >= 20) return 'bg-[#D69E2E]';
    return 'bg-gray-400 dark:bg-[#4C616C]';
  }

  getGlowOpacity(intensity: number): number {
    if (intensity < 20) return 0;
    return Math.min(intensity / 100, 0.7);
  }
  deselectLocation() {
    this.selectedLocation.set(null);
    this.locaciones.update(list =>
      list.map(l => ({ ...l, selected: false }))
    );
  }
}
