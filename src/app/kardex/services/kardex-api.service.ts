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
  private readonly baseUrl = `${environment.apiUrl}/v1/kardex`;
  listar(filtros: FiltroKardexDto = {}): Observable<KardexDto[]> {
    return this.http.get<KardexDto[]>(this.baseUrl, {
      params: this.construirParams(filtros),
    });
  }
  obtenerPorProducto(idProducto: string): Observable<KardexDto[]> {
    return this.http.get<KardexDto[]>(`${this.baseUrl}/${idProducto}`);
  }
  exportar(formato: 'excel' | 'pdf'): Observable<Blob> {
    const exportUrl = `${environment.apiUrl}/v1/kardex/export?format=${formato.toUpperCase()}`;
    return this.http.get(exportUrl, { responseType: 'blob' });
  }
  private construirParams(filtros: FiltroKardexDto): HttpParams {
    let params = new HttpParams();
    if (filtros.idProducto) params = params.set('idProducto', filtros.idProducto);
    if (filtros.tipoMovimiento) params = params.set('tipoMovimiento', filtros.tipoMovimiento);
    return params;
  }
}