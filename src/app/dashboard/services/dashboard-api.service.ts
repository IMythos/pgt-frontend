import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DashboardKpi, StockAlert, MovementPoint, TipoProporcion, Operation, ZoneCapacity, ProductTop } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  getKpis(): Observable<DashboardKpi[]> {
    return of([
      {
        id: 'total-inventario',
        title: 'Total Inventario',
        value: 12450,
        formattedValue: '12,450',
        trend: 5.2,
        trendLabel: '+5.2%',
        isPositive: true,
        icon: 'box',
        sparkline: [11200, 11500, 11800, 12000, 11900, 12200, 12450]
      },
      {
        id: 'ordenes-pendientes',
        title: 'Órdenes Pendientes',
        value: 34,
        formattedValue: '34',
        trend: -2.1,
        trendLabel: '-2.1%',
        isPositive: false,
        icon: 'clipboard',
        sparkline: [42, 38, 40, 36, 35, 33, 34]
      },
      {
        id: 'alertas-stock',
        title: 'Alertas de Stock',
        value: 8,
        formattedValue: '8',
        trend: 1.5,
        trendLabel: '+1.5%',
        isPositive: false,
        icon: 'alert',
        sparkline: [5, 6, 4, 7, 8, 9, 8]
      },
      {
        id: 'valor-almacenado',
        title: 'Valor Almacenado',
        value: 145200,
        formattedValue: '$ 145.2K',
        trend: 12.4,
        trendLabel: '+12.4%',
        isPositive: true,
        icon: 'dollar',
        sparkline: [120, 125, 130, 135, 140, 142, 145]
      }
    ]).pipe(delay(400));
  }

  getStockAlerts(): Observable<StockAlert[]> {
    const alerts: StockAlert[] = [
      { sku: '902-11A', name: 'Válvula de Presión Hidráulica', stock: 2, status: 'Crítico', costoPromedio: 450.00 },
      { sku: '442-88B', name: 'Sensor de Temperatura PT100', stock: 5, status: 'Bajo', costoPromedio: 89.50 },
      { sku: '110-22X', name: 'Módulo PLC Expansión', stock: 1, status: 'Crítico', costoPromedio: 1250.00 },
      { sku: '331-77C', name: 'Rodamiento Industrial 6205', stock: 4, status: 'Bajo', costoPromedio: 25.75 },
      { sku: '550-33D', name: 'Cable Blindado 10m', stock: 3, status: 'Crítico', costoPromedio: 67.30 }
    ];
    return of(alerts).pipe(delay(300));
  }

  getMovementsByTime(): Observable<MovementPoint[]> {
    return of([
      { date: '2026-01-01', label: 'Ene', ingresos: 45, salidas: 38, ajustes: 3 },
      { date: '2026-02-01', label: 'Feb', ingresos: 52, salidas: 48, ajustes: 5 },
      { date: '2026-03-01', label: 'Mar', ingresos: 38, salidas: 42, ajustes: 2 },
      { date: '2026-04-01', label: 'Abr', ingresos: 65, salidas: 55, ajustes: 4 },
      { date: '2026-05-01', label: 'May', ingresos: 58, salidas: 61, ajustes: 3 }
    ]).pipe(delay(300));
  }

  getProporcionPorTipo(): Observable<TipoProporcion[]> {
    return of([
      { label: 'INGRESO', value: 45, color: '#34A853' },
      { label: 'SALIDA', value: 35, color: '#81000A' },
      { label: 'AJUSTE', value: 12, color: '#F5A623' },
      { label: 'PICKING', value: 8, color: '#4C616C' }
    ]).pipe(delay(300));
  }

  getRecentOperations(): Observable<Operation[]> {
    return of([
      { id: 'MOV-8901', type: 'INGRESO', product: 'Motor Servodrive 5HP', date: '28 Abr 2026 08:30 AM', user: 'Juan P.', status: 'COMPLETADO' },
      { id: 'MOV-8902', type: 'SALIDA', product: 'Sensor de Presión', date: '28 Abr 2026 09:15 AM', user: 'Diego M.', status: 'COMPLETADO' },
      { id: 'MOV-8903', type: 'AJUSTE', product: 'Controlador PLC', date: '28 Abr 2026 10:45 AM', user: 'Admin', status: 'REVISIÓN' },
      { id: 'MOV-8904', type: 'PICKING', product: 'Módulo de E/S', date: '28 Abr 2026 11:20 AM', user: 'Luis F.', status: 'PENDIENTE' },
      { id: 'MOV-8905', type: 'INGRESO', product: 'Cable Blindado 10m', date: '28 Abr 2026 12:00 PM', user: 'Ana R.', status: 'COMPLETADO' },
      { id: 'MOV-8906', type: 'SALIDA', product: 'Rodamiento 6205', date: '28 Abr 2026 01:30 PM', user: 'Juan P.', status: 'COMPLETADO' }
    ]).pipe(delay(300));
  }

  getZoneCapacities(): Observable<ZoneCapacity[]> {
    return of([
      { zone: 'Zona A - Almacén Central', used: 320, total: 400, percentage: 80 },
      { zone: 'Zona B - Almacén Central', used: 180, total: 250, percentage: 72 },
      { zone: 'Zona C - Almacén Central', used: 95, total: 150, percentage: 63 },
      { zone: 'Zona A - Almacén Norte', used: 200, total: 300, percentage: 67 },
      { zone: 'Zona B - Almacén Norte', used: 280, total: 350, percentage: 80 }
    ]).pipe(delay(300));
  }

  getTopProducts(): Observable<ProductTop[]> {
    return of([
      { name: 'Controlador PLC', value: 85 },
      { name: 'Sensor de Presión', value: 65 },
      { name: 'Módulo de E/S', value: 45 },
      { name: 'Cable Blindado', value: 55 },
      { name: 'Rodamiento 6205', value: 40 }
    ]).pipe(delay(300));
  }
}
