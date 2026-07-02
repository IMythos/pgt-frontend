import { Component, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';
import { AuthService } from '../core/services/auth.service';
import { Modal } from '../shared/components/modal/modal';
import { ModalHeader } from '../shared/components/modal-header/modal-header';
import { ModalFooter } from '../shared/components/modal-footer/modal-footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet, Navbar, Modal, ModalHeader, ModalFooter],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  authService = inject(AuthService);
  // Referencia al componente sidebar para llamar toggle() y close()
  sidebar = viewChild.required(Sidebar);
}