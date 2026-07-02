import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductApiService } from '../../../../services/product-api.service';
import { ProductoCatalogoDto } from '../../../../models/product.model';
import { Modal } from '../../../../../shared/components/modal/modal';
import { ModalHeader } from '../../../../../shared/components/modal-header/modal-header';
import { ModalFooter } from '../../../../../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-product-detail-modal',
  imports: [CommonModule, Modal, ModalHeader, ModalFooter],
  templateUrl: './product-detail-modal.html',
})
export class ProductDetailModal {
  private readonly productApi = inject(ProductApiService);

  readonly product = input.required<ProductoCatalogoDto>();

  readonly close = output<void>();
  readonly edit = output<ProductoCatalogoDto>();
  readonly deleted = output<void>();

  eliminarProducto(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;
    this.productApi.eliminar(id).subscribe({
      next: () => {
        alert('Producto eliminado exitosamente!');
        this.deleted.emit();
      },
      error: (err) => {
        console.error('Error eliminando producto:', err);
        const msg = err.error?.message || err.error || 'Error al eliminar. Verifica consola.';
        alert(`No se pudo eliminar:\n${msg}`);
      },
    });
  }

  stockBarPercent(stock: number, minStock: number): number {
    if (minStock > 0) {
      const pct = (stock / minStock) * 100;
      return pct > 100 ? 100 : pct;
    }
    return stock > 0 ? 100 : 0;
  }

  getStockStatus(stock: number | undefined): { label: string; colorClass: string } {
    const s = stock ?? 0;
    if (s > 20) return { label: 'Óptimo', colorClass: 'text-[#34A853] bg-[#E6F4EA] dark:bg-[rgba(52,168,83,0.1)]' };
    if (s > 5) return { label: 'Bajo', colorClass: 'text-[#F5A623] bg-[#FEF3C7] dark:bg-[rgba(245,166,35,0.1)]' };
    if (s > 0) return { label: 'Crítico', colorClass: 'text-[#81000A] bg-[#FCE8E8] dark:bg-[rgba(239,68,68,0.15)] dark:text-[#EF4444]' };
    return { label: 'Agotado', colorClass: 'text-[#4C616C] bg-[#F3F4F6] dark:bg-[rgba(255,255,255,0.05)] dark:text-[#8A9BA8]' };
  }
}
