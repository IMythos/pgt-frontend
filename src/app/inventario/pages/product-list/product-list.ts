import { Component, inject, signal, computed, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, ProductCreateModal, ProductDetailModal, ProductEditModal, ProductExportModal],
  templateUrl: './product-list.html',
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.2s ease-out forwards;
      }
      .animate-zoom-in {
        animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `,
  ],
})
export class ProductList implements OnInit {
  private readonly productApi = inject(ProductApiService);
  private readonly ws = inject(WebSocketService);

  isModalOpen = signal(false);
  isExportModalOpen = signal(false);
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
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

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

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.cargarProductos();
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.cargarProductos();
    }
  }

  nextPage(): void {
    if ((this.currentPage() + 1) * this.pageSize() < this.totalItems()) {
      this.currentPage.update((p) => p + 1);
      this.cargarProductos();
    }
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
    document.body.style.overflow = 'hidden';
  }
  closeDetail(): void {
    this.isDetailModalOpen.set(false);
    this.selectedProduct.set(null);
    document.body.style.overflow = 'auto';
  }

  openEdit(product: ProductoCatalogoDto): void {
    this.editingProductId.set(product.idProducto);
    this.selectedProduct.set(product);
    this.isEditModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeEdit(): void {
    this.isEditModalOpen.set(false);
    this.editingProductId.set(null);
    this.selectedProduct.set(null);
    document.body.style.overflow = 'auto';
  }

  openModal() {
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }
  closeModal() {
    this.isModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }
  openExportModal() {
    this.isExportModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }
  closeExportModal() {
    this.isExportModalOpen.set(false);
    document.body.style.overflow = 'auto';
  }

}
