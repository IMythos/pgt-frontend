import { Component, input, output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSizeOptions = input<number[]>([5, 10, 20]);
  readonly showPageButtons = input(false);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  protected totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  protected pageButtons = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  });

  protected onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  protected previousPage(): void {
    if (this.currentPage() > 0) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  protected nextPage(): void {
    if ((this.currentPage() + 1) * this.pageSize() < this.totalItems()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  protected goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
