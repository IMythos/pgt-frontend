export interface AdminRole {
  id: number;
  name: string;
  createdAt: string | null;
}

export interface AdminUser {
  uuid: string;
  firstName: string;
  lastName: string;
  dni: string;
  roles: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminAccount {
  uuid: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  active: boolean;
  headquarterId: number | null;
  createdAt: string | null;
}

export interface CreateAdminUserPayload {
  firstName: string;
  lastName: string;
  dni: string;
  username: string;
  password: string;
  headquarterId: number;
  roleName: string;
}
