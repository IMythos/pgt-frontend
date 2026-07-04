import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocationDto } from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/locations`;

  listarActivas(): Observable<LocationDto[]> {
    console.debug('[LocationApi] GET', this.baseUrl);
    return this.http.get<{ data: LocationDto[] }>(this.baseUrl).pipe(
      tap({
        next: (res) => console.debug('[LocationApi] respuesta completa:', JSON.stringify(res).slice(0, 2000)),
        error: (err) => console.error('[LocationApi] ERROR - status:', err.status, 'body:', err.error, 'mensaje:', err.message)
      }),
      map(response => response.data)
    );
  }
}
