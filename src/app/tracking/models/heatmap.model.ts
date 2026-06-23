export interface HeatmapAlmacenDto {
  almacen: {
    id: number;
    nombre: string;
    codAlm: string;
  };
  locaciones: HeatmapLocationDto[];
}

export interface HeatmapLocationDto {
  idLocacion: string;
  zona: string;
  pasillo: string;
  estante: string;
  codBarras: string;
  capacidad: number;
  movementCount: number;
  dailyPicks: number;
  intensity: number;
  categoriaPrincipal: string;
  selected?: boolean;
}

export interface HeatmapLocationDetailDto extends HeatmapLocationDto {
  productos: LocationProductDto[];
}

export interface LocationProductDto {
  idLote: string;
  productoCod: string;
  productoDesc: string;
  cantidad: number;
  nroLote: string;
}
