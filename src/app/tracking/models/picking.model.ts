export interface PickingOrder {
  idOrden: string;
  usuarioPickingId: number;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  fecCreacion: string;
  fecInicio?: string;
  fecFin?: string;
  tipoSalida?: string;
  docRef?: string;
  detalles?: PickingItem[]; // <- Crucial para leer las cantidades
}

export interface PickingItem {
  idDetalle: string;
  productoId: string;
  locacionId: string;
  cantRequerida: number;
  cantSeleccion: number;
  estado: string;
}

export interface PickingRouteNode {
  id: string;
  x: number;
  y: number;
  label: string;
  tipo: string;
}

export interface PickingRoute {
  pathSeq: string[];
  distanciaEstimada: number;
  detalles?: PickingItem[]; // <- Crucial para el listado del trabajador
  nodes?: PickingRouteNode[]; // <- Grafo completo con coordenadas del backend
  pickingStops?: string[]; // <- Nodos que son paradas reales de picking
}

export interface CreatePickingOrderPayload {
  usuarioCreador: number;
  items: { productoId: string; locacionId: string; cantRequerida: number }[];
  tipoSalida?: string;
  docRef?: string;
}

export interface CrearOrdenDesdeSalidaPayload {
  docRef?: string;
  usuarioCreador?: number;
  // Agrega aquí cualquier otra propiedad exacta que usara tu endpoint
  [key: string]: any; 
}