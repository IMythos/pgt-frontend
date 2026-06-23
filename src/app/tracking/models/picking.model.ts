export interface PickingOrder {
  idOrden: string;
  usuarioPickingId: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  fecCreacion: string;
  fecInicio?: string;
  fecFin?: string;
  tipoSalida?: string;
  docRef?: string;
}

export interface PickingItem {
  idDetalle: string;
  productoId: string;
  locacionId: string;
  cantRequerida: number;
  cantSeleccion: number;
  estado: string;
}

export interface PickingRoute {
  pathSeq: string[];
  distanciaEstimada: number;
}

export interface CreatePickingOrderPayload {
  usuarioCreador: number;
  items: { productoId: string; locacionId: string; cantRequerida: number }[];
  tipoSalida?: string;
  docRef?: string;
}
