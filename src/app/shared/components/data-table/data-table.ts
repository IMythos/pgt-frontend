import { Component, input, output } from '@angular/core';
import { Loading, LoadingType } from '../loading/loading';
import { EmptyState } from '../empty-state/empty-state';

export interface ColumnDef {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [Loading, EmptyState],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable {
  readonly columns = input.required<ColumnDef[]>();
  readonly data = input<any[]>([]);
  readonly loading = input(false);
  readonly loadingType = input<LoadingType>('text');
  readonly loadingText = input('Cargando...');

  readonly emptyIcon = input<string>('search');
  readonly emptyTitle = input<string>('');
  readonly emptyMessage = input<string>('No se encontraron registros.');
  readonly emptyActionText = input<string>('');
  readonly emptyAction = output<void>();

  readonly showFooter = input(false);
  readonly rowClick = output<any>();
}
