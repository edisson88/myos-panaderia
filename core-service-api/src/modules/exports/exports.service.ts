import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportsService {
  async exportOrders(): Promise<object> {
    // TODO: query orders, transform to CSV/Excel buffer, return as stream
    return { message: 'Export orders — TODO' };
  }

  async exportCustomers(): Promise<object> {
    // TODO: query customers, transform to CSV/Excel buffer, return as stream
    return { message: 'Export customers — TODO' };
  }
}
