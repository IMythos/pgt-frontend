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
    path: 'picking-route',
    loadComponent: () => import('./pages/picking-route/picking-route').then(m => m.PickingRoute),
    data: { breadcrumb: 'Rutas de Picking' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackingRoutingModule {}
