import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  /** GET /api/exports/orders */
  @Get('orders')
  exportOrders() {
    return this.exportsService.exportOrders();
  }

  /** GET /api/exports/customers */
  @Get('customers')
  exportCustomers() {
    return this.exportsService.exportCustomers();
  }
}
