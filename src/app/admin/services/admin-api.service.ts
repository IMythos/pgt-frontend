import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminAccount, AdminLocation, AdminRole, AdminUser, AdminWarehouse,
  CreateAdminUserPayload, CreateLocationPayload, CreateWarehousePayload,
  UpdateAdminUserPayload, UpdateLocationPayload, UpdateWarehousePayload,
} from '../models/admin.models';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;
  private readonly accountsUrl = `${environment.apiUrl}/accounts`;
  private readonly warehousesUrl = `${environment.apiUrl}/warehouses`;
  private readonly locationsUrl = `${environment.apiUrl}/locations`;

  // ── Users ──

  listUsers(): Observable<AdminUser[]> {
    return this.http
      .get<ApiResponse<AdminUser[]>>(this.usersUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getUser(uuid: string): Observable<AdminUser> {
    return this.http
      .get<ApiResponse<AdminUser>>(`${this.usersUrl}/${uuid}`)
      .pipe(map((response) => response.data));
  }

  createUser(payload: CreateAdminUserPayload): Observable<AdminAccount> {
    return this.http
      .post<ApiResponse<AdminAccount>>(this.usersUrl, payload)
      .pipe(map((response) => response.data));
  }

  updateUser(uuid: string, payload: UpdateAdminUserPayload): Observable<AdminUser> {
    return this.http
      .put<ApiResponse<AdminUser>>(`${this.usersUrl}/${uuid}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteUser(uuid: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.usersUrl}/${uuid}`)
      .pipe(map(() => undefined));
  }

  // ── Roles ──

  listRoles(): Observable<AdminRole[]> {
    return this.http
      .get<ApiResponse<AdminRole[]>>(this.rolesUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getRole(id: number): Observable<AdminRole> {
    return this.http
      .get<ApiResponse<AdminRole>>(`${this.rolesUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createRole(name: string): Observable<AdminRole> {
    return this.http
      .post<ApiResponse<AdminRole>>(this.rolesUrl, { name })
      .pipe(map((response) => response.data));
  }

  updateRole(id: number, name: string): Observable<AdminRole> {
    return this.http
      .put<ApiResponse<AdminRole>>(`${this.rolesUrl}/${id}`, { name })
      .pipe(map((response) => response.data));
  }

  deleteRole(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.rolesUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  // ── Accounts ──

  listAccounts(): Observable<AdminAccount[]> {
    return this.http
      .get<ApiResponse<AdminAccount[]>>(this.accountsUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getAccount(uuid: string): Observable<AdminAccount> {
    return this.http
      .get<ApiResponse<AdminAccount>>(`${this.accountsUrl}/${uuid}`)
      .pipe(map((response) => response.data));
  }

  updateAccountStatus(accountUuid: string, headquarterId: number | null, active: boolean): Observable<AdminAccount> {
    return this.http
      .put<ApiResponse<AdminAccount>>(`${this.accountsUrl}/${accountUuid}`, {
        headquarterId,
        active,
      })
      .pipe(map((response) => response.data));
  }

  deleteAccount(uuid: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.accountsUrl}/${uuid}`)
      .pipe(map(() => undefined));
  }

  // ── Warehouses ──

  listWarehouses(): Observable<AdminWarehouse[]> {
    return this.http
      .get<ApiResponse<AdminWarehouse[]>>(this.warehousesUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getWarehouse(id: number): Observable<AdminWarehouse> {
    return this.http
      .get<ApiResponse<AdminWarehouse>>(`${this.warehousesUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createWarehouse(payload: CreateWarehousePayload): Observable<AdminWarehouse> {
    return this.http
      .post<ApiResponse<AdminWarehouse>>(this.warehousesUrl, payload)
      .pipe(map((response) => response.data));
  }

  updateWarehouse(id: number, payload: UpdateWarehousePayload): Observable<AdminWarehouse> {
    return this.http
      .put<ApiResponse<AdminWarehouse>>(`${this.warehousesUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteWarehouse(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.warehousesUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  // ── Locations ──

  listLocations(): Observable<AdminLocation[]> {
    return this.http
      .get<ApiResponse<AdminLocation[]>>(this.locationsUrl)
      .pipe(map((response) => response.data ?? []));
  }

  getLocation(id: string): Observable<AdminLocation> {
    return this.http
      .get<ApiResponse<AdminLocation>>(`${this.locationsUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createLocation(payload: CreateLocationPayload): Observable<AdminLocation> {
    return this.http
      .post<ApiResponse<AdminLocation>>(this.locationsUrl, payload)
      .pipe(map((response) => response.data));
  }

  updateLocation(id: string, payload: UpdateLocationPayload): Observable<AdminLocation> {
    return this.http
      .put<ApiResponse<AdminLocation>>(`${this.locationsUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteLocation(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.locationsUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
