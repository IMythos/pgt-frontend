import { inject, Injectable, signal, computed } from "@angular/core";
import { WebSocketService, StockAlertWsEvent, MovementWsEvent } from "./websocket.service";

export interface NotificationItem {
  id: string;
  type: "stock_alert" | "movement";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  data: StockAlertWsEvent | MovementWsEvent;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private ws = inject(WebSocketService);
  private notifications = signal<NotificationItem[]>([]);
  private maxItems = 20;

  readonly items = this.notifications.asReadonly();
  readonly unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  constructor() {
    this.ws.onStockAlert().subscribe(e => this.addStockAlert(e));
    this.ws.onMovement().subscribe(e => this.addMovement(e));
  }

  markAsRead(id: string) {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead() {
    this.notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  clearAll() {
    this.notifications.set([]);
  }

  private addStockAlert(e: StockAlertWsEvent) {
    this.notifications.update(list => [{
      id: crypto.randomUUID(),
      type: "stock_alert" as const,
      title: "Stock bajo",
      description: `${e.productName || "Producto"} — Stock: ${e.currentStock} / Mín: ${e.minStock}`,
      timestamp: new Date(),
      read: false,
      data: e
    }, ...list].slice(0, this.maxItems));
  }

  private addMovement(e: MovementWsEvent) {
    const tipoLabel: Record<string, string> = {
      INGRESO: "Ingreso",
      SALIDA: "Salida",
      AJUSTE_POSITIVO: "Ajuste+",
      AJUSTE_NEGATIVO: "Ajuste-"
    };

    const label = tipoLabel[e.tipo] || e.tipo;
    const cant = e.cantidad ?? 0;

    this.notifications.update(list => [{
      id: crypto.randomUUID(),
      type: "movement" as const,
      title: label,
      description: `${e.productName || "Producto"} — ${cant} unidades`,
      timestamp: new Date(),
      read: false,
      data: e
    }, ...list].slice(0, this.maxItems));
  }
}
