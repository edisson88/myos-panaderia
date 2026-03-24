import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
  ) {}

  async getSales(): Promise<object> {
    await this.analyticsRepository.getSalesData();
    return { message: 'Sales analytics — TODO' };
  }

  async getProduction(): Promise<object> {
    await this.analyticsRepository.getProductionData();
    return { message: 'Production analytics — TODO' };
  }
}
