import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductApiService } from '../../../../services/product-api.service';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-product-export-modal',
  imports: [CommonModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './product-export-modal.html',
})
export class ProductExportModal {
  private readonly productApi = inject(ProductApiService);

  readonly close = output<void>();

  exportar(formato: 'excel' | 'pdf'): void {
    this.close.emit();
    this.productApi.exportar(formato).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fecha = new Date().toISOString().split('T')[0];
        a.download = `inventario-productos-${fecha}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(`Error exportando ${formato.toUpperCase()}:`, err);
        alert('No se pudo exportar. Verifica que el backend esté corriendo.');
      },
    });
  }
}
