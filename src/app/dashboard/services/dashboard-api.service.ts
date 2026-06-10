import { inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DashboardKpi, StockAlert, MovementPoint, TipoProporcion, Operation, ZoneCapacity, ProductTop } from '../models/dashboard.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/dashboard`;

  getKpis(): Observable<DashboardKpi[]> {
    return this.http.get<DashboardKpi[]>(`${this.baseUrl}/kpis`);
  }

  getStockAlerts(): Observable<StockAlert[]> {
    return this.http.get<StockAlert[]>(`${this.baseUrl}/stock-alerts`);
  }

  getMovementsByTime(): Observable<MovementPoint[]> {
    return this.http.get<MovementPoint[]>(`${this.baseUrl}/movements-by-time`);
  }

  getProporcionPorTipo(): Observable<TipoProporcion[]> {
    return this.http.get<TipoProporcion[]>(`${this.baseUrl}/proporcion-por-tipo`);
  }

  getRecentOperations(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.baseUrl}/recent-operations`);
  }

  getZoneCapacities(): Observable<ZoneCapacity[]> {
    return this.http.get<ZoneCapacity[]>(`${this.baseUrl}/zone-capacities`);
  }

  getTopProducts(): Observable<ProductTop[]> {
    return this.http.get<ProductTop[]>(`${this.baseUrl}/top-products`);
  }
}
