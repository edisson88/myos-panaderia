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

  /**
   * Límites del DÍA OPERATIVO, en UTC.
   *
   * `delivery_date` se persiste como timestamptz a medianoche UTC
   * (2026-08-19T00:00:00Z), así que sus límites deben calcularse en UTC. Usar
   * medianoche local desplazaría la ventana cinco horas en Colombia (UTC-5) y
   * dejaría fuera todas las entregas del día.
   *
   * Es el mismo criterio que aplica el módulo de analítica, para que ambas
   * pantallas informen la misma cifra.
   */
  private getDeliveryDayRange(): {deliveryFrom: string; deliveryTo: string} {
    const now = new Date();

    const from = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ));

    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + 1);

    return {
      deliveryFrom: from.toISOString(),
      deliveryTo: to.toISOString(),
    };
  }

  /**
   * Límites del día en hora local, para columnas que guardan un instante real
   * (`created_at`). Las devoluciones se cuentan el día en que se registran.
   */
  private getCreatedDayRange(): {createdFrom: string; createdTo: string} {
    const now = new Date();

    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    return {
      createdFrom: from.toISOString(),
      createdTo: to.toISOString(),
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
    const { deliveryFrom, deliveryTo } = this.getDeliveryDayRange();
    const { createdFrom, createdTo } = this.getCreatedDayRange();

    const data = await this.dashboardRepository.getSummaryData(
      deliveryFrom,
      deliveryTo,
      createdFrom,
      createdTo,
    );

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
    const { deliveryFrom, deliveryTo } = this.getDeliveryDayRange();
    const data = await this.dashboardRepository.getRecentOrdersData(
      deliveryFrom,
      deliveryTo,
    );

    return data.orders.map((order) => this.mapOrder(order));
  }

  async getInventory(): Promise<DashboardInventoryItem[]> {
    const data = await this.dashboardRepository.getInventoryData();

    return data.product_inventory.map((item) => this.mapInventoryItem(item));
  }
  
}