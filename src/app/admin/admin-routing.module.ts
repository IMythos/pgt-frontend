import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminHome } from './pages/admin-home/admin-home';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'config',
        component: AdminHome,
        title: 'Administración del Sistema | PGT',
        data: {
          breadcrumb: 'Administración del Sistema'
        }
      },
      {
        path: '',
        redirectTo: 'config',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }