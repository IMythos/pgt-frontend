import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-dashboard.html'
})
export class MainDashboard {
  kpis = signal([
    { title: 'Total Inventario', value: '12,450', trend: '+5.2%', isPositive: true, icon: 'box' },
    { title: 'Órdenes Pendientes', value: '34', trend: '-2.1%', isPositive: false, icon: 'clipboard' },
    { title: 'Alertas de Stock', value: '8', trend: '+1.5%', isPositive: false, icon: 'alert' },
    { title: 'Valor Almacenado', value: '$ 145.2K', trend: '+12.4%', isPositive: true, icon: 'dollar' }
  ]);

  stockAlerts = signal([
    { sku: '902-11A', name: 'Válvula de Presión Hidráulica', stock: 2, status: 'Crítico' },
    { sku: '442-88B', name: 'Sensor de Temperatura PT100', stock: 5, status: 'Bajo' },
    { sku: '110-22X', name: 'Módulo PLC Expansión', stock: 1, status: 'Crítico' }
  ]);
  chartData = signal([
    { label: 'Ene', value: 40 },
    { label: 'Feb', value: 65 },
    { label: 'Mar', value: 45 },
    { label: 'Abr', value: 85 },
    { label: 'May', value: 55 }
  ]);
  recentOperations = signal([
    { id: 'MOV-8901', type: 'INGRESO', product: 'Motor Servodrive 5HP', date: '28 Abr 2026 08:30 AM', user: 'Juan P.', status: 'COMPLETADO' },
    { id: 'MOV-8902', type: 'SALIDA', product: 'Sensor de Presión', date: '28 Abr 2026 09:15 AM', user: 'Diego M.', status: 'COMPLETADO' },
    { id: 'MOV-8903', type: 'AJUSTE', product: 'Controlador PLC', date: '28 Abr 2026 10:45 AM', user: 'Admin', status: 'REVISIÓN' },
    { id: 'MOV-8904', type: 'PICKING', product: 'Módulo de E/S', date: '28 Abr 2026 11:20 AM', user: 'Luis F.', status: 'PENDIENTE' }
  ]);
  capacityStatus = signal({
  percentage: 75,
  label: 'Ocupado',
  totalLocations: '1,450',
  usedLocations: '1,087'
});
}
