export type TipoMovimiento = 'INGRESO' | 'SALIDA' | 'AJUSTE' | 'AJUSTE_NEGATIVO';

export interface MovimientoListadoDto {
  idMovimiento: string;
  tipo: TipoMovimiento;
  fecha: string;
  motivo: string;
  documentoRef: string;
  nroLote: string;
  producto: string;
  sku: string;
  cantidadIngreso: number;
  cantidadSalida: number;
  stockActual: number;
  locacion: string;
  usuario: string;
}

export interface RegistrarMovimientoRequest {
  tipo: TipoMovimiento;
  idProducto?: string;
  idLote?: string;
  idLocacion?: string;
  cantidad: number;
  motivo: string;
  documentoRef?: string;
  proveedor?: string;
  nroLote?: string;
  costoUnit?: number;
  fecGarantia?: string;
}

export interface FiltroMovimientoDto {
  tipo?: TipoMovimiento;
  fechaDesde?: string;
  fechaHasta?: string;
  idProducto?: string;
  texto?: string;
  pagina?: number;
  tamanioPagina?: number;
}
