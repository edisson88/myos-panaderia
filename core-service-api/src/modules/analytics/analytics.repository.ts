import { Injectable } from '@nestjs/common';
import { HasuraService } from '../../shared/hasura/hasura.service';
import {
  GET_PERIOD_KPIS,
  GET_DELIVERED_ORDERS_SLIM,
  GET_DELIVERED_ITEMS_SLIM,
  GET_PRODUCT_CATALOG,
  GET_CUSTOMER_RECENCY,
} from './analytics.queries';

// ── Tipos de respuesta de Hasura ─────────────────────────────────────────────

interface CountSumAvg {
  aggregate: {
    count: number;
    sum: { total: number | null } | null;
    avg: { total: number | null } | null;
  };
}

interface CountOnly {
  aggregate: { count: number };
}

interface QuantitySum {
  aggregate: { sum: { quantity: number | null } | null };
}

export interface PeriodKpisData {
  current_revenue: CountSumAvg;
  current_units: QuantitySum;
  current_all_orders: CountOnly;
  current_issues: CountSumAvg;
  previous_revenue: CountSumAvg;
  previous_units: QuantitySum;
  previous_all_orders: CountOnly;
  previous_issues: CountOnly;
}

export interface DeliveredOrderSlim {
  id: string;
  total: number;
  delivery_date: string;
  customer_id: string | null;
  customer: { name: string } | null;
}

export interface DeliveredItemSlim {
  product_id: string | null;
  quantity: number;
  subtotal: number;
  order: { id: string; delivery_date: string } | null;
}

export interface ProductCatalogRow {
  id: string;
  name: string;
  unit_price: number;
  active: boolean;
}

export interface CustomerRecencyRow {
  id: string;
  name: string;
  label: string | null;
  orders_aggregate: {
    aggregate: {
      count: number;
      sum: { total: number | null } | null;
    };
  };
  orders: { delivery_date: string }[];
}

/**
 * Tope defensivo de filas por consulta proyectada.
 *
 * No es un límite de negocio sino un cortafuegos: si una ventana de fechas
 * devuelve más filas que esto, el servicio lo detecta y avisa en la respuesta
 * en vez de truncar en silencio. Con el volumen actual (~1.6 k líneas en dos
 * meses) da margen para varios años de operación.
 */
export const MAX_PROJECTED_ROWS = 50_000;

// ── Repository ───────────────────────────────────────────────────────────────

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly hasuraService: HasuraService) {}

  async getPeriodKpis(
    from: string,
    to: string,
    prevFrom: string,
    prevTo: string,
  ): Promise<PeriodKpisData> {
    return this.hasuraService.query<PeriodKpisData>(GET_PERIOD_KPIS, {
      from,
      to,
      prevFrom,
      prevTo,
    });
  }

  async getDeliveredOrders(
    from: string,
    to: string,
  ): Promise<{ orders: DeliveredOrderSlim[] }> {
    return this.hasuraService.query<{ orders: DeliveredOrderSlim[] }>(
      GET_DELIVERED_ORDERS_SLIM,
      { from, to, limit: MAX_PROJECTED_ROWS },
    );
  }

  async getDeliveredItems(
    from: string,
    to: string,
  ): Promise<{ order_items: DeliveredItemSlim[] }> {
    return this.hasuraService.query<{ order_items: DeliveredItemSlim[] }>(
      GET_DELIVERED_ITEMS_SLIM,
      { from, to, limit: MAX_PROJECTED_ROWS },
    );
  }

  async getProductCatalog(): Promise<{ products: ProductCatalogRow[] }> {
    return this.hasuraService.query<{ products: ProductCatalogRow[] }>(
      GET_PRODUCT_CATALOG,
    );
  }

  async getCustomerRecency(): Promise<{ customers: CustomerRecencyRow[] }> {
    return this.hasuraService.query<{ customers: CustomerRecencyRow[] }>(
      GET_CUSTOMER_RECENCY,
    );
  }
}
