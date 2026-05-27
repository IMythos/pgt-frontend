import { inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { AuthService } from "./auth.service";
import { Client } from "@stomp/stompjs"
export interface MovementWsEvent {
  id: string;
  productId: string;
  tipo: string;
  cantidad: number;
}
export interface StockAlertWsEvent {
  productId: string;
  currentStock: number;
  minStock: number;
}
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private authService = inject(AuthService);
  private client: Client;
  private movements$ = new Subject<MovementWsEvent>();
  private stockAlerts$ = new Subject<StockAlertWsEvent>();
  constructor() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${this.authService.getToken()}`
      },
      onConnect: () => {
        this.client.subscribe('/topic/inventory/movements', msg =>
          this.movements$.next(JSON.parse(msg.body)));
        this.client.subscribe('/topic/inventory/stock-alerts', msg =>
          this.stockAlerts$.next(JSON.parse(msg.body)));
      }
    });
    this.client.activate();
  }
  onMovement() { return this.movements$.asObservable(); }
  onStockAlert() { return this.stockAlerts$.asObservable(); }
}