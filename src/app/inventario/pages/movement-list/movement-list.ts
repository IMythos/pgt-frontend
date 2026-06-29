import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovementApiService } from '../../services/movement-api.service';
import { ProductApiService } from '../../services/product-api.service';
import { LocationApiService } from '../../services/location-api.service';
import {
  MovimientoListadoDto,
  RegistrarMovimientoRequest,
  FiltroMovimientoDto,
  TipoMovimiento
} from '../../models/movement.model';
import { ProductoCatalogoDto } from '../../models/product.model';
import { LocationDto } from '../../models/location.model';
import { WebSocketService } from '../../../core/services/websocket.service';
import { HeatmapApiService } from '../../../tracking/services/heatmap-api.service';
import { PickingApiService } from '../../../tracking/services/picking-api.service';
import { LocationProductDto } from '../../../tracking/models/heatmap.model';

interface SalidaItem {
  productoId: string;
  locacionId: string;
  idLote: string;
  productoCod: string;
  productoDesc: string;
  cantidad: number;
}

@Component({
  selector: 'app-movement-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './movement-list.html',
  styleUrl: './movement-list.css',
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
    .animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `],
})
export class MovementList implements OnInit {
  private readonly movementApi = inject(MovementApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly locationApi = inject(LocationApiService);
  private readonly ws = inject(WebSocketService);
  private readonly heatmapApi = inject(HeatmapApiService);
  private readonly pickingApi = inject(PickingApiService);

  movements = signal<MovimientoListadoDto[]>([]);
  productos = signal<ProductoCatalogoDto[]>([]);
  locaciones = signal<LocationDto[]>([]);
  loading = signal(false);
  currentPage = signal(0);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  isModalOpen = signal<boolean>(false);
  isSaving = signal(false);

  filtroTexto = signal('');
  filtroTipo = signal<string>('');
  filtroFecha = signal('');

  formTipo = signal<TipoMovimiento>('INGRESO');
  formProducto = signal('');
  formCantidad = signal<number | null>(null);
  formDocumentoRef = signal('');
  formMotivo = signal('');
  formLocacion = signal('');
  formProveedor = signal('');
  formNroLote = signal('');
  formCostoUnit = signal<number | null>(null);
  formCliente = signal('');
  formTipoAjuste = signal<'POSITIVO' | 'NEGATIVO'>('POSITIVO');

  salidaLocacionId = signal('');
  salidaLocationProducts = signal<LocationProductDto[]>([]);
  salidaQtyMap = signal<Record<string, number>>({});
  salidaItems = signal<SalidaItem[]>([]);

  ngOnInit(): void {
    this.cargarMovimientos();
    this.cargarProductos();
    this.cargarLocaciones();
    this.ws.onMovement().subscribe(() => this.cargarMovimientos());
  }

  cargarProductos(): void {
    this.productApi.listarCatalogo({ estado: true }).subscribe({
      next: (data) => this.productos.set(data.items),
      error: () => console.error('Error al cargar productos')
    });
  }

  cargarLocaciones(): void {
    this.locationApi.listarActivas().subscribe({
      next: (data) => this.locaciones.set(data),
      error: () => console.error('Error al cargar locaciones')
    });
  }

  cargarMovimientos(): void {
    this.loading.set(true);
    const filtros: FiltroMovimientoDto = {
      pagina: this.currentPage(),
      tamanioPagina: this.pageSize(),
    };
    if (this.filtroTipo()) filtros.tipo = this.filtroTipo() as TipoMovimiento;
    if (this.filtroFecha()) filtros.fechaDesde = this.filtroFecha();
    if (this.filtroTexto()) filtros.texto = this.filtroTexto();

    this.movementApi.listar(filtros).subscribe({
      next: (data) => {
        this.movements.set(data.items ?? []);
        this.totalItems.set(data.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.cargarMovimientos();
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.cargarMovimientos();
    }
  }

  nextPage(): void {
    if ((this.currentPage() + 1) * this.pageSize() < this.totalItems()) {
      this.currentPage.update(p => p + 1);
      this.cargarMovimientos();
    }
  }

  openModal(): void {
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    document.body.style.overflow = 'auto';
    this.limpiarFormulario();
  }

  onSalidaLocacionChange(id: string): void {
    this.salidaLocacionId.set(id);
    this.salidaQtyMap.set({});
    if (!id) {
      this.salidaLocationProducts.set([]);
      return;
    }
    this.heatmapApi.obtenerDetalleLocacion(id).subscribe({
      next: (data) => this.salidaLocationProducts.set(data.productos ?? []),
      error: () => {
        this.salidaLocationProducts.set([]);
        console.error('Error al cargar productos de la ubicación');
      }
    });
  }

  setSalidaQty(idLote: string, qty: number): void {
    const num = Math.max(1, Number(qty) || 1);
    this.salidaQtyMap.update(m => ({ ...m, [idLote]: num }));
  }

  isItemAdded(productoCod: string, locacionId: string): boolean {
    return this.salidaItems().some(i => i.productoCod === productoCod && i.locacionId === locacionId);
  }

  agregarItem(prod: LocationProductDto): void {
    const qty = this.salidaQtyMap()[prod.idLote] || 1;
    if (qty <= 0 || qty > prod.cantidad) return;

    const productoId = this.lookupProductoId(prod.productoCod);
    if (!productoId) {
      console.warn(`Producto ${prod.productoCod} no encontrado en catálogo`);
      return;
    }

    if (this.isItemAdded(prod.productoCod, this.salidaLocacionId())) return;

    this.salidaItems.update(items => [...items, {
      productoId,
      locacionId: this.salidaLocacionId(),
      idLote: prod.idLote,
      productoCod: prod.productoCod,
      productoDesc: prod.productoDesc,
      cantidad: qty
    }]);
  }

  eliminarItem(idx: number): void {
    this.salidaItems.update(items => items.filter((_, i) => i !== idx));
  }

  getLocationLabel(id: string): string {
    const loc = this.locaciones().find(l => l.idLocacion === id);
    if (!loc) return id;
    return `${loc.zona} - ${loc.pasillo}${loc.estante ? ' - ' + loc.estante : ''}`;
  }

  private lookupProductoId(sku: string): string | null {
    const p = this.productos().find(prod => prod.sku === sku);
    return p ? p.idProducto : null;
  }

  private registrarSalidaPicking(): void {
    if (this.salidaItems().length === 0) return;

    this.isSaving.set(true);
    this.pickingApi.crearDesdeSalida({
      usuarioCreador: 1,
      items: this.salidaItems().map(i => ({
        productoId: i.productoId,
        locacionId: i.locacionId,
        idLote: i.idLote,
        cantidad: i.cantidad
      })),
      motivo: this.formMotivo(),
      docRef: this.formDocumentoRef() || undefined
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.cargarMovimientos();
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error al crear orden de picking:', err);
      }
    });
  }

  registrarMovimiento(): void {
    let tipo: TipoMovimiento = this.formTipo();
    if (tipo === 'AJUSTE') {
      tipo = this.formTipoAjuste() === 'POSITIVO' ? 'AJUSTE' : 'AJUSTE_NEGATIVO';
    }

    if (tipo === 'SALIDA') {
      if (!this.formMotivo()) return;
      this.registrarSalidaPicking();
      return;
    }

    if (!this.formCantidad() || this.formCantidad()! <= 0) return;
    if (!this.formMotivo()) return;
    if (!this.formProducto()) return;
    if ((tipo === 'INGRESO' || tipo === 'AJUSTE') && (!this.formCostoUnit() || this.formCostoUnit()! <= 0)) return;

    if (tipo === 'INGRESO' && !this.formLocacion()) {
      console.warn('La locación es obligatoria para ingresos');
      return;
    }

    const payload: RegistrarMovimientoRequest = {
      tipo,
      cantidad: this.formCantidad()!,
      motivo: this.formMotivo(),
      documentoRef: this.formDocumentoRef() || undefined,
      idProducto: this.formProducto()
    };

    if (tipo === 'INGRESO') {
      if (this.formLocacion()) payload.idLocacion = this.formLocacion();
    }

    if (tipo === 'INGRESO' || tipo === 'AJUSTE') {
      if (this.formProveedor()) payload.proveedor = this.formProveedor();
      if (this.formNroLote()) payload.nroLote = this.formNroLote();
      payload.costoUnit = this.formCostoUnit()!;
    }

    this.isSaving.set(true);
    this.movementApi.registrar(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.cargarMovimientos();
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error al registrar movimiento:', err);
      }
    });
  }

  setFormTipo(tipo: string): void {
    this.formTipo.set(tipo as any);
    this.formCliente.set('');
    this.formProveedor.set('');
    this.formLocacion.set('');
    this.formNroLote.set('');
    this.formCostoUnit.set(null);
    this.formTipoAjuste.set('POSITIVO');
  }

  setFormTipoAjuste(valor: string): void {
    if (valor === 'POSITIVO' || valor === 'NEGATIVO') {
      this.formTipoAjuste.set(valor);
    }
  }

  private limpiarFormulario(): void {
    this.formTipo.set('INGRESO');
    this.formProducto.set('');
    this.formCantidad.set(null);
    this.formDocumentoRef.set('');
    this.formMotivo.set('');
    this.formLocacion.set('');
    this.formProveedor.set('');
    this.formNroLote.set('');
    this.formCostoUnit.set(null);
    this.formCliente.set('');
    this.formTipoAjuste.set('POSITIVO');
    this.salidaLocacionId.set('');
    this.salidaLocationProducts.set([]);
    this.salidaQtyMap.set({});
    this.salidaItems.set([]);
  }

  getMovementBadgeClass(type: string): string {
    switch(type) {
      case 'INGRESO':
        return 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]';
      case 'SALIDA':
        return 'border border-[#EF4444] text-[#EF4444]';
      case 'AJUSTE':
      case 'AJUSTE_POSITIVO':
      case 'AJUSTE_NEGATIVO':
        return 'bg-gray-100 dark:bg-[#1F1F1F] text-[#4C616C] dark:text-[#8A9BA8]';
      default:
        return 'bg-gray-100 dark:bg-[#1F1F1F] text-[#4C616C] dark:text-[#8A9BA8]';
    }
  }

  getQuantityClass(type: string): string {
    if (type === 'INGRESO' || type === 'AJUSTE_POSITIVO') return 'text-[#34A853]';
    if (type === 'SALIDA' || type === 'AJUSTE_NEGATIVO') return 'text-[#111D23] dark:text-white';
    return 'text-[#B45309]';
  }

  formatQuantity(mov: MovimientoListadoDto): string {
    if (mov.cantidadIngreso > 0) return `+${mov.cantidadIngreso}`;
    if (mov.cantidadSalida > 0) return `-${mov.cantidadSalida}`;
    return '0';
  }

  getQuantityValue(mov: MovimientoListadoDto): number {
    return mov.cantidadIngreso > 0 ? mov.cantidadIngreso : mov.cantidadSalida;
  }
}
