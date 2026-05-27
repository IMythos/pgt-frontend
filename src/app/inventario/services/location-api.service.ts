import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LocationDto } from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/locations`;

  listarActivas(): Observable<LocationDto[]> {
    return this.http.get<{ data: LocationDto[] }>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }
}
