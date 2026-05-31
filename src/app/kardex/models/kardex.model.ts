export interface KardexDto {
  idKardex: string;
  idMovimiento: string;
  idProducto: string;
  producto: string;
  sku: string;
  fecha: string;
  tipoMovimiento: string;
  documentoRef: string;
  stockAnterior: number;
  cantIngreso: number;
  cantSalida: number;
  stockActual: number;
  costoPromedio: number;
  metodoCosto: string;
}

export interface FiltroKardexDto {
  idProducto?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoMovimiento?: string;
  metodoCosto?: string;
  pagina?: number;
  tamanioPagina?: number;
}