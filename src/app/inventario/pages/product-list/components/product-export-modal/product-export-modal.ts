import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductApiService } from '../../../../services/product-api.service';

@Component({
  selector: 'app-product-export-modal',
  imports: [CommonModule],
  templateUrl: './product-export-modal.html',
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `],
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
