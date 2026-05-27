
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminHome } from './pages/admin-home/admin-home';
// Importamos el componente standalone

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminHome
  ]
})
export class AdminModule { }