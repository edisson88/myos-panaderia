import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** GET /api/analytics/sales */
  @Get('sales')
  getSales() {
    return this.analyticsService.getSales();
  }

  /** GET /api/analytics/production */
  @Get('production')
  getProduction() {
    return this.analyticsService.getProduction();
  }
}
