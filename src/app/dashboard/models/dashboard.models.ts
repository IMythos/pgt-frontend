export interface DashboardKpi {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  trend: number;
  trendLabel: string;
  isPositive: boolean;
  icon: string;
  sparkline: number[];
}

export interface StockAlert {
  sku: string;
  name: string;
  stock: number;
  status: 'Crítico' | 'Bajo';
  costoPromedio: number;
}

export interface MovementPoint {
  date: string;
  label: string;
  ingresos: number;
  salidas: number;
  ajustes: number;
}

export interface TipoProporcion {
  label: string;
  value: number;
  color: string;
}

export interface Operation {
  id: string;
  type: string;
  product: string;
  date: string;
  user: string;
  status: string;
}

export interface ZoneCapacity {
  zone: string;
  used: number;
  total: number;
  percentage: number;
}

export interface ProductTop {
  name: string;
  value: number;
}
