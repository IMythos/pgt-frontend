export interface StockStatusInfo {
  label: string;
  colorClass: string;
}

export function getStockStatus(stock: number | undefined | null): StockStatusInfo {
  const s = stock ?? 0;
  if (s > 20) return { label: 'Óptimo', colorClass: 'bg-[#E6F4EA] dark:bg-[rgba(52,168,83,0.1)] text-[#34A853]' };
  if (s > 5) return { label: 'Bajo', colorClass: 'bg-[#FEF3C7] dark:bg-[rgba(245,166,35,0.1)] text-[#F5A623]' };
  if (s > 0) return { label: 'Crítico', colorClass: 'bg-[#FCE8E8] dark:bg-[rgba(239,68,68,0.15)] text-[#81000A] dark:text-[#EF4444]' };
  return { label: 'Agotado', colorClass: 'bg-[#F3F4F6] dark:bg-[rgba(255,255,255,0.05)] text-[#4C616C] dark:text-[#8A9BA8]' };
}
