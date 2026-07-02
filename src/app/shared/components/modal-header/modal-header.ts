import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-header',
  standalone: true,
  templateUrl: './modal-header.html',
  styleUrl: './modal-header.css',
})
export class ModalHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input(false);
  readonly closable = input(true);
  readonly close = output<void>();
}
