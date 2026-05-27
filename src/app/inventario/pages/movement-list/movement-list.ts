import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
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
  isModalOpen = signal<boolean>(false);

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
    const filtros: FiltroMovimientoDto = {};
    if (this.filtroTipo()) filtros.tipo = this.filtroTipo() as TipoMovimiento;
    if (this.filtroFecha()) filtros.fechaDesde = this.filtroFecha();
    if (this.filtroTexto()) filtros.texto = this.filtroTexto();

    this.movementApi.listar(filtros).subscribe({
      next: (data) => {
        this.movements.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
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

    const payload: RegistrarMovimientoRequest = {
      tipo: this.formTipo(),
      cantidad: this.formCantidad()!,
      motivo: this.formMotivo(),
      documentoRef: this.formDocumentoRef() || undefined
    };

    if (this.formProducto()) {
      payload.idProducto = this.formProducto();
    }

    if (this.formLocacion()) {
      payload.idLocacion = this.formLocacion();
    }

    if (this.formProveedor()) {
      payload.proveedor = this.formProveedor();
    }

    if (this.formNroLote()) {
      payload.nroLote = this.formNroLote();
    }

    if (this.formCostoUnit()) {
      payload.costoUnit = this.formCostoUnit()!;
    }

    this.movementApi.registrar(payload).subscribe({
      next: () => {
        this.closeModal();
        this.cargarMovimientos();
      },
      error: (err) => {
        console.error('Error al registrar movimiento:', err);
      }
    });
  }

  setFormTipo(tipo: string): void {
    this.formTipo.set(tipo as any);
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
  }

  getMovementBadgeClass(type: string): string {
    switch(type) {
      case 'INGRESO':
        return 'bg-[rgba(129,0,10,0.08)] dark:bg-[rgba(226,190,186,0.15)] text-[#81000A] dark:text-[#E2BEBA]';
      case 'SALIDA':
        return 'border border-[#81000A] text-[#81000A] dark:border-[#E2BEBA] dark:text-[#E2BEBA]';
      case 'AJUSTE':
      case 'AJUSTE_POSITIVO':
      case 'AJUSTE_NEGATIVO':
        return 'bg-gray-100 dark:bg-[#313131] text-[#4C616C] dark:text-[#8A9BA8]';
      default:
        return 'bg-gray-100 dark:bg-[#313131] text-[#4C616C] dark:text-[#8A9BA8]';
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
