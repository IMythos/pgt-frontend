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

  registrarMovimiento(): void {
    if (!this.formCantidad() || this.formCantidad()! <= 0) return;
    if (!this.formMotivo()) return;
    if (!this.formProducto()) return;

    let tipo: TipoMovimiento = this.formTipo();
    if (tipo === 'AJUSTE') {
      tipo = this.formTipoAjuste() === 'POSITIVO' ? 'AJUSTE' : 'AJUSTE_NEGATIVO';
    }

    if ((tipo === 'INGRESO' || tipo === 'AJUSTE') && (!this.formCostoUnit() || this.formCostoUnit()! <= 0)) return;

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
    } else if (tipo === 'SALIDA') {
      if (this.formCliente()) payload.proveedor = this.formCliente();
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
