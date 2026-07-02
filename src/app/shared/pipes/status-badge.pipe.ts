import { Pipe, PipeTransform } from '@angular/core';

export interface BadgeConfig {
  label: string;
  class: string;
  dotColor?: string;
}

export type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'default';

const BADGE_MAP: Record<BadgeStatus, BadgeConfig> = {
  success: { label: 'Activo', class: 'bg-[#E6F4EA] dark:bg-[rgba(52,168,83,0.15)] text-[#34A853]', dotColor: 'bg-[#34A853]' },
  warning: { label: 'Pendiente', class: 'bg-[#FEF3C7] dark:bg-[rgba(245,166,35,0.15)] text-[#F5A623]', dotColor: 'bg-[#F5A623]' },
  danger: { label: 'Crítico', class: 'bg-[#FCE8E8] dark:bg-[rgba(239,68,68,0.15)] text-[#81000A] dark:text-[#EF4444]', dotColor: 'bg-[#81000A] dark:bg-[#EF4444]' },
  info: { label: 'En Proceso', class: 'bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.15)] text-[#3B82F6]', dotColor: 'bg-[#3B82F6]' },
  default: { label: 'Inactivo', class: 'bg-[#F3F4F6] dark:bg-[rgba(255,255,255,0.05)] text-[#4C616C] dark:text-[#8A9BA8]', dotColor: 'bg-[#4C616C] dark:bg-[#8A9BA8]' },
};

@Pipe({ name: 'statusBadge', standalone: true })
export class StatusBadgePipe implements PipeTransform {
  transform(status: BadgeStatus | string): BadgeConfig {
    return BADGE_MAP[status as BadgeStatus] ?? { label: status, class: '', dotColor: undefined };
  }
}
