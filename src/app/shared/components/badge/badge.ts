import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { BadgeStatus } from '../../pipes/status-badge.pipe';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
  readonly variant = input<BadgeStatus>('default');
  readonly dot = input(false);

  protected classMap(): Record<BadgeStatus, string> {
    return {
      success: 'bg-[#E6F4EA] dark:bg-[rgba(52,168,83,0.15)] text-[#34A853]',
      warning: 'bg-[#FEF3C7] dark:bg-[rgba(245,166,35,0.15)] text-[#F5A623]',
      danger: 'bg-[#FCE8E8] dark:bg-[rgba(239,68,68,0.15)] text-[#81000A] dark:text-[#EF4444]',
      info: 'bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.15)] text-[#3B82F6]',
      default: 'bg-[#F3F4F6] dark:bg-[rgba(255,255,255,0.05)] text-[#4C616C] dark:text-[#8A9BA8]',
    };
  }

  protected dotClassMap(): Record<BadgeStatus, string> {
    return {
      success: 'bg-[#34A853]',
      warning: 'bg-[#F5A623]',
      danger: 'bg-[#81000A] dark:bg-[#EF4444]',
      info: 'bg-[#3B82F6]',
      default: 'bg-[#4C616C] dark:bg-[#8A9BA8]',
    };
  }
}
