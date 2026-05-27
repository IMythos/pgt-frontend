import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import {
  AdminAccount,
  AdminApiService,
  AdminRole,
  AdminUser,
  CreateAdminUserPayload,
} from '../../services/admin-api.service';

type AdminTab = 'users' | 'roles';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome implements OnInit {
  private readonly adminApi = inject(AdminApiService);

  activeTab = signal<AdminTab>('users');
  loading = signal(false);
  savingUser = signal(false);
  savingRole = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  searchTerm = signal('');

  users = signal<AdminUser[]>([]);
  roles = signal<AdminRole[]>([]);
  accounts = signal<AdminAccount[]>([]);

  userForm = signal({
    firstName: '',
    lastName: '',
    dni: '',
    username: '',
    password: '',
    headquarterId: 1,
    roleName: '',
  });

  roleName = signal('');

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

          if (!this.userForm().roleName && roles.length > 0) {
            this.updateUserForm('roleName', roles[0].name);
          }
        },
        error: (error) => {
          console.error('Error cargando administracion:', error);
          this.errorMessage.set('No se pudo cargar administracion. Verifica tu sesion y el backend.');
        },
      });
  }

  setTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateUserForm<K extends keyof ReturnType<typeof this.userForm>>(
    field: K,
    value: ReturnType<typeof this.userForm>[K],
  ): void {
    this.userForm.update((form) => ({ ...form, [field]: value }));
  }

  createUser(): void {
    const form = this.userForm();
    this.clearMessages();

    if (!form.firstName || !form.lastName || !form.dni || !form.username || !form.password || !form.roleName) {
      this.errorMessage.set('Completa los datos requeridos del usuario.');
      return;
    }

    if (!/^\d{8}$/.test(form.dni)) {
      this.errorMessage.set('El DNI debe tener 8 digitos.');
      return;
    }

    const payload: CreateAdminUserPayload = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      roleName: form.roleName.trim(),
      headquarterId: Number(form.headquarterId),
    };

    this.savingUser.set(true);
    this.adminApi
      .createUser(payload)
      .pipe(finalize(() => this.savingUser.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Usuario creado correctamente.');
          this.resetUserForm();
          this.loadAdminData();
        },
        error: (error) => {
          console.error('Error creando usuario:', error);
          this.errorMessage.set(error.error?.message ?? 'No se pudo crear el usuario.');
        },
      });
  }

  createRole(): void {
    const name = this.roleName().trim();
    this.clearMessages();

    if (!name) {
      this.errorMessage.set('Escribe el nombre del rol.');
      return;
    }

    this.savingRole.set(true);
    this.adminApi
      .createRole(name)
      .pipe(finalize(() => this.savingRole.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Rol creado correctamente.');
          this.roleName.set('');
          this.loadAdminData();
        },
        error: (error) => {
          console.error('Error creando rol:', error);
          this.errorMessage.set(error.error?.message ?? 'No se pudo crear el rol.');
        },
      });
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

  private resetUserForm(): void {
    this.userForm.set({
      firstName: '',
      lastName: '',
      dni: '',
      username: '',
      password: '',
      headquarterId: 1,
      roleName: this.roles()[0]?.name ?? '',
    });
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
