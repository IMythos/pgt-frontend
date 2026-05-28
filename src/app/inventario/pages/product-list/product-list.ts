import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductApiService } from '../../services/product-api.service';
import {
  ActualizarProductoDto,
  CategoriaProductoDto,
  CrearProductoDto,
  MarcaProductoDto,
  ProductoCatalogoDto,
  FiltroCatalogoProductosDto,
} from '../../models/product.model';
@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styles: [
    `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes zoomIn {
        from { opacity: 0; transform: scale(0.95) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
      .animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `,
  ],
})
export class ProductList implements OnInit {
  private readonly productApi = inject(ProductApiService);

  isModalOpen = signal(false);
  isExportModalOpen = signal(false);
  isSaving = signal(false);
  loading = signal(false);

  isDetailModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isUpdating = signal(false);
  selectedProduct = signal<ProductoCatalogoDto | null>(null);
  editingProductId = signal<string | null>(null);
  products = signal<ProductoCatalogoDto[]>([]);
  categorias = signal<CategoriaProductoDto[]>([]);
  marcas = signal<MarcaProductoDto[]>([]);
  filtroTexto = signal('');
  filtroCategoria = signal<number | ''>('');
  filtroEstado = signal('');
  inventoryStats = signal({
    totalProducts: { value: 0, trend: 'Cargando...', isPositive: true },
    lowStock: { value: 0, trend: '-', isPositive: true },
    criticalStock: { value: 0, trend: '-', isPositive: false },
    totalCategories: { value: 0, trend: '-', isPositive: true },
  });
  formProducto = signal({
    idCategoria: null as number | null,
    idMarca: null as number | null,
    sku: '',
    numeroParte: '',
    descripcion: '',
    modelosCompatiblesStr: '',
    precioCompra: null as number | null,
    precioVenta: null as number | null,
    stockMinimo: null as number | null,
    stockInicial: null as number | null,
  });
  editFormProducto = signal({
    idCategoria: null as number | null,
    idMarca: null as number | null,
    numeroParte: '' as string | null,
    descripcion: '',
    modelosCompatiblesStr: '',
    estado: true,
  });

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.loading.set(true);
    forkJoin({
      categorias: this.productApi.listarCategoriasActivas(),
      marcas: this.productApi.listarMarcasActivas(),
    }).subscribe({
      next: ({ categorias, marcas }) => {
        this.categorias.set(categorias);
        this.marcas.set(marcas);
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error cargando catálogos:', err);
        this.loading.set(false);
      },
    });
  }

  private enrichProductsWithCatalogNames(products: ProductoCatalogoDto[]): ProductoCatalogoDto[] {
    const catMap = new Map(this.categorias().map((c) => [c.idCategoria, c.nombreCategoria]));
    const marcaMap = new Map(this.marcas().map((m) => [m.idMarca, m.nombreMarca]));
    return products.map((p) => ({
      ...p,
      categoria: {
        ...p.categoria,
        nombreCategoria: catMap.get(p.categoria.idCategoria) || `ID ${p.categoria.idCategoria}`,
      },
      marca: {
        ...p.marca,
        nombreMarca: marcaMap.get(p.marca.idMarca) || `ID ${p.marca.idMarca}`,
      },
    }));
  }

  cargarProductos(): void {
    this.loading.set(true);
    const filtros: FiltroCatalogoProductosDto = {};
    if (this.filtroTexto()) filtros.texto = this.filtroTexto();
    if (this.filtroCategoria() !== '') filtros.idCategoria = Number(this.filtroCategoria());
    if (this.filtroEstado() === 'activo') filtros.estado = true;
    else if (this.filtroEstado() === 'inactivo') filtros.estado = false;
    this.productApi.listarCatalogo(filtros).subscribe({
      next: (data) => {
        const enriched = this.enrichProductsWithCatalogNames(data.items);
        this.products.set(enriched);
        const total = data.total;
        const lowStockCount = enriched.filter((p) => (p.stockTotal ?? 0) > 0 && (p.stockTotal ?? 0) <= 10).length;
        const criticalCount = enriched.filter((p) => (p.stockTotal ?? 0) === 0).length;
        this.inventoryStats.set({
          totalProducts: { value: total, trend: `${total} registrados`, isPositive: true },
          lowStock: { value: lowStockCount, trend: 'Productos con stock ≤ 10', isPositive: lowStockCount < 10 },
          criticalStock: { value: criticalCount, trend: 'Sin stock (0 unidades)', isPositive: false },
          totalCategories: { value: this.categorias().length, trend: 'Activas', isPositive: true },
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.loading.set(false);
      },
    });
  }

  getStockStatus(stock: number | undefined): { label: string; colorClass: string } {
    const s = stock ?? 0;
    if (s > 20)
      return { label: 'Óptimo', colorClass: 'text-[#34A853] bg-[#E6F4EA] dark:bg-[rgba(52,168,83,0.1)]' };
    if (s > 5)
      return { label: 'Bajo', colorClass: 'text-[#F5A623] bg-[#FEF3C7] dark:bg-[rgba(245,166,35,0.1)]' };
    if (s > 0)
      return { label: 'Crítico', colorClass: 'text-[#81000A] bg-[#FCE8E8] dark:bg-[rgba(129,0,10,0.15)] dark:text-[#E2BEBA]' };
    return { label: 'Agotado', colorClass: 'text-[#4C616C] bg-[#F3F4F6] dark:bg-[rgba(255,255,255,0.05)] dark:text-[#8A9BA8]' };
  }

  guardarProducto(): void {
    const form = this.formProducto();
    if (!form.idCategoria || !form.idMarca || !form.sku || !form.descripcion || form.precioCompra === null || form.precioVenta === null) {
      alert('Por favor completa los campos requeridos: Categoría, Marca, SKU, Descripción, Precios');
      return;
    }
    if (form.precioCompra <= 0 || form.precioVenta <= 0) {
      alert('Los precios deben ser mayores a 0');
      return;
    }
    if (form.stockMinimo !== null && form.stockMinimo < 0) {
      alert('El stock mínimo no puede ser negativo');
      return;
    }
    if (form.stockInicial !== null && form.stockInicial < 0) {
      alert('El stock inicial no puede ser negativo');
      return;
    }
    let modelosCompatibles: string[] = [];
    if (form.modelosCompatiblesStr && form.modelosCompatiblesStr.trim()) {
      modelosCompatibles = form.modelosCompatiblesStr.split(',').map((m) => m.trim()).filter((m) => m.length > 0);
    }
    const payload: CrearProductoDto = {
      idCategoria: form.idCategoria,
      idMarca: form.idMarca,
      sku: form.sku.toUpperCase(),
      numeroParte: form.numeroParte || null,
      descripcion: form.descripcion,
      modelosCompatibles,
      precioCompra: form.precioCompra,
      precioVenta: form.precioVenta,
      stockMinimo: form.stockMinimo ?? null,
      stockInicial: form.stockInicial ?? null,
    };
    this.isSaving.set(true);
    this.productApi.crear(payload).subscribe({
      next: () => {
        alert('Producto guardado exitosamente!');
        this.limpiarFormulario();
        this.closeModal();
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error guardando producto:', err);
        const msg = err.error?.message || err.error || 'Error al guardar. Verifica consola.';
        alert(`No se pudo guardar:\n${msg}`);
      },
      complete: () => this.isSaving.set(false),
    });
  }

  private limpiarFormulario(): void {
    this.formProducto.set({
      idCategoria: null, idMarca: null, sku: '', numeroParte: '',
      descripcion: '', modelosCompatiblesStr: '', precioCompra: null, precioVenta: null,
      stockMinimo: null, stockInicial: null,
    });
  }

  openDetail(product: ProductoCatalogoDto): void {
    this.selectedProduct.set(product);
    this.isDetailModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }
  closeDetail(): void {
    this.isDetailModalOpen.set(false);
    this.selectedProduct.set(null);
    document.body.style.overflow = 'auto';
  }

  openEdit(product: ProductoCatalogoDto): void {
    this.editingProductId.set(product.idProducto);
    this.editFormProducto.set({
      idCategoria: product.categoria.idCategoria,
      idMarca: product.marca.idMarca,
      numeroParte: product.numeroParte ?? null,
      descripcion: product.descripcion,
      modelosCompatiblesStr: (product.modelosCompatibles ?? []).join(', '),
      estado: product.estado,
    });
    this.isEditModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeEdit(): void {
    this.isEditModalOpen.set(false);
    this.editingProductId.set(null);
    document.body.style.overflow = 'auto';
  }

  actualizarEditForm<K extends keyof ReturnType<typeof this.editFormProducto>>(
    campo: K, valor: ReturnType<typeof this.editFormProducto>[K],
  ): void {
    this.editFormProducto.update((prev) => ({ ...prev, [campo]: valor }));
  }

  actualizarProducto(): void {
    const form = this.editFormProducto();
    const id = this.editingProductId();
    if (!id) return;
    if (!form.idCategoria || !form.idMarca || !form.descripcion) {
      alert('Completa los campos requeridos: Categoría, Marca, Descripción');
      return;
    }
    let modelosCompatibles: string[] = [];
    if (form.modelosCompatiblesStr && form.modelosCompatiblesStr.trim()) {
      modelosCompatibles = form.modelosCompatiblesStr.split(',').map((m) => m.trim()).filter((m) => m.length > 0);
    }
    const payload: ActualizarProductoDto = {
      idCategoria: form.idCategoria,
      idMarca: form.idMarca,
      numeroParte: form.numeroParte || null,
      descripcion: form.descripcion,
      modelosCompatibles,
      estado: form.estado,
    };
    this.isUpdating.set(true);
    this.productApi.actualizar(id, payload).subscribe({
      next: () => {
        alert('Producto actualizado exitosamente!');
        this.closeEdit();
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error actualizando producto:', err);
        const msg = err.error?.message || err.error || 'Error al actualizar. Verifica consola.';
        alert(`No se pudo actualizar:\n${msg}`);
      },
      complete: () => this.isUpdating.set(false),
    });
  }


  eliminarProducto(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;
    this.productApi.eliminar(id).subscribe({
      next: () => {
        alert('Producto eliminado exitosamente!');
        this.closeDetail();
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error eliminando producto:', err);
        const msg = err.error?.message || err.error || 'Error al eliminar. Verifica consola.';
        alert(`No se pudo eliminar:\n${msg}`);
      },
    });
  }

  openModal() { this.isModalOpen.set(true); document.body.style.overflow = 'hidden'; }
  closeModal() { this.isModalOpen.set(false); document.body.style.overflow = 'auto'; }
  openExportModal() { this.isExportModalOpen.set(true); document.body.style.overflow = 'hidden'; }
  closeExportModal() { this.isExportModalOpen.set(false); document.body.style.overflow = 'auto'; }


  exportar(formato: 'excel' | 'pdf') {
    this.closeExportModal();
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
  actualizarForm<K extends keyof ReturnType<typeof this.formProducto>>(
    campo: K, valor: ReturnType<typeof this.formProducto>[K],
  ): void {
    this.formProducto.update((prev) => ({ ...prev, [campo]: valor }));
  }
}
