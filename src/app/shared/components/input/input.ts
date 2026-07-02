import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly required = input(false);
  readonly prefix = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');

  readonly value = model<any>('');
  readonly valueChange = output<any>();

  protected onValueChange(val: any): void {
    this.value.set(val);
    this.valueChange.emit(val);
  }
}
