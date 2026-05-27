import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
  private readonly baseUrl = `${environment.apiUrl}/v1/movimientos`;

  listar(filtros: FiltroMovimientoDto = {}): Observable<MovimientoListadoDto[]> {
    return this.http.get<MovimientoListadoDto[]>(this.baseUrl, {
      params: this.construirParams(filtros)
    });
  }

  obtenerPorId(id: string): Observable<MovimientoListadoDto> {
    return this.http.get<MovimientoListadoDto>(`${this.baseUrl}/${id}`);
  }

  registrar(payload: RegistrarMovimientoRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, payload);
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
