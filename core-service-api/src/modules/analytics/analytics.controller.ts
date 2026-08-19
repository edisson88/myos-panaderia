import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsRangeDto, DemandForecastDto } from './dto/analytics-range.dto';
import { Granularity } from './enums/granularity.enum';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** GET /api/analytics/overview?from&to — KPIs del período vs. el anterior */
  @Get('overview')
  getOverview(@Query() query: AnalyticsRangeDto) {
    return this.analyticsService.getOverview(query.from, query.to);
  }

  /** GET /api/analytics/sales/timeseries?from&to&granularity */
  @Get('sales/timeseries')
  getSalesTimeseries(@Query() query: AnalyticsRangeDto) {
    return this.analyticsService.getSalesTimeseries(
      query.from,
      query.to,
      query.granularity ?? Granularity.DAY,
    );
  }

  /** GET /api/analytics/sales/weekday?from&to — estacionalidad semanal */
  @Get('sales/weekday')
  getWeekdaySeasonality(@Query() query: AnalyticsRangeDto) {
    return this.analyticsService.getWeekdaySeasonality(query.from, query.to);
  }

  /** GET /api/analytics/products/ranking?from&to&limit — ranking + ABC */
  @Get('products/ranking')
  getProductRanking(@Query() query: AnalyticsRangeDto) {
    return this.analyticsService.getProductRanking(
      query.from,
      query.to,
      query.limit,
    );
  }

  /** GET /api/analytics/customers/ranking?from&to&limit — ranking + recencia */
  @Get('customers/ranking')
  getCustomerRanking(@Query() query: AnalyticsRangeDto) {
    return this.analyticsService.getCustomerRanking(
      query.from,
      query.to,
      query.limit,
    );
  }

  /** GET /api/analytics/production/demand-forecast?days&lookbackWeeks */
  @Get('production/demand-forecast')
  getDemandForecast(@Query() query: DemandForecastDto) {
    return this.analyticsService.getDemandForecast(
      query.days ?? 7,
      query.lookbackWeeks ?? 8,
    );
  }
}
