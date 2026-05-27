import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductList } from './pages/product-list/product-list';
import { MovementList } from './pages/movement-list/movement-list';

const routes: Routes = [
  {
    path: '',
    component: ProductList,
    data: { breadcrumb: 'Inventario General' }
  },
  {
    path: 'movimientos',
    component: MovementList,
    data: { breadcrumb: 'Trazabilidad' }
  },
  {
    path: 'kardex',
    loadComponent: () =>
      import('../kardex/pages/kardex-home/kardex-home').then(m => m.KardexHome),
    data: { breadcrumb: 'Kardex' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioRoutingModule {}
