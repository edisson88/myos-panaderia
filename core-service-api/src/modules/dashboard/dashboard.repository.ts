import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  // TODO: implement — aggregate query for KPIs (total orders, revenue, pending, etc.)
  async getSummaryData(): Promise<null> {
    return null;
  }

  // TODO: implement — last N orders with customer name, status, total
  async getRecentOrdersData(): Promise<null> {
    return null;
  }

  // TODO: implement — orders with status warnings, low stock alerts, etc.
  async getAlertsData(): Promise<null> {
    return null;
  }
}
