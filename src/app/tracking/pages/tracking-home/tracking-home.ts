import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Rack {
  id: string;
  intensity: number;
  selected: boolean;
  category?: string;
}

interface Aisle {
  name: string;
  racks: Rack[];
}

@Component({
  selector: 'app-tracking-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking-home.html'
})
export class TrackingHome {
  
  aisles = signal<Aisle[]>([
    {
      name: 'AISLE A',
      racks: [
        { id: 'A01', intensity: 10, selected: false, category: 'Pantallas' },
        { id: 'A02', intensity: 45, selected: false, category: 'Teclados' },
        { id: 'A03', intensity: 95, selected: true, category: 'Baterías' }, // Punto Crítico inicial
        { id: 'A04', intensity: 75, selected: false, category: 'Cargadores' },
        { id: 'A05', intensity: 20, selected: false, category: 'Cables Flex' },
      ]
    },
    {
      name: 'AISLE B',
      racks: [
        { id: 'B01', intensity: 5, selected: false, category: 'Carcasas' },
        { id: 'B02', intensity: 15, selected: false, category: 'Bisagras' },
        { id: 'B03', intensity: 30, selected: false, category: 'Discos SSD' },
        { id: 'B04', intensity: 85, selected: false, category: 'Memorias RAM' }, // Otro punto caliente
        { id: 'B05', intensity: 40, selected: false, category: 'Placas Base' },
      ]
    },
    {
      name: 'AISLE C',
      racks: [
        { id: 'C01', intensity: 0, selected: false, category: 'Tornillería' },
        { id: 'C02', intensity: 5, selected: false, category: 'Ventiladores' },
        { id: 'C03', intensity: 15, selected: false, category: 'Tarjetas Wi-Fi' },
        { id: 'C04', intensity: 25, selected: false, category: 'Puertos USB' },
        { id: 'C05', intensity: 10, selected: false, category: 'Jacks de Carga' },
      ]
    }
  ]);

  selectedNode = signal({
    id: 'Rack A03',
    occupancy: 95,
    occupancyStatus: 'CRÍTICO',
    dailyPicks: 342,
    picksStatus: 'PICO ALTO',
    inventory: [
      { name: 'Batería HP Pavilion 15', qty: 45 },
      { name: 'Batería Dell Inspiron', qty: 120 }
    ]
  });

  // 1. Escala Térmica para la caja física del estante
  getRackColorClass(intensity: number, isSelected: boolean): string {
    let baseClass = 'relative z-10 w-full h-full rounded-md flex items-center justify-center font-["Inter"] font-bold text-sm transition-all duration-300 cursor-pointer border backdrop-blur-sm ';
    
    if (isSelected) {
      baseClass += 'ring-2 ring-white dark:ring-[#E2BEBA] ring-offset-2 ring-offset-gray-100 dark:ring-offset-[#111111] scale-105 z-20 ';
    }

    if (intensity >= 80) return baseClass + 'bg-[#81000A]/90 border-[#81000A] text-white'; // Fuego / Granate
    if (intensity >= 60) return baseClass + 'bg-[#C53030]/80 border-[#C53030] text-white'; // Rojo intenso
    if (intensity >= 40) return baseClass + 'bg-[#DD6B20]/80 border-[#DD6B20] text-white'; // Naranja
    if (intensity >= 20) return baseClass + 'bg-[#D69E2E]/80 border-[#D69E2E] text-white'; // Amarillo/Ambar
    
    // Zona Fría (Gris oscuro/neutro)
    return baseClass + 'bg-gray-100/50 dark:bg-[#222222]/80 border-gray-300 dark:border-[#313131] text-[#4C616C] dark:text-[#8A9BA8]'; 
  }

  getGlowOpacity(intensity: number): number {
    if (intensity < 30) return 0;
    return intensity / 100;
  }

  // 2. Lógica para seleccionar un Rack y actualizar la vista
  selectRack(rackId: string) {
    let selectedIntensity = 0;
    let selectedCategory = '';

    // A. Actualizamos la matriz de pasillos para iluminar el rack seleccionado
    this.aisles.update(currentAisles => 
      currentAisles.map(aisle => ({
        ...aisle,
        racks: aisle.racks.map(rack => {
          if (rack.id === rackId) {
            selectedIntensity = rack.intensity;
            selectedCategory = rack.category || 'Componentes';
            return { ...rack, selected: true };
          }
          return { ...rack, selected: false };
        })
      }))
    );

    // B. Calculamos métricas dinámicas basadas en la intensidad para el panel lateral
    let occStatus = 'ESTABLE';
    if (selectedIntensity >= 80) occStatus = 'CRÍTICO';
    else if (selectedIntensity >= 60) occStatus = 'ALTO';
    else if (selectedIntensity >= 30) occStatus = 'MODERADO';
    else if (selectedIntensity === 0) occStatus = 'VACÍO';

    const picks = Math.floor(selectedIntensity * 3.5);
    let pStatus = 'ESTABLE';
    if (picks > 250) pStatus = 'PICO ALTO';
    else if (picks < 50) pStatus = 'BAJO';

    // C. Actualizamos la señal del panel lateral
    this.selectedNode.set({
      id: `Rack ${rackId}`,
      occupancy: selectedIntensity,
      occupancyStatus: occStatus,
      dailyPicks: picks,
      picksStatus: pStatus,
      inventory: this.getMockInventory(rackId, selectedCategory)
    });
  }

  // Método auxiliar para generar datos de inventario simulados
  private getMockInventory(rackId: string, category: string) {
    // Generamos números aleatorios para que varíe en cada clic
    const qty1 = Math.floor(Math.random() * 50) + 5;
    const qty2 = Math.floor(Math.random() * 100) + 10;

    return [
      { name: `${category} - Lote A (${rackId})`, qty: qty1 },
      { name: `${category} - Lote B (${rackId})`, qty: qty2 }
    ];
  }
}
