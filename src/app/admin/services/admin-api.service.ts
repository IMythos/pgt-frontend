import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminAccount, AdminRole, AdminUser, CreateAdminUserPayload } from '../models/admin.models';

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
  private readonly usersUrl = `${environment.apiUrl}/v1/users`;
  private readonly rolesUrl = `${environment.apiUrl}/v1/roles`;
  private readonly accountsUrl = `${environment.apiUrl}/v1/accounts`;

  listUsers(): Observable<AdminUser[]> {
    return this.http
      .get<ApiResponse<AdminUser[]>>(this.usersUrl)
      .pipe(map((response) => response.data ?? []));
  }

  listRoles(): Observable<AdminRole[]> {
    return this.http
      .get<ApiResponse<AdminRole[]>>(this.rolesUrl)
      .pipe(map((response) => response.data ?? []));
  }

  listAccounts(): Observable<AdminAccount[]> {
    return this.http
      .get<ApiResponse<AdminAccount[]>>(this.accountsUrl)
      .pipe(map((response) => response.data ?? []));
  }

  createUser(payload: CreateAdminUserPayload): Observable<AdminAccount> {
    return this.http
      .post<ApiResponse<AdminAccount>>(this.usersUrl, payload)
      .pipe(map((response) => response.data));
  }

  createRole(name: string): Observable<AdminRole> {
    return this.http
      .post<ApiResponse<AdminRole>>(this.rolesUrl, { name })
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
}
