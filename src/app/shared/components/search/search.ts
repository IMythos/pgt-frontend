import { Component, input, model, output, inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  readonly placeholder = input<string>('Buscar...');
  readonly debounce = input(300);

  readonly value = model<string>('');
  readonly searchChange = output<string>();

  private readonly searchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.searchSubject.pipe(
      debounceTime(this.debounce()),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(val => {
      this.searchChange.emit(val);
    });
  }

  protected onValueChange(val: string): void {
    this.value.set(val);
    this.searchSubject.next(val);
  }
}
