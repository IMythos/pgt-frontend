import { Pipe, PipeTransform } from '@angular/core';

export interface MovementBadgeConfig {
  label: string;
  class: string;
}

const MOVEMENT_MAP: Record<string, MovementBadgeConfig> = {
  INGRESO: { label: 'Ingreso', class: 'bg-[rgba(52,168,83,0.1)] text-[#34A853]' },
  SALIDA: { label: 'Salida', class: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]' },
  AJUSTE: { label: 'Ajuste', class: 'bg-[rgba(245,166,35,0.1)] text-[#F5A623]' },
  PICKING: { label: 'Picking', class: 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6]' },
};

@Pipe({ name: 'movementType', standalone: true })
export class MovementTypePipe implements PipeTransform {
  transform(type: string): MovementBadgeConfig {
    return MOVEMENT_MAP[type] ?? { label: type, class: 'bg-[rgba(76,97,108,0.1)] text-[#4C616C]' };
  }
}
