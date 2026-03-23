import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  async getSummary(): Promise<object> {
    // TODO: query aggregate data and shape into frontend-ready KPIs
    await this.dashboardRepository.getSummaryData();
    return { message: 'Dashboard summary — TODO' };
  }

  async getRecentOrders(): Promise<object> {
    // TODO: query last orders and format for the dashboard table
    await this.dashboardRepository.getRecentOrdersData();
    return { message: 'Recent orders — TODO' };
  }

  async getAlerts(): Promise<object> {
    // TODO: derive alerts from order statuses and business rules
    await this.dashboardRepository.getAlertsData();
    return { message: 'Alerts — TODO' };
  }
}
