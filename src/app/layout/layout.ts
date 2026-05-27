import { Component, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet, Navbar],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  // Referencia al componente sidebar para llamar toggle() y close()
  sidebar = viewChild.required(Sidebar);
}