import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KardexHome } from './pages/kardex-home/kardex-home';

const routes: Routes = [
  {
    path: '',
    component: KardexHome,
    data: { breadcrumb: 'Kardex' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KardexRoutingModule {}
