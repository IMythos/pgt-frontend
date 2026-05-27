export interface CategoriaProductoDto {
  idCategoria: number;
  codigoCategoria: string;
  nombreCategoria: string;
  activo: boolean;
}

export interface MarcaProductoDto {
  idMarca: number;
  nombreMarca: string;
  activo: boolean;
}

export interface FiltroCatalogoProductosDto {
  texto?: string;
  idCategoria?: number;
  idMarca?: number;
  estado?: boolean;
  pagina?: number;
  tamanioPagina?: number;
}

export interface CrearProductoDto {
  idCategoria: number;
  idMarca: number;
  sku: string;
  numeroParte?: string | null;
  descripcion: string;
  modelosCompatibles: string[];
  precioCompra: number;
  precioVenta: number;
  estado?: boolean;
  stockMinimo?: number | null;
}

export interface ActualizarProductoDto {
  idCategoria?: number;
  idMarca?: number;
  numeroParte?: string | null;
  descripcion?: string;
  modelosCompatibles?: string[];
  precioCompra?: number;
  precioVenta?: number;
  estado?: boolean;
  stockMinimo?: number | null;
}

export interface CambiarEstadoProductoDto {
  estado: boolean;
}

export interface ProductoCatalogoDto {
  idProducto: string;
  sku: string;
  numeroParte?: string | null;
  descripcion: string;
  categoria: CategoriaProductoDto;
  marca: MarcaProductoDto;
  modelosCompatibles: string[];
  precioCompra: number;
  precioVenta: number;
  estado: boolean;
  stockTotal?: number;
  stockMinimo?: number | null;
  fechaCreacion: string;
}

export interface DetalleProductoDto extends ProductoCatalogoDto {}

export interface RespuestaPaginadaProductosDto {
  items: ProductoCatalogoDto[];
  total: number;
  pagina: number;
  tamanioPagina: number;
}
