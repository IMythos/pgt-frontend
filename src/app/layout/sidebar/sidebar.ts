import { Component, signal, output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuGroup {
  label: string;
  paths: string[];
  children: MenuItem[];
}

interface MenuItem {
  label: string;
  route: string;
  paths: string[];
}

type SidebarEntry = MenuGroup | MenuItem;
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  isOpen = signal(false);
  openChange = output<boolean>();

  expandedMenus = signal<Set<string>>(new Set());

  menuItems: SidebarEntry[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      paths: ['M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z']
    } as MenuItem,
    {
      label: 'Inventario',
      route: '/inventario',
      paths: ['M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4']
    } as MenuItem,
    {
      label: 'Tracking',
      route: '/tracking',
      paths: [
        'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
        'M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z'
      ]
    } as MenuItem,
    {
      label: 'Movimiento Inventario',
      paths: [
        'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
      ],
      children: [
        {
          label: 'Trazabilidad',
          route: '/inventario/movimientos',
          paths: [
            'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          ]
        },
        {
          label: 'Kardex',
          route: '/inventario/kardex',
          paths: [
            'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
          ]
        }
      ]
    } as MenuGroup,
    {
      label: 'Picking',
      route: '/tracking/picking-route',
      paths: [
        'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
      ]
    } as MenuItem,
    {
      label: 'Admin',
      route: '/admin/config',
      paths: [
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
      ]
    } as MenuItem,
  ];
  constructor(public authService: AuthService) {}

  isGroup(entry: SidebarEntry): entry is MenuGroup {
    return 'children' in entry;
  }

  toggleMenu(label: string) {
    this.expandedMenus.update(set => {
      const next = new Set(set);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenus().has(label);
  }

  toggle() {
    this.isOpen.update(v => !v);
    this.openChange.emit(this.isOpen());
  }

  close() {
    this.isOpen.set(false);
    this.openChange.emit(false);
  }

  onLogout(): void {
    this.authService.logout();
  }
}