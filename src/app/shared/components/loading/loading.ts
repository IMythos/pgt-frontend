import { Component, input } from '@angular/core';

export type LoadingType = 'spinner' | 'skeleton' | 'text';

@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
  readonly type = input<LoadingType>('spinner');
  readonly text = input<string>('');
  readonly rows = input(5);
  readonly colspan = input(7);

  protected rowsArr(): number[] {
    return Array.from({ length: this.rows() }, (_, i) => i);
  }
}
