import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from '../../shared/models/paginated-response';
import { KardexDto, FiltroKardexDto } from '../models/kardex.model';

@Injectable({
  providedIn: 'root',
})
export class KardexApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/kardex`;
  listar(filtros: FiltroKardexDto = {}): Observable<PagedResponse<KardexDto>> {
    const params = this.construirParams({ pagina: 0, tamanioPagina: 50, ...filtros });
    return this.http.get<PagedResponse<KardexDto>>(this.baseUrl, {
      params,
    });
  }
  obtenerPorProducto(idProducto: string, filtros: FiltroKardexDto = {}): Observable<PagedResponse<KardexDto>> {
    const params = this.construirParams({ pagina: 0, tamanioPagina: 50, ...filtros });
    return this.http.get<PagedResponse<KardexDto>>(`${this.baseUrl}/${idProducto}`, { params });
  }
  exportar(formato: 'excel' | 'pdf', metodoCosto: string = 'PPP'): Observable<Blob> {
    const params = new HttpParams()
      .set('format', formato.toUpperCase())
      .set('metodoCosto', metodoCosto);
    const exportUrl = `${environment.apiUrl}/v1/kardex/export`;
    return this.http.get(exportUrl, { params, responseType: 'blob' });
  }

  private construirParams(filtros: FiltroKardexDto): HttpParams {
    let params = new HttpParams();
    if (filtros.idProducto) params = params.set('idProducto', filtros.idProducto);
    if (filtros.pagina !== undefined) params = params.set('pagina', filtros.pagina);
    if (filtros.tamanioPagina !== undefined) params = params.set('tamanioPagina', filtros.tamanioPagina);
    if (filtros.tipoMovimiento) params = params.set('tipoMovimiento', filtros.tipoMovimiento);
    if (filtros.metodoCosto) params = params.set('metodoCosto', filtros.metodoCosto);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    return params;
  }
}