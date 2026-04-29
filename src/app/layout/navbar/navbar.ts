import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, signal, input, output, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
export interface Breadcrumb {
  label: string;
  url: string;
}
@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.html',
  styles: [`
    @keyframes dropdownFade {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-dropdown {
      animation: dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class Navbar {
  userName = signal<string>('Diego M.');
  hasUnreadNotifications = signal<boolean>(true);
  isSettingsOpen = signal<boolean>(false);
  isDarkMode = signal<boolean>(false);
  breadcrumbs = signal<Breadcrumb[]>([]);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  sidebarOpen = input<boolean>(false);
  toggleSidebar = output<void>();
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.checkInitialTheme();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const root = this.router.routerState.root;
      const breadcrumbs: Breadcrumb[] = [];
      this.buildBreadcrumbs(root, '', breadcrumbs);
      this.breadcrumbs.set(breadcrumbs);
    });
  }

  toggleSettings() {
    this.isSettingsOpen.update(v => !v);
  }

  toggleDarkMode() {
    const isDark = !this.isDarkMode();
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
  private buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): void {
    if (route) {
      const routeUrl = route.snapshot.url.map(segment => segment.path).join('/');
      if (routeUrl !== '') {
        url += `/${routeUrl}`;
      }
      if (route.snapshot.data['breadcrumb']) {
        const label = route.snapshot.data['breadcrumb'];
        if (breadcrumbs.length === 0 || breadcrumbs[breadcrumbs.length - 1].label !== label) {
          breadcrumbs.push({ label, url });
        }
      }
      if (route.firstChild) {
        this.buildBreadcrumbs(route.firstChild, url, breadcrumbs);
      }
    }
  }
  private checkInitialTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme === 'dark') {
        this.setDarkMode(true);
      } else if (savedTheme === 'light') {
        this.setDarkMode(false);
      } else {
        // Si no hay preferencia guardada, usamos la preferencia del sistema operativo
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setDarkMode(prefersDark);
      }
    }
  }

  private setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    
    if (isPlatformBrowser(this.platformId)) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }
}
