import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PickingApiService } from '../../services/picking-api.service';
import { PickingOrder, PickingRoute as PickingRouteDto, PickingRouteNode } from '../../models/picking.model';
import { PickingCompleteDialog } from '../../../shared/components/picking-complete-dialog/picking-complete-dialog';

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

@Component({
  selector: 'app-picking-route',
  imports: [CommonModule, RouterModule, PickingCompleteDialog],
  templateUrl: './picking-route.html',
  styleUrl: './picking-route.css',
})
export class PickingRoute implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pickingApi = inject(PickingApiService);

  ordenId = signal('');
  orderData = signal<PickingOrder | null>(null);
  loading = signal(true);
  optimizing = signal(false);
  isRouteActive = signal(true);
  estimatedTime = signal('--');

  showCompleteModal = signal(false);

  racks = signal<PickingRouteNode[]>([]);
  pickingList = signal<PickItem[]>([]);
  routeData = signal<PickingRouteDto | null>(null);

  panX = signal(0);
  panY = signal(0);
  scale = signal(1);
  isPanning = signal(false);

  private lastClientX = 0;
  private lastClientY = 0;

  panStyle = computed(() => ({
    transform: `translate(${this.panX()}px, ${this.panY()}px) scale(${this.scale()})`,
    cursor: this.isPanning() ? 'grabbing' : 'grab',
  }));

  zoomLabel = computed(() => `${this.scale().toFixed(1)}x`);

  private static readonly FALLBACK_NODES: PickingRouteNode[] = [
    { id: '00000000-0000-0000-0000-000000000001', x: 0, y: 50, label: 'ENTRADA', tipo: 'ENTRADA' },
    { id: '00000000-0000-0000-0000-000000000002', x: 100, y: 50, label: 'SALIDA', tipo: 'SALIDA' },
    { id: 'cd673d7c-ec4a-4ca9-9b6f-67f2525d65c7', x: 5.6, y: 0, label: 'CEN-A-P1-E1', tipo: 'ESTANTE' },
    { id: 'bd6cd7f1-4ff3-468c-9067-ab12bae41112', x: 5.6, y: 28.6, label: 'CEN-A-P1-E2', tipo: 'ESTANTE' },
    { id: '95c95de0-9d69-4f4c-911d-ab98c76c803f', x: 27.8, y: 0, label: 'CEN-A-P2-E1', tipo: 'ESTANTE' },
    { id: '285ca7e5-c923-4c3c-8f85-0321ebdda9d1', x: 5.6, y: 14.3, label: 'CEN-B-P1-E1', tipo: 'ESTANTE' },
    { id: '8b791509-3ea8-4c5e-8469-e3ccdf72cae3', x: 5.6, y: 42.9, label: 'CEN-B-P1-E2', tipo: 'ESTANTE' },
    { id: 'f6f7d372-32bc-45c5-b42b-88b33076b881', x: 27.8, y: 19.3, label: 'CEN-B-P2-E1', tipo: 'ESTANTE' },
    { id: '8fcae64c-18be-400e-9345-877191d7a6ae', x: 5.6, y: 57.1, label: 'NOR-FRI-P1-N1', tipo: 'ESTANTE' },
    { id: 'bbf5c0d0-1231-42b9-b132-1c5edad17b98', x: 5.6, y: 85.7, label: 'NOR-FRI-P1-N2', tipo: 'ESTANTE' },
    { id: '815fbb26-1fca-4b82-b010-d728b8e04be1', x: 5.6, y: 71.4, label: 'NOR-SEC-P1-N1', tipo: 'ESTANTE' },
    { id: '2c251e79-9b18-43bd-a44d-95a9d84064c4', x: 5.6, y: 100, label: 'NOR-SEC-P1-N2', tipo: 'ESTANTE' },
    { id: 'e4d6e5d9-0f74-40ff-845c-e13f2029c44f', x: 27.8, y: 37.9, label: 'NOR-SEC-P2-N1', tipo: 'ESTANTE' },
    { id: 'b1d5e634-f26a-44ba-9727-9cb5d36de6cf', x: 27.8, y: 57.1, label: 'NOR-SEC-P2-N2', tipo: 'ESTANTE' },
    { id: 'a68b1571-53ad-49b3-b272-319c3a3a6f76', x: 50, y: 28.6, label: 'SUR-REC-PA-E1', tipo: 'ESTANTE' },
    { id: '525fbd45-5bb2-4aab-8445-2e84307722de', x: 50, y: 85.7, label: 'SUR-REC-PA-E2', tipo: 'ESTANTE' },
    { id: 'b52820a5-0c3d-499b-932b-46bb7c0649f4', x: 72.2, y: 57.1, label: 'SUR-REC-PB-E1', tipo: 'ESTANTE' },
    { id: '41bd54f0-4411-4da5-86bc-c1f6b0504deb', x: 50, y: 0, label: 'SUR-DES-PA-E1', tipo: 'ESTANTE' },
    { id: '7913204b-acd6-4260-89d3-9e2fa74435b2', x: 50, y: 57.1, label: 'SUR-DES-PA-E2', tipo: 'ESTANTE' },
    { id: '10662218-13c6-47f7-b37c-9ec83302b334', x: 72.2, y: 0, label: 'SUR-DES-PB-E1', tipo: 'ESTANTE' },
  ];

  routePath = computed(() => {
    const route = this.routeData();
    const racks = this.racks();
    if (!route || !route.pathSeq || racks.length === 0) return '';

    const seen = new Set<string>();
    const path: PickingRouteNode[] = [];

    let entrada: PickingRouteNode | undefined;
    let salida: PickingRouteNode | undefined;

    for (const nodeId of route.pathSeq) {
      if (seen.has(nodeId)) continue;
      const rack = racks.find(r => r.id === nodeId);
      if (!rack) continue;

      if (rack.tipo === 'ENTRADA') {
        entrada = rack;
        seen.add(nodeId);
      } else if (rack.tipo === 'SALIDA') {
        salida = rack;
        seen.add(nodeId);
      } else {
        seen.add(nodeId);
        path.push(rack);
      }
    }

    const ordered: PickingRouteNode[] = [];
    if (entrada) ordered.push(entrada);
    ordered.push(...path);
    if (salida) ordered.push(salida);

    if (ordered.length < 2) return '';

    return ordered.map((r, i) => `${i === 0 ? 'M' : 'L'} ${r.x},${r.y}`).join(' ');
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
        if (orden.estado === 'COMPLETADO') {
          this.router.navigate(['/tracking/picking']);
          return;
        }
        this.ordenId.set(orden.idOrden);
        this.orderData.set(orden);
        this.cargarRuta(id);
      },
      error: () => this.loading.set(false),
    });
  }

  private cargarRuta(id: string) {
    this.pickingApi.obtenerRuta(id).subscribe({
      next: (ruta) => this.construirDesdeRuta(ruta),
      error: (err) => {
        if (err.status === 404) {
          console.warn('[PickingRoute] Ruta no encontrada (404), intentando optimizar...');
          this.pickingApi.optimizar(id).subscribe({
            next: (ruta) => this.construirDesdeRuta(ruta),
            error: (err2) => {
              console.error('[PickingRoute] Error al optimizar ruta:', err2);
              this.racks.set(PickingRoute.FALLBACK_NODES);
              this.loading.set(false);
            },
          });
        } else {
          console.error('[PickingRoute] Error al obtener ruta:', err);
          this.racks.set(PickingRoute.FALLBACK_NODES);
          this.loading.set(false);
        }
      },
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

    if (ruta.nodes && ruta.nodes.length > 0) {
      const nodes = ruta.nodes;
      const xs = nodes.map(n => n.x ?? 0);
      const ys = nodes.map(n => n.y ?? 0);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const rx = maxX - minX || 100;
      const ry = maxY - minY || 100;
      const norm = (val: number, min: number, range: number) => ((val - min) / range) * 100;

      let normalized = nodes.map(n => ({
        id: n.id,
        x: norm(n.x ?? 0, minX, rx),
        y: norm(n.y ?? 0, minY, ry),
        label: n.label ?? n.tipo,
        tipo: n.tipo,
      }));

      // Suplir stops faltantes desde FALLBACK_NODES
      const apiNodeIds = new Set(nodes.map(n => n.id));
      const missing = (ruta.pickingStops ?? []).filter(id => !apiNodeIds.has(id));
      if (missing.length > 0) {
        const supplement = PickingRoute.FALLBACK_NODES.filter(n => missing.includes(n.id));
        if (supplement.length > 0) {
          normalized = [...normalized, ...supplement];
          console.log('[PickingRoute] Stops suplidas:', supplement.map(n => n.id));
        }
      }

      this.racks.set(normalized);
      console.log('[PickingRoute] Racks:', normalized.map(n => `${n.id}@(${n.x.toFixed(1)},${n.y.toFixed(1)})`));
    } else {
      this.racks.set(PickingRoute.FALLBACK_NODES);
    }

    const currentRacks = this.racks();

    const orderDetails = ruta.detalles || [];
    const qtyByLocation = new Map<string, number>();

    for (const d of orderDetails) {
      qtyByLocation.set(d.locacionId, (qtyByLocation.get(d.locacionId) ?? 0) + d.cantRequerida);
    }

    const items: PickItem[] = [];
    let sequenceCounter = 1;
    const seen = new Set<string>();

    for (const nodeId of ruta.pathSeq) {
      if (!seen.has(nodeId)) {
        seen.add(nodeId);
        const node = currentRacks.find(n => n.id === nodeId);

        if (node && node.tipo !== 'ENTRADA' && node.tipo !== 'SALIDA') {
          const qty = qtyByLocation.get(nodeId) ?? 0;

          items.push({
            id: node.id,
            sequence: sequenceCounter++,
            sku: `LOC-${node.id.substring(0, 8).toUpperCase()}`,
            name: qty > 0 ? node.label : 'En tránsito',
            location: node.label,
            nodeId: node.id,
            qty: qty,
            status: sequenceCounter === 2 ? 'active' : 'pending',
          });
        }
      }
    }

    this.pickingList.set(items);
    this.isRouteActive.set(items.length > 0);

    if (ruta.distanciaEstimada > 0) {
      const mins = Math.ceil(ruta.distanciaEstimada / 2);
      this.estimatedTime.set(`${mins} min aprox.`);
    } else {
      this.estimatedTime.set('--');
    }

    this.loading.set(false);

    // Diagnóstico
    const pathPoints = (ruta.pathSeq ?? [])
      .map(id => {
        const r = this.racks().find(n => n.id === id);
        return r ? `(${r.x.toFixed(1)},${r.y.toFixed(1)})` : '(?)';
      })
      .join(' → ');
    console.log('[PickingRoute] Path:', pathPoints);
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

    this.pickingApi.asignar(id, 1).subscribe({
      next: () => {
        this.pickingApi.completar(id, 1).subscribe({
          next: () => this.showCompleteModal.set(true),
          error: (err) => console.error('[PickingRoute] Error al completar orden:', err),
        });
      },
      error: (err) => console.error('[PickingRoute] Error al asignar orden:', err),
    });
  }

  cerrarModal() {
    this.showCompleteModal.set(false);
    this.router.navigate(['/tracking/picking']);
  }

  startPan(event: MouseEvent) {
    this.isPanning.set(true);
    this.lastClientX = event.clientX - this.panX();
    this.lastClientY = event.clientY - this.panY();
  }

  onPan(event: MouseEvent) {
    if (!this.isPanning()) return;
    this.panX.set(event.clientX - this.lastClientX);
    this.panY.set(event.clientY - this.lastClientY);
  }

  endPan() {
    this.isPanning.set(false);
  }

  zoomIn() {
    this.scale.update(s => Math.min(s * 1.3, 5));
  }

  zoomOut() {
    this.scale.update(s => Math.max(s / 1.3, 0.3));
  }

  resetView() {
    this.panX.set(0);
    this.panY.set(0);
    this.scale.set(1);
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.scale.update(s => Math.max(0.3, Math.min(5, s * delta)));
  }
}
