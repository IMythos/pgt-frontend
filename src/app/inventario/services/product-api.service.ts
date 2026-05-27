import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ActualizarProductoDto,
  CambiarEstadoProductoDto,
  CategoriaProductoDto,
  CrearProductoDto,
  DetalleProductoDto,
  FiltroCatalogoProductosDto,
  MarcaProductoDto,
  RespuestaPaginadaProductosDto,
} from '../models/product.model';

interface ProductoResponseBe {
  id: string;
  categoryId: number;
  brandId: number;
  codProd: string;
  codAnexo: string | null;
  descripcion: string;
  modelosCompatibles: string[];
  preCom: number;
  preVen: number;
  estado: boolean;
  stockTotal?: number;
  fecCreacion: string;
}
interface CategoriaResponseBe {
  id: number;
  name: string;
  description: string | null;
}
interface MarcaResponseBe {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/v1/products`;
  private readonly categoriasUrl = `${environment.apiUrl}/v1/categories`;
  private readonly marcasUrl = `${environment.apiUrl}/v1/brands`;

  listarCatalogo(filtros: FiltroCatalogoProductosDto = {}): Observable<RespuestaPaginadaProductosDto> {
  return this.http.get<ProductoResponseBe[]>(this.baseUrl, {
    params: this.construirParams(filtros)
  }).pipe(
    map((lista) => ({
      items: lista.map(be => this.mapProductoBeToFe(be)),
      total: lista.length,
      pagina: 1,
      tamanioPagina: lista.length
    }))
  );
}

  obtenerPorId(idProducto: string): Observable<DetalleProductoDto> {
    return this.http.get<DetalleProductoDto>(`${this.baseUrl}/${idProducto}`);
  }

  crear(payload: CrearProductoDto): Observable<DetalleProductoDto> {
    const payloadBe = {
      categoryId: payload.idCategoria,
      brandId: payload.idMarca,
      codProd: payload.sku,
      codAnexo: payload.numeroParte || null,
      descripcion: payload.descripcion,
      modelosCompatibles: payload.modelosCompatibles,
      preCom: payload.precioCompra,
      preVen: payload.precioVenta,
    };
    return this.http
      .post<ProductoResponseBe>(this.baseUrl, payloadBe)
      .pipe(map((be) => this.mapProductoBeToFe(be)));
  }

  actualizar(idProducto: string, payload: ActualizarProductoDto): Observable<DetalleProductoDto> {
    return this.http.put<DetalleProductoDto>(`${this.baseUrl}/${idProducto}`, payload);
  }

  cambiarEstado(
    idProducto: string,
    payload: CambiarEstadoProductoDto,
  ): Observable<DetalleProductoDto> {
    return this.http.patch<DetalleProductoDto>(`${this.baseUrl}/${idProducto}/estado`, payload);
  }

  listarCategoriasActivas(): Observable<CategoriaProductoDto[]> {
    return this.http.get<CategoriaResponseBe[]>(this.categoriasUrl).pipe(
      map((lista) =>
        lista.map((be) => ({
          idCategoria: be.id,
          codigoCategoria: '',
          nombreCategoria: be.name,
          activo: true,
        })),
      ),
    );
  }

  listarMarcasActivas(): Observable<MarcaProductoDto[]> {
    return this.http.get<MarcaResponseBe[]>(this.marcasUrl).pipe(
      map((lista) =>
        lista.map((be) => ({
          idMarca: be.id,
          nombreMarca: be.name,
          activo: true,
        })),
      ),
    );
  }

  private construirParams(filtros: FiltroCatalogoProductosDto): HttpParams {
    let params = new HttpParams();

    if (filtros.texto) {
      params = params.set('texto', filtros.texto);
    }

    if (filtros.idCategoria !== undefined) {
      params = params.set('idCategoria', filtros.idCategoria);
    }

    if (filtros.idMarca !== undefined) {
      params = params.set('idMarca', filtros.idMarca);
    }

    if (filtros.estado !== undefined) {
      params = params.set('estado', filtros.estado);
    }

    if (filtros.pagina !== undefined) {
      params = params.set('pagina', filtros.pagina);
    }

    if (filtros.tamanioPagina !== undefined) {
      params = params.set('tamanioPagina', filtros.tamanioPagina);
    }

    return params;
  }
  exportar(formato: 'excel' | 'pdf'): Observable<Blob> {
    const exportUrl = `${environment.apiUrl}/v1/products/export?format=${formato}`;
    return this.http.get(exportUrl, {
      responseType: 'blob',
    });
  }
  private mapProductoBeToFe(be: ProductoResponseBe): DetalleProductoDto {
    return {
      idProducto: be.id,
      sku: be.codProd,
      numeroParte: be.codAnexo,
      descripcion: be.descripcion,
      categoria: {
        idCategoria: be.categoryId,
        codigoCategoria: '',
        nombreCategoria: '',
        activo: true
      },
      marca: {
        idMarca: be.brandId,
        nombreMarca: '',
        activo: true
      },
      modelosCompatibles: be.modelosCompatibles || [],
      precioCompra: be.preCom,
      precioVenta: be.preVen,
      estado: be.estado,
      stockTotal: be.stockTotal ?? 0,
      stockMinimo: 0,
      fechaCreacion: be.fecCreacion
    };
  }
  
}
