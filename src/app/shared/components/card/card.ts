import { Component, input } from '@angular/core';

export type CardVariant = 'default' | 'widget' | 'stats';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<'sm' | 'md' | 'lg'>('md');
  readonly hover = input(false);

  protected computedClass(): string {
    const base = this.hover() ? 'card-hover' : 'card';
    const pad = this.paddingMap()[this.padding()];
    const extra = this.variant() === 'widget' ? ' h-[400px]' : '';
    return `${base} ${pad}${extra}`.trim();
  }

  private readonly paddingMap = (): Record<string, string> => ({
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  });
}
