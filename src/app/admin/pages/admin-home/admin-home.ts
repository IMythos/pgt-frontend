import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AdminApiService } from '../../services/admin-api.service';
import {
  AdminAccount, AdminLocation, AdminRole, AdminUser, AdminWarehouse,
  UpdateAdminUserPayload,
} from '../../models/admin.models';
import { AdminCreateUserModal } from './components/admin-create-user-modal/admin-create-user-modal';
import { AdminEditUserModal } from './components/admin-edit-user-modal/admin-edit-user-modal';
import { AdminEditRoleModal } from './components/admin-edit-role-modal/admin-edit-role-modal';
import { AdminWarehouseModal } from './components/admin-warehouse-modal/admin-warehouse-modal';
import { AdminLocationModal } from './components/admin-location-modal/admin-location-modal';
import { Btn } from '../../../shared/components/btn/btn';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

type AdminTab = 'users' | 'roles' | 'warehouses' | 'locations';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, FormsModule, AdminCreateUserModal, AdminEditUserModal,
    AdminEditRoleModal, AdminWarehouseModal, AdminLocationModal, Btn, Pagination, ConfirmDialog],
  templateUrl: './admin-home.html',
  styles: [`
    button:not(:disabled) { cursor: pointer; }
  `],
})
export class AdminHome implements OnInit {
  readonly skeletonRows = [0, 1, 2, 3, 4];
  private readonly adminApi = inject(AdminApiService);

  activeTab = signal<AdminTab>('users');
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  searchTerm = signal('');

  // ── Modal signals ──
  showCreateUserModal = signal(false);
  showEditUserModal = signal(false);
  showEditRoleModal = signal(false);
  showWarehouseModal = signal(false);
  showLocationModal = signal(false);
  showConfirmDelete = signal(false);

  // ── Data signals ──
  users = signal<AdminUser[]>([]);
  roles = signal<AdminRole[]>([]);
  accounts = signal<AdminAccount[]>([]);
  warehouses = signal<AdminWarehouse[]>([]);
  locations = signal<AdminLocation[]>([]);

  // ── Selected items for modals ──
  selectedUser = signal<AdminUser | null>(null);
  selectedRole = signal<AdminRole | null>(null);
  selectedWarehouse = signal<AdminWarehouse | null>(null);
  selectedLocation = signal<AdminLocation | null>(null);
  deleteTarget = signal<{ type: string; label: string } | null>(null);
  roleToDelete = signal<AdminRole | null>(null);

  // ── Pagination ──
  page = signal(0);
  pageSize = 10;

  // ── Users computed ──
  accountsByName = computed(() => {
    const map = new Map<string, AdminAccount>();
    for (const account of this.accounts()) {
      const key = `${account.firstName ?? ''}|${account.lastName ?? ''}`.toLowerCase();
      map.set(key, account);
    }
    return map;
  });

