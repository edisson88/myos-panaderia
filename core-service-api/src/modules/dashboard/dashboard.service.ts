import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { getBogotaRange, getBogotaDateStr } from '../../common/utils/bogota-date.util';
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
   * medianoche local (-05:00) desplazaría la ventana cinco horas y dejaría
   * fuera todas las entregas del día.
   *
   * "Hoy" (cuando no se pasa dateFrom/dateTo), sin embargo, se decide por el
   * calendario de Bogotá (`getBogotaDateStr`), no por el UTC del servidor: si
   * se usara `new Date()` en UTC, entre las 7pm y medianoche hora Colombia el
   * servidor ya estaría en el día siguiente en UTC y el dashboard dejaría de
   * mostrar los pedidos del día que aún no ha terminado en Bogotá.
   *
   * Es el mismo criterio que aplica el módulo de analítica, para que ambas
   * pantallas informen la misma cifra.
   */
  private getDeliveryDayRange(dateFrom?: string, dateTo?: string): {deliveryFrom: string; deliveryTo: string} {
    const fromStr = dateFrom ?? dateTo ?? getBogotaDateStr();
    const toStr = dateTo ?? dateFrom ?? getBogotaDateStr();

    const from = new Date(`${fromStr}T00:00:00Z`);
    const toDayStart = new Date(`${toStr}T00:00:00Z`);
    const to = new Date(toDayStart.getTime() + 24 * 60 * 60 * 1000);

    return {
      deliveryFrom: from.toISOString(),
      deliveryTo: to.toISOString(),
    };
  }

  /**
   * Límites del día en hora Bogotá, para columnas que guardan un instante real
   * (`created_at`). Las devoluciones se cuentan el día en que se registran.
   *
   * Se ancla explícitamente a America/Bogota (UTC-5 fijo) en vez de usar la
   * hora local del servidor: si el proceso corre en UTC, medianoche del
   * servidor cae a las 7pm en Colombia y las devoluciones de la noche se
   * contarían como del día siguiente.
   */
  private getCreatedDayRange(dateFrom?: string, dateTo?: string): {createdFrom: string; createdTo: string} {
    const { from, to } = getBogotaRange(dateFrom, dateTo);
    return { createdFrom: from, createdTo: to };
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

  async getSummary(dateFrom?: string, dateTo?: string): Promise<DashboardSummary>{
    const { deliveryFrom, deliveryTo } = this.getDeliveryDayRange(dateFrom, dateTo);
    const { createdFrom, createdTo } = this.getCreatedDayRange(dateFrom, dateTo);

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

  async getRecentOrders(dateFrom?: string, dateTo?: string): Promise<DashboardOrder[]> {
    const { deliveryFrom, deliveryTo } = this.getDeliveryDayRange(dateFrom, dateTo);
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