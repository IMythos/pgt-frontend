import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PickingOrder, PickingRoute, CreatePickingOrderPayload } from '../models/picking.model';

@Injectable({ providedIn: 'root' })
export class PickingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/picking/orders`;

  listar(estado?: string): Observable<PickingOrder[]> {
    const params = estado ? `?estado=${estado}` : '';
    const url = `${this.baseUrl}${params}`;
    console.log('[PickingApi] GET', url);
    return this.http.get<{ data: PickingOrder[] }>(url).pipe(
      tap({ next: (r) => console.log('[PickingApi] Órdenes recibidas:', r.data?.length ?? 0) }),
      map((r) => r.data),
    );
  }

  obtener(id: string): Observable<PickingOrder> {
    return this.http.get<{ data: PickingOrder }>(`${this.baseUrl}/${id}`).pipe(map((r) => r.data));
  }

  crear(payload: CreatePickingOrderPayload): Observable<PickingOrder> {
    return this.http.post<{ data: PickingOrder }>(this.baseUrl, payload).pipe(map((r) => r.data));
  }

  asignar(id: string, usuarioPickingId: number): Observable<PickingOrder> {
    return this.http
      .patch<{ data: PickingOrder }>(`${this.baseUrl}/${id}/assign`, { usuarioPickingId })
      .pipe(map((r) => r.data));
  }

  completar(id: string, usuarioId: number, ipOrigen?: string): Observable<PickingOrder> {
    return this.http
      .patch<{ data: PickingOrder }>(`${this.baseUrl}/${id}/complete`, { usuarioId, ipOrigen })
      .pipe(map((r) => r.data));
  }

  optimizar(id: string): Observable<PickingRoute> {
    return this.http
      .post<{ data: PickingRoute }>(`${this.baseUrl}/${id}/optimize`, {})
      .pipe(map((r) => r.data));
  }

  obtenerRuta(id: string): Observable<PickingRoute> {
    return this.http
      .get<{ data: PickingRoute }>(`${this.baseUrl}/${id}/route`)
      .pipe(map((r) => r.data));
  }
}
