import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** GET /api/dashboard/summary */
  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  /** GET /api/dashboard/recent-orders */
  @Get('recent-orders')
  getRecentOrders() {
    return this.dashboardService.getRecentOrders();
  }

  /** GET /api/dashboard/alerts */
  @Get('alerts')
  getAlerts() {
    return this.dashboardService.getAlerts();
  }
}
