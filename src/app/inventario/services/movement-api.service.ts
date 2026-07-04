import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../shared/models/paginated-response';
import {
  MovimientoListadoDto,
  RegistrarMovimientoRequest,
  FiltroMovimientoDto
} from '../models/movement.model';

@Injectable({
  providedIn: 'root'
})
export class MovementApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/movimientos`;

  listar(filtros: FiltroMovimientoDto = {}): Observable<PagedResponse<MovimientoListadoDto>> {
    const params = this.construirParams({ pagina: 0, tamanioPagina: 50, ...filtros });
    return this.http.get<PagedResponse<MovimientoListadoDto>>(this.baseUrl, { params });
  }

  obtenerPorId(id: string): Observable<MovimientoListadoDto> {
    return this.http.get<MovimientoListadoDto>(`${this.baseUrl}/${id}`);
  }

  registrar(payload: RegistrarMovimientoRequest): Observable<void> {
    console.debug('[MovementApi] POST', this.baseUrl, JSON.stringify(payload));
    return this.http.post<void>(this.baseUrl, payload).pipe(
      tap({
        error: (err) => console.error('[MovementApi] ERROR - status:', err.status, 'body:', JSON.stringify(err.error).slice(0, 2000), 'mensaje:', err.message)
      })
    );
  }

  anular(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private construirParams(filtros: FiltroMovimientoDto): HttpParams {
    let params = new HttpParams();
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.idProducto) params = params.set('idProducto', filtros.idProducto);
    if (filtros.texto) params = params.set('texto', filtros.texto);
    if (filtros.pagina !== undefined) params = params.set('pagina', filtros.pagina);
    if (filtros.tamanioPagina !== undefined) params = params.set('tamanioPagina', filtros.tamanioPagina);
    return params;
  }
}
