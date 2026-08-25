import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** GET /api/dashboard/summary?dateFrom=2026-01-01&dateTo=2026-01-31 */
  @Get('summary')
  getSummary(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.dashboardService.getSummary(dateFrom, dateTo);
  }

  /** GET /api/dashboard/recent-orders?dateFrom=2026-01-01&dateTo=2026-01-31 */
  @Get('recent-orders')
  getRecentOrders(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.dashboardService.getRecentOrders(dateFrom, dateTo);
  }

  /** GET /api/dashboard/inventory */
  @Get('inventory')
  getInventory() {
    return this.dashboardService.getInventory();
  }
}
