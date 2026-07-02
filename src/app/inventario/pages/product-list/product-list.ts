import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductApiService } from '../../services/product-api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import {
  CategoriaProductoDto,
  MarcaProductoDto,
  ProductoCatalogoDto,
  FiltroCatalogoProductosDto,
} from '../../models/product.model';
import { ProductCreateModal } from './components/product-create-modal/product-create-modal';
import { ProductDetailModal } from './components/product-detail-modal/product-detail-modal';
import { ProductEditModal } from './components/product-edit-modal/product-edit-modal';
import { ProductExportModal } from './components/product-export-modal/product-export-modal';
import { QuickCatalogModal } from './components/quick-catalog-modal/quick-catalog-modal';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Btn } from '../../../shared/components/btn/btn';
import { scrollLock } from '../../../shared/utils/scroll-lock';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, ProductCreateModal, ProductDetailModal, ProductEditModal, ProductExportModal, QuickCatalogModal, Pagination, Btn],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly ws = inject(WebSocketService);

  isModalOpen = signal(false);
  isExportModalOpen = signal(false);
  showQuickCatalogModal = signal(false);
  quickCatalogType = signal<'category' | 'brand'>('category');
  loading = signal(false);

  isDetailModalOpen = signal(false);
  isEditModalOpen = signal(false);
  selectedProduct = signal<ProductoCatalogoDto | null>(null);
  editingProductId = signal<string | null>(null);
  products = signal<ProductoCatalogoDto[]>([]);
  categorias = signal<CategoriaProductoDto[]>([]);
  marcas = signal<MarcaProductoDto[]>([]);
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);

  filtroTexto = signal('');
  filtroCategoria = signal<number | ''>('');
  filtroEstado = signal('');
  inventoryStats = signal({
    totalProducts: { value: 0, trend: 'Cargando...', isPositive: true },
    lowStock: { value: 0, trend: '-', isPositive: true },
    criticalStock: { value: 0, trend: '-', isPositive: false },
    totalCategories: { value: 0, trend: '-', isPositive: true },
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    this.ws.onMovement().subscribe(() => this.cargarProductos());
    this.ws.onStockAlert().subscribe(() => this.cargarProductos());
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
    const filtros: FiltroCatalogoProductosDto = {
      pagina: this.currentPage(),
      tamanioPagina: this.pageSize(),
    };
    if (this.filtroTexto()) filtros.texto = this.filtroTexto();
    if (this.filtroCategoria() !== '') filtros.idCategoria = Number(this.filtroCategoria());
    if (this.filtroEstado() === 'activo') filtros.estado = true;
    else if (this.filtroEstado() === 'inactivo') filtros.estado = false;
    this.productApi.listarCatalogo(filtros).subscribe({
      next: (data) => {
        const enriched = this.enrichProductsWithCatalogNames(data.items);
        this.products.set(enriched);
        this.totalItems.set(data.total);
        const total = data.total;
        const lowStockCount = enriched.filter(
          (p) => (p.stockTotal ?? 0) > 0 && (p.stockTotal ?? 0) <= 10,
        ).length;
        const criticalCount = enriched.filter((p) => (p.stockTotal ?? 0) === 0).length;
        this.inventoryStats.set({
          totalProducts: { value: total, trend: `${total} registrados`, isPositive: true },
          lowStock: {
            value: lowStockCount,
            trend: 'Productos con stock ≤ 10',
            isPositive: lowStockCount < 10,
          },
          criticalStock: {
            value: criticalCount,
            trend: 'Sin stock (0 unidades)',
            isPositive: false,
          },
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

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.cargarProductos();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.cargarProductos();
  }

  getStockStatus(stock: number | undefined): { label: string; colorClass: string } {
    const s = stock ?? 0;
    if (s > 20)
      return {
        label: 'Óptimo',
        colorClass: 'text-[#34A853] bg-[#E6F4EA] dark:bg-[rgba(52,168,83,0.1)]',
      };
    if (s > 5)
      return {
        label: 'Bajo',
        colorClass: 'text-[#F5A623] bg-[#FEF3C7] dark:bg-[rgba(245,166,35,0.1)]',
      };
    if (s > 0)
      return {
        label: 'Crítico',
        colorClass:
          'text-[#81000A] bg-[#FCE8E8] dark:bg-[rgba(239,68,68,0.15)] dark:text-[#EF4444]',
      };
    return {
      label: 'Agotado',
      colorClass:
        'text-[#4C616C] bg-[#F3F4F6] dark:bg-[rgba(255,255,255,0.05)] dark:text-[#8A9BA8]',
    };
  }

  openDetail(product: ProductoCatalogoDto): void {
    this.selectedProduct.set(product);
    this.isDetailModalOpen.set(true);
    scrollLock(true);
  }
  closeDetail(): void {
    this.isDetailModalOpen.set(false);
    this.selectedProduct.set(null);
    scrollLock(false);
  }

  openEdit(product: ProductoCatalogoDto): void {
    this.editingProductId.set(product.idProducto);
    this.selectedProduct.set(product);
    this.isEditModalOpen.set(true);
    scrollLock(true);
  }

  closeEdit(): void {
    this.isEditModalOpen.set(false);
    this.editingProductId.set(null);
    this.selectedProduct.set(null);
    scrollLock(false);
  }

  openModal() {
    this.isModalOpen.set(true);
    scrollLock(true);
  }
  closeModal() {
    this.isModalOpen.set(false);
    scrollLock(false);
  }
  openQuickCatalog(type: 'category' | 'brand') {
    this.quickCatalogType.set(type);
    this.showQuickCatalogModal.set(true);
  }

  closeQuickCatalog() {
    this.showQuickCatalogModal.set(false);
  }

  onQuickCatalogSaved() {
    this.showQuickCatalogModal.set(false);
    this.cargarCatalogos();
  }

  openExportModal() {
    this.isExportModalOpen.set(true);
    scrollLock(true);
  }
  closeExportModal() {
    this.isExportModalOpen.set(false);
    scrollLock(false);
  }

}
