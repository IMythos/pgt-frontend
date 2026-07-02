import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WarehouseDto } from '../models/warehouse.model';

@Injectable({
  providedIn: 'root',
})
export class WarehouseApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/warehouses`;

  listar(): Observable<WarehouseDto[]> {
    return this.http.get<{ data: WarehouseDto[] }>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }
}
