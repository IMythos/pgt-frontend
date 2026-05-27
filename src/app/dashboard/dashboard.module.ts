import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
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
export class DashboardModule {}
