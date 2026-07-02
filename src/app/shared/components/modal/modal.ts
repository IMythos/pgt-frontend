import { Component, input, output, OnInit, OnDestroy } from '@angular/core';
import { scrollLock } from '../../utils/scroll-lock';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements OnInit, OnDestroy {
  readonly size = input<ModalSize>('md');
  readonly closeOnOverlay = input(false);
  readonly close = output<void>();

  private readonly sizeMap: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    xxl: 'max-w-4xl',
  };

  protected sizeClass(): string {
    return this.sizeMap[this.size()] || 'max-w-lg';
  }

  ngOnInit(): void {
    scrollLock(true);
  }

  ngOnDestroy(): void {
    scrollLock(false);
  }
}
