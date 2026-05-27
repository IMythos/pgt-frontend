import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KardexDto, FiltroKardexDto } from '../models/kardex.model';
import { MOCK_KARDEX } from './kardex-mock.data';

@Injectable({
  providedIn: 'root',
})
export class KardexApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/kardex`;
  private readonly mockMode = true;

  listar(filtros: FiltroKardexDto = {}): Observable<KardexDto[]> {
    if (this.mockMode) {
      let filtered = [...MOCK_KARDEX];
      if (filtros.tipoMovimiento)
        filtered = filtered.filter((k) => k.tipoMovimiento === filtros.tipoMovimiento);
      if (filtros.fechaDesde)
        filtered = filtered.filter((k) => new Date(k.fecha) >= new Date(filtros.fechaDesde!));
      if (filtros.fechaHasta)
        filtered = filtered.filter((k) => new Date(k.fecha) <= new Date(filtros.fechaHasta!));
      if (filtros.idProducto)
        filtered = filtered.filter((k) => k.idProducto === filtros.idProducto);
      return of(filtered).pipe(delay(350));
    }
    return this.http.get<KardexDto[]>(this.baseUrl, {
      params: this.construirParams(filtros),
    });
  }

  obtenerPorProducto(idProducto: string): Observable<KardexDto[]> {
    if (this.mockMode) {
      const filtered = MOCK_KARDEX.filter((k) => k.idProducto === idProducto);
      return of(filtered).pipe(delay(300));
    }
    return this.http.get<KardexDto[]>(`${this.baseUrl}/${idProducto}`);
  }

  exportar(formato: 'excel' | 'pdf'): Observable<Blob> {
    const exportUrl = `${environment.apiUrl}/v1/kardex/export?format=${formato.toUpperCase()}`;
    return this.http.get(exportUrl, { responseType: 'blob' });
  }

  private construirParams(filtros: FiltroKardexDto): HttpParams {
    let params = new HttpParams();
    if (filtros.idProducto) params = params.set('idProducto', filtros.idProducto);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.tipoMovimiento) params = params.set('tipoMovimiento', filtros.tipoMovimiento);
    if (filtros.pagina !== undefined) params = params.set('pagina', filtros.pagina);
    if (filtros.tamanioPagina !== undefined)
      params = params.set('tamanioPagina', filtros.tamanioPagina);
    return params;
  }
}
