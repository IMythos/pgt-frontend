import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainDashboard } from './pages/main-dashboard/main-dashboard';

const routes: Routes = [
  {
    path: '',
    component: MainDashboard,
    data: { breadcrumb: 'Dashboard Principal' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
