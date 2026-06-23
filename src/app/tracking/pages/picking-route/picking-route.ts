import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PickingApiService } from '../../services/picking-api.service';
import { PickingOrder, PickingRoute as PickingRouteDto } from '../../models/picking.model';

interface PickItem {
  id: string;
  sequence: number;
  sku: string;
  name: string;
  location: string;
  nodeId: string;
  qty: number;
  status: 'completed' | 'active' | 'pending';
}

interface RackNode {
  id: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-picking-route',
  imports: [CommonModule],
  templateUrl: './picking-route.html',
  styleUrl: './picking-route.css',
})
export class PickingRoute implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly pickingApi = inject(PickingApiService);

  ordenId = signal('');
  orderData = signal<PickingOrder | null>(null);
  loading = signal(true);
  optimizing = signal(false);
  isRouteActive = signal(true);
  estimatedTime = signal('—');

  racks = signal<RackNode[]>([]);
  pickingList = signal<PickItem[]>([]);
  routeData = signal<PickingRouteDto | null>(null);

  routePath = computed(() => {
    const list = this.pickingList();
    let points = '';
    list.forEach(item => {
      const node = this.racks().find(r => r.id === item.nodeId);
      if (node) {
        points += `${node.x},${node.y} `;
      }
    });
    return points.trim();
  });

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.ordenId.set(id);
      this.cargarOrden(id);
    } else {
      this.loading.set(false);
    }
  }

  private cargarOrden(id: string) {
    this.loading.set(true);
    this.pickingApi.obtener(id).subscribe({
      next: (orden) => {
        this.ordenId.set(orden.idOrden);
        this.orderData.set(orden);
        this.pickingApi.obtenerRuta(id).subscribe({
          next: (ruta) => this.construirDesdeRuta(ruta),
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  optimizarRuta() {
    const id = this.ordenId();
    if (!id) return;
    this.optimizing.set(true);

    this.pickingApi.optimizar(id).subscribe({
      next: (ruta) => {
        this.construirDesdeRuta(ruta);
        this.optimizing.set(false);
      },
      error: () => this.optimizing.set(false),
    });
  }

  private construirDesdeRuta(ruta: PickingRouteDto) {
    this.routeData.set(ruta);

    const nodes = ruta.pathSeq.length > 2
      ? ruta.pathSeq.filter((_, i, arr) => i > 0 && i < arr.length - 1)
      : ruta.pathSeq;

    if (nodes.length === 0) {
      this.loading.set(false);
      return;
    }

    const items: PickItem[] = nodes.map((nodeId, index) => ({
      id: nodeId,
      sequence: index + 1,
      sku: `LOC-${nodeId.substring(0, 8).toUpperCase()}`,
      name: `Item en locación ${index + 1}`,
      location: nodeId.substring(0, 8) + '...',
      nodeId,
      qty: 1,
      status: index === 0 ? 'active' as const : 'pending' as const,
    }));

    this.pickingList.set(items);
    this.isRouteActive.set(true);
    this.estimatedTime.set(`${items.length * 3} mins`);

    const cols = Math.min(items.length, 3);
    const rackList: RackNode[] = items.map((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        id: item.nodeId,
        x: 15 + col * 32,
        y: 20 + row * 22,
      };
    });
    this.racks.set(rackList);
    this.loading.set(false);
  }

  getNodeSequence(nodeId: string): number | null {
    const item = this.pickingList().find(p => p.nodeId === nodeId);
    return item ? item.sequence : null;
  }

  getNodeStatus(nodeId: string): string | null {
    const item = this.pickingList().find(p => p.nodeId === nodeId);
    return item ? item.status : null;
  }

  completePick(item: PickItem) {
    if (item.status !== 'active') return;

    this.pickingList.update(list => {
      const newList = [...list];
      const currentIndex = newList.findIndex(i => i.id === item.id);

      newList[currentIndex] = { ...newList[currentIndex], status: 'completed' };

      if (currentIndex + 1 < newList.length) {
        newList[currentIndex + 1] = { ...newList[currentIndex + 1], status: 'active' };
      } else {
        this.isRouteActive.set(false);
      }
      return newList;
    });
  }

  completarRuta() {
    const id = this.ordenId();
    if (!id) return;

    this.pickingApi.completar(id, 1).subscribe({
      next: () => {
        this.isRouteActive.set(false);
      },
      error: () => {},
    });
  }
}
