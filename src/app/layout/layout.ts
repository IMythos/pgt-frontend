import { Component, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet, Navbar],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  authService = inject(AuthService);
  // Referencia al componente sidebar para llamar toggle() y close()
  sidebar = viewChild.required(Sidebar);
}