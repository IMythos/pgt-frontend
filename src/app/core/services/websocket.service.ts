import { inject, Injectable, Injector } from "@angular/core";
import { Subject } from "rxjs";
import { AuthService } from "./auth.service";
import { Client, IFrame } from "@stomp/stompjs"
import { environment } from '../../../environments/environment';
export interface MovementWsEvent {
  id: string;
  productId: string;
  productName?: string;
  tipo: string;
  cantidad: number;
  costoPromedio?: number;
}
export interface StockAlertWsEvent {
  productId: string;
  productName?: string;
  currentStock: number;
  minStock: number;
}
export interface HeatmapWsEvent {
  locacionId: string;
  idAlmacen: number;
  movementCount: number;
  dailyPicks: number;
  intensity: number;
}
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private authService = inject(AuthService);
  private client: Client;
  private movements$ = new Subject<MovementWsEvent>();
  private stockAlerts$ = new Subject<StockAlertWsEvent>();
  private heatmap$ = new Subject<HeatmapWsEvent>();
  private dashboardRefresh$ = new Subject<void>();
  private get wsBaseUrl(): string {
    return environment.apiUrl.replace(/^http/, 'ws').replace(/\/api(\/v1)?$/, '');
  }

  constructor() {
    this.client = new Client({
      brokerURL: `${this.wsBaseUrl}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: () => {
        this.client.connectHeaders = {
          Authorization: `Bearer ${this.authService.getToken()}`
        };
      },
      onConnect: () => {
        this.client.subscribe('/topic/inventory/movements', msg =>
          this.movements$.next(JSON.parse(msg.body)));
        this.client.subscribe('/topic/inventory/stock-alerts', msg =>
          this.stockAlerts$.next(JSON.parse(msg.body)));
        this.client.subscribe('/topic/heatmap', msg =>
          this.heatmap$.next(JSON.parse(msg.body)));
        this.client.subscribe('/topic/inventory/dashboard/refresh', () =>
          this.dashboardRefresh$.next());
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP error', frame);
      },
      onWebSocketClose: (evt: CloseEvent) => {
        console.warn('WebSocket closed', evt);
      }
    });
    if (this.authService.getToken()) {
      this.client.activate();
    }
  }

  connect(): void {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }
  onMovement() { return this.movements$.asObservable(); }
  onStockAlert() { return this.stockAlerts$.asObservable(); }
  onHeatmapUpdate() { return this.heatmap$.asObservable(); }
  onDashboardRefresh() { return this.dashboardRefresh$.asObservable(); }
}