  filteredUsers = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.users();
    return this.users().filter((user) => {
      const searchable = [
        user.firstName, user.lastName, user.dni,
        user.roles.join(' '),
        this.accountForUser(user)?.username ?? '',
      ].join(' ').toLowerCase();
      return searchable.includes(query);
    });
  });

  paginatedUsers = computed(() => {
    const start = this.page() * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  activeAccountsCount = computed(() => this.accounts().filter((a) => a.active).length);
  inactiveAccountsCount = computed(() => this.accounts().filter((a) => !a.active).length);

  // ── Warehouses computed ──
  filteredWarehouses = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    if (!q) return this.warehouses();
    return this.warehouses().filter((w) =>
      [w.codAlm, w.nombre, w.tipo].join(' ').toLowerCase().includes(q)
    );
  });

  // ── Locations computed ──
  warehouseNames = computed(() => {
    const map = new Map<number, string>();
    for (const w of this.warehouses()) map.set(w.id, w.nombre);
    return map;
  });

  filteredLocations = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    if (!q) return this.locations();
    return this.locations().filter((l) =>
      [l.codBarras, l.zona, l.pasillo, l.estante].join(' ').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      users: this.adminApi.listUsers(),
      roles: this.adminApi.listRoles(),
      accounts: this.adminApi.listAccounts(),
      warehouses: this.adminApi.listWarehouses(),
      locations: this.adminApi.listLocations(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ users, roles, accounts, warehouses, locations }) => {
          this.users.set(users);
          this.roles.set(roles);
          this.accounts.set(accounts);
          this.warehouses.set(warehouses);
          this.locations.set(locations);
        },
        error: () => {
          this.errorMessage.set('No se pudo cargar administración. Verifica tu sesión y el backend.');
        },
      });
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    this.page.set(0);
    this.searchTerm.set('');
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
    this.page.set(0);
  }

  // ── Users ──

  onUserCreated(): void {
    this.showCreateUserModal.set(false);
    this.successMessage.set('Usuario creado correctamente.');
    this.loadAdminData();
  }

  openEditUser(user: AdminUser): void {
    this.selectedUser.set(user);
    this.showEditUserModal.set(true);
  }

  onUserUpdated(): void {
    this.showEditUserModal.set(false);
    this.selectedUser.set(null);
    this.successMessage.set('Usuario actualizado correctamente.');
    this.loadAdminData();
  }

  confirmDeleteUser(user: AdminUser): void {
    this.selectedUser.set(user);
    this.deleteTarget.set({ type: 'user', label: `${user.firstName} ${user.lastName}` });
    this.showConfirmDelete.set(true);
  }

  onDeleteConfirmed(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.showConfirmDelete.set(false);

    if (target.type === 'user') {
      const user = this.selectedUser();
      if (!user) return;
      this.adminApi.deleteUser(user.uuid).subscribe({
        next: () => {
          this.successMessage.set(`Usuario ${target.label} eliminado.`);
          this.loadAdminData();
        },
        error: () => this.errorMessage.set('No se pudo eliminar el usuario.'),
      });
    } else if (target.type === 'role') {
      const role = this.roleToDelete();
      if (!role) return;
      this.adminApi.deleteRole(role.id).subscribe({
        next: () => {
          this.successMessage.set(`Rol "${target.label}" eliminado.`);
          this.loadAdminData();
        },
        error: () => this.errorMessage.set('No se pudo eliminar el rol.'),
      });
    } else if (target.type === 'warehouse') {
      const wh = this.selectedWarehouse();
      if (!wh) return;
      this.adminApi.deleteWarehouse(wh.id).subscribe({
        next: () => {
          this.successMessage.set(`Almacén "${target.label}" eliminado.`);
          this.loadAdminData();
        },
        error: () => this.errorMessage.set('No se pudo eliminar el almacén.'),
      });
    } else if (target.type === 'location') {
      const loc = this.selectedLocation();
      if (!loc) return;
      this.adminApi.deleteLocation(loc.idLocacion).subscribe({
        next: () => {
          this.successMessage.set(`Ubicación "${target.label}" eliminada.`);
          this.loadAdminData();
        },
        error: () => this.errorMessage.set('No se pudo eliminar la ubicación.'),
      });
    }
    this.deleteTarget.set(null);
  }

  toggleAccount(account: AdminAccount): void {
    this.clearMessages();
    this.adminApi.updateAccountStatus(account.uuid, account.headquarterId, !account.active).subscribe({
      next: () => {
        this.successMessage.set(account.active ? 'Cuenta desactivada.' : 'Cuenta activada.');
        this.loadAdminData();
      },
      error: () => this.errorMessage.set('No se pudo actualizar el estado de la cuenta.'),
    });
  }

  accountForUser(user: AdminUser): AdminAccount | undefined {
    const key = `${user.firstName ?? ''}|${user.lastName ?? ''}`.toLowerCase();
    return this.accountsByName().get(key);
  }

  // ── Roles ──

  createRole(): void {
    const name = prompt('Nombre del nuevo rol:');
    if (!name?.trim()) return;
    this.adminApi.createRole(name.trim()).subscribe({
      next: () => {
        this.successMessage.set('Rol creado correctamente.');
        this.loadAdminData();
      },
      error: () => this.errorMessage.set('No se pudo crear el rol.'),
    });
  }

  openEditRole(role: AdminRole): void {
    this.selectedRole.set(role);
    this.showEditRoleModal.set(true);
  }

  onRoleUpdated(): void {
    this.showEditRoleModal.set(false);
    this.selectedRole.set(null);
    this.successMessage.set('Rol actualizado correctamente.');
    this.loadAdminData();
  }

  confirmDeleteRole(role: AdminRole): void {
    this.roleToDelete.set(role);
    this.deleteTarget.set({ type: 'role', label: role.name });
    this.showConfirmDelete.set(true);
  }

  // ── Warehouses ──

  openCreateWarehouse(): void {
    this.selectedWarehouse.set(null);
    this.showWarehouseModal.set(true);
  }

  openEditWarehouse(wh: AdminWarehouse): void {
    this.selectedWarehouse.set(wh);
    this.showWarehouseModal.set(true);
  }

  onWarehouseSaved(): void {
    this.showWarehouseModal.set(false);
    this.selectedWarehouse.set(null);
    this.successMessage.set('Almacén guardado correctamente.');
    this.loadAdminData();
  }

  confirmDeleteWarehouse(wh: AdminWarehouse): void {
    this.selectedWarehouse.set(wh);
    this.deleteTarget.set({ type: 'warehouse', label: wh.nombre });
    this.showConfirmDelete.set(true);
  }

  // ── Locations ──

  openCreateLocation(): void {
    this.selectedLocation.set(null);
    this.showLocationModal.set(true);
  }

  openEditLocation(loc: AdminLocation): void {
    this.selectedLocation.set(loc);
    this.showLocationModal.set(true);
  }

  onLocationSaved(): void {
    this.showLocationModal.set(false);
    this.selectedLocation.set(null);
    this.successMessage.set('Ubicación guardada correctamente.');
    this.loadAdminData();
  }

  confirmDeleteLocation(loc: AdminLocation): void {
    this.selectedLocation.set(loc);
    this.deleteTarget.set({ type: 'location', label: loc.codBarras });
    this.showConfirmDelete.set(true);
  }

  // ── Helpers ──

  initials(user: AdminUser): string {
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'US';
  }

  formatDate(value: string | null): string {
    if (!value) return '-';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(value));
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
