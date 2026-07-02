import { Component, input, output } from '@angular/core';

export type BtnVariant = 'primary' | 'secondary' | 'cancel' | 'danger' | 'ghost';
export type BtnSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'button[app-btn], button[appBtn]',
  standalone: true,
  templateUrl: './btn.html',
  styleUrl: './btn.css',
  host: {
    '[class]': 'computedClass()',
    '[disabled]': 'disabled() || loading()',
    '(click)': 'onClick()',
  },
})
export class Btn {
  readonly variant = input<BtnVariant>('primary');
  readonly size = input<BtnSize>('md');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly iconOnly = input(false);

  readonly appBtnClick = output<void>();

  private readonly variantMap: Record<BtnVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    cancel: 'btn-cancel',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };

  private readonly sizeMap: Record<BtnSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3 text-base',
  };

  protected computedClass(): string {
    const base = this.variantMap[this.variant()] || 'btn-primary';
    const size = this.iconOnly() ? 'p-1.5' : this.sizeMap[this.size()];
    return `${base} ${size}`.trim();
  }

  protected onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.appBtnClick.emit();
    }
  }
}
