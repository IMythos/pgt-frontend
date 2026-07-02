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

export interface UpdateAdminUserPayload {
  firstName: string;
  lastName: string;
  headquarterId: number;
  roleName: string;
}

export interface AdminWarehouse {
  id: number;
  idSede: number;
  almacenUuid: string;
  codAlm: string;
  nombre: string;
  tipo: string;
  activo: boolean;
}

export interface CreateWarehousePayload {
  idSede: number;
  codAlm: string;
  nombre: string;
  tipo?: string;
}

export interface UpdateWarehousePayload {
  codAlm?: string;
  nombre?: string;
  tipo?: string;
}

export interface AdminLocation {
  idLocacion: string;
  idAlmacen: number;
  zona: string;
  pasillo: string;
  estante: string;
  codBarras: string;
  capacidad: number;
  activo: boolean;
}

export interface CreateLocationPayload {
  idAlmacen: number;
  zona?: string;
  pasillo?: string;
  estante?: string;
  codBarras: string;
  capacidad?: number;
}

export interface UpdateLocationPayload {
  zona?: string;
  pasillo?: string;
  estante?: string;
  capacidad?: number;
}
