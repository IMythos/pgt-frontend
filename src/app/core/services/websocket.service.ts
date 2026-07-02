import { inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { AuthService } from "./auth.service";
import { Client } from "@stomp/stompjs"
import { environment } from '../../../environments/environment';
export interface MovementWsEvent {
  id: string;
  productId: string;
  tipo: string;
  cantidad: number;
  stockAfter?: number;
}
export interface StockAlertWsEvent {
  productId: string;
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
  private get wsBaseUrl(): string {
    return environment.apiUrl.replace(/^http/, 'ws').replace(/\/api(\/v1)?$/, '');
  }

  constructor() {
    this.client = new Client({
      brokerURL: `${this.wsBaseUrl}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${this.authService.getToken()}`
      },
      onConnect: () => {
        this.client.subscribe('/topic/inventory/movements', msg =>
          this.movements$.next(JSON.parse(msg.body)));
        this.client.subscribe('/topic/inventory/stock-alerts', msg =>
          this.stockAlerts$.next(JSON.parse(msg.body)));
        this.client.subscribe('/topic/heatmap', msg =>
          this.heatmap$.next(JSON.parse(msg.body)));
      }
    });
    this.client.activate();
  }
  onMovement() { return this.movements$.asObservable(); }
  onStockAlert() { return this.stockAlerts$.asObservable(); }
  onHeatmapUpdate() { return this.heatmap$.asObservable(); }
}