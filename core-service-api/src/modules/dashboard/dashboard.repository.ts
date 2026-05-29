import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import { GET_SUMMARY_QUERY } from './query/get-summary.query';
import { GET_RECENT_ORDERS_QUERY } from './query/get-recent-orders.query';
import { GET_INVENTORY_QUERY } from './query/get-inventory.query';


// ── Tipos de respuesta de Hasura ──────────────────────────────────────────────
interface OrderAggregate{
  aggregate: {
    count: number;
    sum: { total: number } | null;
  }
} 

interface ReturnNode{
  quantity: number;
  product: {
    unit_price: number;
  }
}

interface ReturnsAggregate{
  aggregate: {sum: { quantity: number } | null};
  nodes: ReturnNode[];
}

interface TopCustomer{
  total: number;
  customer: { name: string } | null;
}

interface TopProductNode{
  subtotal: number;
  products: { name: string }[] | null;
}

export interface SummaryData {
 completed_orders: OrderAggregate;
 returns_today: ReturnsAggregate;
 top_customers: TopCustomer[];
 top_products: { nodes: TopProductNode[] } | null;
}

interface OrderItem{
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: { name: string }[] | null;
}

export interface RecentOrderData {
  id: string;
  order_code: string;
  status: string;
  total: number;
  created_at: string;
  delivery_date: string | null;
  notes: string | null;
  customer: { name: string; phone: string; address: string } | null;
  order_items: OrderItem[];
}


interface ProductionConfig {
  sale_unit_name: string;
  units_per_tray: number;
}

export interface InventoryData {
  id: string;
  available_quantity: number;
  reserved_quantity: number;
  damaged_quantity: number;
  minimum_stock: number;
  product: {
    id: string;
    name: string;
    product_production_config: ProductionConfig | null;
  };
}

// ── Repository ────────────────────────────────────────────────────────────────


@Injectable()
export class DashboardRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async getSummaryData(
    today: string,
    tomorrow: string,
  ): Promise<SummaryData> {
    return this.hasuraService.query<SummaryData>(
      GET_SUMMARY_QUERY,
      { today, tomorrow }
    );
  }

  async getRecentOrdersData(
    today: string,
    tomorrow: string,
  ): Promise<{ orders: RecentOrderData[] }> {
    return this.hasuraService.query<{ orders: RecentOrderData[] }>(
      GET_RECENT_ORDERS_QUERY,
      { today, tomorrow }
    );
  }

  async getInventoryData(): Promise<{ product_inventory: InventoryData[] }> {
    return this.hasuraService.query<{ product_inventory: InventoryData[] }>(
      GET_INVENTORY_QUERY,
    );
  }
}



