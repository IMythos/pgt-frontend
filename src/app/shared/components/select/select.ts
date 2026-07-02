import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly required = input(false);
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly options = input<SelectOption[]>([]);

  readonly value = model<any>(null);
  readonly valueChange = output<any>();

  protected onValueChange(val: any): void {
    this.value.set(val);
    this.valueChange.emit(val);
  }
}
