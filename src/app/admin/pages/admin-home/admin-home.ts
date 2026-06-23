import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { AdminApiService } from '../../services/admin-api.service';
import { AdminAccount, AdminRole, AdminUser } from '../../models/admin.models';
import { AdminCreateUserModal } from './components/admin-create-user-modal/admin-create-user-modal';

type AdminTab = 'users' | 'roles';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, FormsModule, AdminCreateUserModal],
  templateUrl: './admin-home.html',
})
export class AdminHome implements OnInit {
  readonly Math = Math;
  readonly skeletonRows = [0, 1, 2, 3, 4];
  private readonly adminApi = inject(AdminApiService);

  activeTab = signal<AdminTab>('users');
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  searchTerm = signal('');

  showCreateUserModal = signal(false);

  users = signal<AdminUser[]>([]);
  roles = signal<AdminRole[]>([]);
  accounts = signal<AdminAccount[]>([]);

  page = signal(1);
  pageSize = 10;

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
        user.firstName,
        user.lastName,
        user.dni,
        user.roles.join(' '),
        this.accountForUser(user)?.username ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  pageButtons = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  paginatedUsers = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  activeAccountsCount = computed(() => this.accounts().filter((account) => account.active).length);
  inactiveAccountsCount = computed(() => this.accounts().filter((account) => !account.active).length);

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
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ users, roles, accounts }) => {
          this.users.set(users);
          this.roles.set(roles);
          this.accounts.set(accounts);
        },
        error: (error) => {
          console.error('Error cargando administracion:', error);
          this.errorMessage.set('No se pudo cargar administracion. Verifica tu sesion y el backend.');
        },
      });
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    this.page.set(1);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
    this.page.set(1);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages()) {
      this.page.set(p);
    }
  }

  onUserCreated(): void {
    this.showCreateUserModal.set(false);
    this.successMessage.set('Usuario creado correctamente.');
    this.loadAdminData();
  }

  toggleAccount(account: AdminAccount): void {
    this.clearMessages();
    this.adminApi.updateAccountStatus(account.uuid, account.headquarterId, !account.active).subscribe({
      next: () => {
        this.successMessage.set(account.active ? 'Cuenta desactivada.' : 'Cuenta activada.');
        this.loadAdminData();
      },
      error: (error) => {
        console.error('Error actualizando cuenta:', error);
        this.errorMessage.set('No se pudo actualizar el estado de la cuenta.');
      },
    });
  }

  accountForUser(user: AdminUser): AdminAccount | undefined {
    const key = `${user.firstName ?? ''}|${user.lastName ?? ''}`.toLowerCase();
    return this.accountsByName().get(key);
  }

  initials(user: AdminUser): string {
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'US';
  }

  formatDate(value: string | null): string {
    if (!value) return '-';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
