import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import type { 
  SummaryData, 
  RecentOrderData, 
  InventoryData,
} from './dashboard.repository';


// ── Tipos de respuesta hacia el frontend ──────────────────────────────────────

export interface DashboardKpis {
  completedOrders: number;
  dailyRevenue: number;
  dailyReturns: number;
}

export interface TopCustomer {
  name: string;
  total: number;
}

export interface TopProduct {
  name: string;
  total: number;
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  topCustomers: TopCustomer[];
  topProducts: TopProduct[];
}

export interface DashboardOrderItem {
  id: string;
  productName: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface DashboardOrder  {
  id: string;
  orderCode: string;
  status: string;
  total: number;
  createdAt: string;
  deliveryDate: string | null;
  notes: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  items: DashboardOrderItem [];
}

export interface DashboardInventoryItem {
  id: string;
  productName: string;
  saleUnitName: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  minimumStock: number;
  belowMinimum: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
  ) {}

  // ── Helpers privados ────────────────────────────────────────────────────────

  private getTodayRange(): {today: string; tomorrow: string} {
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      today: today.toISOString(),
      tomorrow: tomorrow.toISOString(),
    };
  }

  private calcDailyReturns(data: SummaryData): number {
    return data.returns_today.nodes.reduce((acc, node) => {
      return acc + node.quantity * node.product.unit_price;
    },0);
  }

  private mapTopProducts(data: SummaryData): TopProduct[] {
    const productMap = new Map<string, number>();

    for (const node of data.top_products?.nodes || []) {
      const name = node.products?.[0]?.name || 'Unknown Product';
      const current = productMap.get(name) ?? 0;
      productMap.set(name, current + node.subtotal);
  }

    return Array.from(productMap.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  }

  private mapOrder(order: RecentOrderData): DashboardOrder {
    return {
      id: order.id,
      orderCode: order.order_code,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      deliveryDate: order.delivery_date,
      notes: order.notes,
      customerName: order.customer?.name || null,
      customerPhone: order.customer?.phone || null,
      customerAddress: order.customer?.address || null,
      items: order.order_items.map((item) => ({
        id: item.id,
        productName: item.products?.[0]?.name || null,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.subtotal,
      })),
    };
  }

  private mapInventoryItem(item: InventoryData): DashboardInventoryItem {
    return {
      id: item.id,
      productName: item.product.name,
      saleUnitName: item.product.product_production_config?.sale_unit_name || null,
      availableQuantity: item.available_quantity,
      reservedQuantity: item.reserved_quantity,
      damagedQuantity: item.damaged_quantity,
      minimumStock: item.minimum_stock,
      belowMinimum: item.available_quantity < item.minimum_stock,
    };
  }

  // ── Métodos públicos ────────────────────────────────────────────────────────

  async getSummary(): Promise<DashboardSummary>{
    const { today, tomorrow } = this.getTodayRange();
    const data = await this.dashboardRepository.getSummaryData(today, tomorrow);

    return {
      kpis: {
        completedOrders: data.completed_orders.aggregate.count,
        dailyRevenue: data.completed_orders.aggregate.sum?.total || 0,
        dailyReturns: this.calcDailyReturns(data),
      },
      topCustomers: data.top_customers
      .filter((o) => o.customer !== null)
      .map((o) => ({
        name: o.customer?.name || 'Unknown Customer',
        total: o.total,
      })),
      topProducts: this.mapTopProducts(data),
    };
  }

  async getRecentOrders(): Promise<DashboardOrder[]> {
    const { today, tomorrow } = this.getTodayRange();
    const data = await this.dashboardRepository.getRecentOrdersData(today, tomorrow);

    return data.orders.map((order) => this.mapOrder(order));
  }

  async getInventory(): Promise<DashboardInventoryItem[]> {
    const data = await this.dashboardRepository.getInventoryData();

    return data.product_inventory.map((item) => this.mapInventoryItem(item));
  }
  
}