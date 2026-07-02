import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly icon = input<string>('search');
  readonly title = input<string>('');
  readonly message = input<string>('');
  readonly actionText = input<string>('');
  readonly action = output<void>();

  protected iconPath(): string {
    switch (this.icon()) {
      case 'check': return 'M5 13l4 4L19 7';
      case 'search': return 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z';
      default: return 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z';
    }
  }
}
