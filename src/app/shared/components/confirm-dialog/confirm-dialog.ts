import { Component, input, output } from '@angular/core';
import { Modal } from '../modal/modal';
import { ModalHeader } from '../modal-header/modal-header';
import { ModalFooter } from '../modal-footer/modal-footer';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [Modal, ModalHeader, ModalFooter],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');
  readonly variant = input<ConfirmVariant>('danger');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected confirmBtnClass(): string {
    switch (this.variant()) {
      case 'danger': return 'btn-danger px-5 py-2.5';
      case 'warning': return 'btn-secondary border-[#F5A623] text-[#F5A623] px-5 py-2.5';
      case 'info': return 'btn-primary px-5 py-2.5';
    }
  }

  protected confirmIcon(): string {
    switch (this.variant()) {
      case 'danger': return 'M6 18L18 6M6 6l12 12';
      case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'info': return 'M5 13l4 4L19 7';
    }
  }
}
