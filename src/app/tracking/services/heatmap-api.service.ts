import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  HeatmapAlmacenDto,
  HeatmapLocationDetailDto,
} from '../models/heatmap.model';

@Injectable({
  providedIn: 'root',
})
export class HeatmapApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/heatmap`;

  obtenerPorAlmacen(almacenId: number): Observable<HeatmapAlmacenDto> {
    return this.http
      .get<{ data: HeatmapAlmacenDto }>(`${this.baseUrl}/almacen/${almacenId}`)
      .pipe(map(response => response.data));
  }

  obtenerDetalleLocacion(
    locacionId: string
  ): Observable<HeatmapLocationDetailDto> {
    return this.http
      .get<{ data: HeatmapLocationDetailDto }>(
        `${this.baseUrl}/location/${locacionId}`
      )
      .pipe(map(response => response.data));
  }
}
