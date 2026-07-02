import { Pipe, PipeTransform } from '@angular/core';
import { getStockStatus, StockStatusInfo } from '../utils/stock-status';

@Pipe({ name: 'stockStatus', standalone: true })
export class StockStatusPipe implements PipeTransform {
  transform(stock: number | undefined | null): StockStatusInfo {
    return getStockStatus(stock);
  }
}
