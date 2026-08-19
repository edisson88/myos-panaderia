import { apiRequest } from '../../services/api';

// ── Tipos espejo del backend analytics.service.ts ────────────────────────────

export type Granularity = 'day' | 'week' | 'month';

export interface MetricDelta {
  value: number;
  previous: number;
  /** Variación porcentual vs. período anterior. `null` si no hay base. */
  changePct: number | null;
}

export interface AnalyticsPeriod {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  days: number;
}

export interface SalesOverview {
  period: AnalyticsPeriod;
  revenue: MetricDelta;
  deliveredOrders: MetricDelta;
  averageTicket: MetricDelta;
  unitsSold: MetricDelta;
  activeCustomers: MetricDelta;
  fulfillmentRate: MetricDelta;
  issueOrders: MetricDelta;
}

export interface TimeseriesPoint {
  bucket: string;
  label: string;
  revenue: number;
  orders: number;
  units: number;
  averageTicket: number;
}

export interface SalesTimeseries {
  period: AnalyticsPeriod;
  granularity: Granularity;
  points: TimeseriesPoint[];
}

export interface WeekdayPoint {
  weekday: number;
  label: string;
  revenue: number;
  orders: number;
  units: number;
  occurrences: number;
  averageRevenue: number;
  sharePct: number;
}

export interface WeekdaySeasonality {
  period: AnalyticsPeriod;
  points: WeekdayPoint[];
}

export interface ProductRankRow {
  productId: string;
  name: string;
  revenue: number;
  units: number;
  orders: number;
  averageUnitPrice: number;
  sharePct: number;
  cumulativeSharePct: number;
  abcClass: 'A' | 'B' | 'C';
}

export interface ProductRanking {
  period: AnalyticsPeriod;
  rows: ProductRankRow[];
  totalRevenue: number;
}

export type CustomerRecency = 'activo' | 'en_riesgo' | 'inactivo' | 'sin_compras';

export interface CustomerRankRow {
  customerId: string;
  name: string;
  label: string | null;
  revenue: number;
  orders: number;
  averageTicket: number;
  sharePct: number;
  lastPurchase: string | null;
  daysSinceLastPurchase: number | null;
  recency: CustomerRecency;
}

export interface CustomerRanking {
  period: AnalyticsPeriod;
  rows: CustomerRankRow[];
  totalRevenue: number;
}

export interface ForecastRow {
  productId: string;
  name: string;
  byDate: { date: string; label: string; units: number }[];
  totalUnits: number;
  observations: number;
}

export interface DemandForecast {
  generatedFor: { date: string; label: string; weekday: number }[];
  lookbackFrom: string;
  lookbackTo: string;
  lookbackWeeks: number;
  rows: ForecastRow[];
  totalUnits: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildRangeQuery(
  from: string,
  to: string,
  extra?: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams({ from, to });

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }

  return params.toString();
}

// ── API Calls ────────────────────────────────────────────────────────────────

export async function fetchOverview(
  token: string,
  from: string,
  to: string,
): Promise<SalesOverview> {
  return apiRequest<SalesOverview>(
    `/analytics/overview?${buildRangeQuery(from, to)}`,
    { method: 'GET' },
    token,
  );
}

export async function fetchSalesTimeseries(
  token: string,
  from: string,
  to: string,
  granularity: Granularity,
): Promise<SalesTimeseries> {
  return apiRequest<SalesTimeseries>(
    `/analytics/sales/timeseries?${buildRangeQuery(from, to, { granularity })}`,
    { method: 'GET' },
    token,
  );
}

export async function fetchWeekdaySeasonality(
  token: string,
  from: string,
  to: string,
): Promise<WeekdaySeasonality> {
  return apiRequest<WeekdaySeasonality>(
    `/analytics/sales/weekday?${buildRangeQuery(from, to)}`,
    { method: 'GET' },
    token,
  );
}

export async function fetchProductRanking(
  token: string,
  from: string,
  to: string,
): Promise<ProductRanking> {
  return apiRequest<ProductRanking>(
    `/analytics/products/ranking?${buildRangeQuery(from, to)}`,
    { method: 'GET' },
    token,
  );
}

export async function fetchCustomerRanking(
  token: string,
  from: string,
  to: string,
): Promise<CustomerRanking> {
  return apiRequest<CustomerRanking>(
    `/analytics/customers/ranking?${buildRangeQuery(from, to)}`,
    { method: 'GET' },
    token,
  );
}

export async function fetchDemandForecast(
  token: string,
  days = 7,
  lookbackWeeks = 8,
): Promise<DemandForecast> {
  const params = new URLSearchParams({
    days: String(days),
    lookbackWeeks: String(lookbackWeeks),
  });

  return apiRequest<DemandForecast>(
    `/analytics/production/demand-forecast?${params.toString()}`,
    { method: 'GET' },
    token,
  );
}
