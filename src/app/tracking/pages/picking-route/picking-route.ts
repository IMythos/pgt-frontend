import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
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
export class PickingRoute {
orderId = signal('ORD-8922-WH');
  isRouteActive = signal(true);
  estimatedTime = signal('12 mins');

  racks = signal<RackNode[]>([
    { id: 'A01', x: 20, y: 25 }, { id: 'A02', x: 50, y: 25 }, { id: 'A03', x: 80, y: 25 },
    { id: 'B01', x: 20, y: 50 }, { id: 'B02', x: 50, y: 50 }, { id: 'B03', x: 80, y: 50 },
    { id: 'C01', x: 20, y: 75 }, { id: 'C02', x: 50, y: 75 }, { id: 'C03', x: 80, y: 75 },
  ]);

  pickingList = signal<PickItem[]>([
    { id: 'item1', sequence: 1, sku: 'VAL-X12', name: 'Hydraulic Valve Assy', location: 'Z:A R:02 B:01', nodeId: 'A02', qty: 2, status: 'completed' },
    { id: 'item2', sequence: 2, sku: 'BRG-G4', name: 'Industrial Bearing G4', location: 'Z:B R:02 B:03', nodeId: 'B02', qty: 5, status: 'active' },
    { id: 'item3', sequence: 3, sku: 'CYL-PN', name: 'Pneumatic Cylinder', location: 'Z:C R:01 B:02', nodeId: 'C01', qty: 1, status: 'pending' },
    { id: 'item4', sequence: 4, sku: 'SENS-A', name: 'Sensor Array Module', location: 'Z:C R:03 B:01', nodeId: 'C03', qty: 3, status: 'pending' },
  ]);

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
      
      newList[currentIndex].status = 'completed';

      if (currentIndex + 1 < newList.length) {
        newList[currentIndex + 1].status = 'active';
      } else {
        this.isRouteActive.set(false);
      }
      return newList;
    });
  }
}
