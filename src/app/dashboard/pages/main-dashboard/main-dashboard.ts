import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { DashboardApiService } from '../../services/dashboard-api.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { DashboardKpi, StockAlert, MovementPoint, TipoProporcion, Operation, ZoneCapacity, ProductTop } from '../../models/dashboard.models';
import { KpiCard } from '../../components/kpi-card/kpi-card';
import { MovimientosAreaChart } from '../../components/movimientos-area-chart/movimientos-area-chart';
import { ProporcionDonutChart } from '../../components/proporcion-donut-chart/proporcion-donut-chart';
import { StockAlertsWidget } from '../../components/stock-alerts-widget/stock-alerts-widget';
import { TopProductsChart } from '../../components/top-products-chart/top-products-chart';
import { UltimasOperacionesWidget } from '../../components/ultimas-operaciones-widget/ultimas-operaciones-widget';
import { CapacidadZonaWidget } from '../../components/capacidad-zona-widget/capacidad-zona-widget';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCard,
    MovimientosAreaChart,
    ProporcionDonutChart,
    StockAlertsWidget,
    TopProductsChart,
    UltimasOperacionesWidget,
    CapacidadZonaWidget
  ],
  templateUrl: './main-dashboard.html'
})
export class MainDashboard implements OnInit, OnDestroy {
  private api = inject(DashboardApiService);
  private ws = inject(WebSocketService);
  private destroy$ = new Subject<void>();

  kpis = signal<DashboardKpi[]>([]);
  stockAlerts = signal<StockAlert[]>([]);
  movements = signal<MovementPoint[]>([]);
  proporciones = signal<TipoProporcion[]>([]);
  operations = signal<Operation[]>([]);
  zoneCapacities = signal<ZoneCapacity[]>([]);
  topProducts = signal<ProductTop[]>([]);

  loading = signal(true);

  ngOnInit() {
    this.loadAllData();
    this.subscribeWebSocket();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllData() {
    this.loading.set(true);
    this.loadedCount = 0;

    this.api.getKpis().subscribe(k => {
      this.kpis.set(k);
      this.checkLoading();
    });
    this.api.getStockAlerts().subscribe(a => {
      this.stockAlerts.set(a);
      this.checkLoading();
    });
    this.api.getMovementsByTime().subscribe(m => {
      this.movements.set(m);
      this.checkLoading();
    });
    this.api.getProporcionPorTipo().subscribe(p => {
      this.proporciones.set(p);
      this.checkLoading();
    });
    this.api.getRecentOperations().subscribe(o => {
      this.operations.set(o);
      this.checkLoading();
    });
    this.api.getZoneCapacities().subscribe(z => {
      this.zoneCapacities.set(z);
      this.checkLoading();
    });
    this.api.getTopProducts().subscribe(p => {
      this.topProducts.set(p);
      this.checkLoading();
    });
  }

  private loadedCount = 0;

  private checkLoading() {
    this.loadedCount++;
    if (this.loadedCount >= 7) {
      this.loading.set(false);
    }
  }

  private subscribeWebSocket() {
    this.ws.onMovement().pipe(takeUntil(this.destroy$)).subscribe(evt => {
      const newOp: Operation = {
        id: 'MOV-' + Date.now().toString().slice(-4),
        type: evt.tipo,
        product: 'Producto #' + evt.productId.slice(0, 6),
        date: new Date().toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        user: 'Sistema',
        status: 'COMPLETADO'
      };
      this.operations.update(ops => [newOp, ...ops.slice(0, 9)]);

      this.kpis.update(current => current.map(kpi => {
        if (kpi.id === 'total-inventario') {
          const newVal = kpi.value + evt.cantidad;
          const formatted = newVal >= 1000 ? newVal.toLocaleString() : String(newVal);
          return { ...kpi, value: newVal, formattedValue: formatted, sparkline: [...kpi.sparkline.slice(1), newVal] };
        }
        if (kpi.id === 'ordenes-pendientes' && evt.tipo === 'SALIDA') {
          const newVal = kpi.value + 1;
          return { ...kpi, value: newVal, formattedValue: String(newVal), sparkline: [...kpi.sparkline.slice(1), newVal] };
        }
        return kpi;
      }));
    });

    this.ws.onStockAlert().pipe(takeUntil(this.destroy$)).subscribe(evt => {
      const alerta: StockAlert = {
        sku: evt.productId.slice(0, 7),
        name: 'Producto en alerta',
        stock: evt.currentStock,
        status: evt.currentStock <= 0 ? 'Crítico' : 'Bajo',
        costoPromedio: 0
      };
      this.stockAlerts.update(alerts => {
        const existingIdx = alerts.findIndex(a => a.sku === alerta.sku);
        if (existingIdx >= 0) {
          const updated = [...alerts];
          updated[existingIdx] = alerta;
          return updated;
        }
        return [alerta, ...alerts];
      });

      const totalAlerts = this.stockAlerts().filter(a => a.status === 'Crítico').length;
      this.kpis.update(current => current.map(kpi => {
        if (kpi.id === 'alertas-stock') {
          const newVal = totalAlerts;
          return { ...kpi, value: newVal, formattedValue: String(newVal), sparkline: [...kpi.sparkline.slice(1), newVal] };
        }
        return kpi;
      }));
    });
  }
}
