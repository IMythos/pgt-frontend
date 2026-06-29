import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackingHome } from './pages/tracking-home/tracking-home';

const routes: Routes = [
  {
    path: '',
    component: TrackingHome,
    data: { breadcrumb: 'Mapa de calor' }
  },
  {
    path: 'picking',
    loadComponent: () => import('./pages/picking-orders/picking-orders').then(m => m.PickingOrders),
    data: { breadcrumb: 'Órdenes de Picking' }
  },
  {
    path: 'picking/:id',
    loadComponent: () => import('./pages/picking-route/picking-route').then(m => m.PickingRoute),
    data: { breadcrumb: 'Ruta de Picking' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackingRoutingModule {}
