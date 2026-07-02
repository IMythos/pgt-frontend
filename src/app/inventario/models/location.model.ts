export interface LocationDto {
  idLocacion: string;
  idAlmacen: number;
  zona: string;
  pasillo: string;
  estante: string;
  codBarras: string;
  capacidad: number;
  posX?: number;
  posY?: number;
  activo: boolean;
}
