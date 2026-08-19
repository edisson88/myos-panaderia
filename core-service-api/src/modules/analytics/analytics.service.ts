import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import type {
  DeliveredOrderSlim,
  DeliveredItemSlim,
  ProductCatalogRow,
} from './analytics.repository';
import { MAX_PROJECTED_ROWS } from './analytics.repository';
import { Granularity } from './enums/granularity.enum';
import { TtlCache } from '../../common/utils/ttl-cache';

// ── Contrato hacia el frontend ───────────────────────────────────────────────

export interface MetricDelta {
  value: number;
  previous: number;
  /** Variación porcentual vs. período anterior. `null` si no hay base de comparación. */
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
  /** Pedidos entregados sobre el total de pedidos con fecha en el período. */
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

export interface WeekdayPoint {
  weekday: number;
  label: string;
  revenue: number;
  orders: number;
  units: number;
  /** Días de esa jornada dentro del rango (incluye los de venta cero). */
  occurrences: number;
  averageRevenue: number;
  /** Participación sobre los ingresos del rango. */
  sharePct: number;
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
  /** Clasificación ABC (Pareto): A ≤80 %, B ≤95 %, C el resto. */
  abcClass: 'A' | 'B' | 'C';
}

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
  recency: 'activo' | 'en_riesgo' | 'inactivo' | 'sin_compras';
}

export interface ForecastRow {
  productId: string;
  name: string;
  /** Unidades proyectadas por fecha objetivo. */
  byDate: { date: string; label: string; units: number }[];
  totalUnits: number;
  /** Nº de jornadas históricas que respaldan la proyección. */
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

// ── Dataset interno compartido ───────────────────────────────────────────────

interface PeriodDataset {
  orders: DeliveredOrderSlim[];
  items: DeliveredItemSlim[];
  products: Map<string, ProductCatalogRow>;
  truncated: boolean;
}

const WEEKDAY_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

/** Umbrales de recencia, en días desde la última entrega. */
const RECENCY_AT_RISK_DAYS = 14;
const RECENCY_INACTIVE_DAYS = 30;

const DEFAULT_RANGE_DAYS = 30;

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AnalyticsService {
  /**
   * Las ventanas de fechas cerradas producen siempre el mismo resultado, así
   * que se cachean 5 minutos. Además hace que pedir las cinco vistas de la
   * pantalla de analítica golpee Hasura una sola vez.
   */
  private readonly datasetCache = new TtlCache<PeriodDataset>(5 * 60 * 1000);

  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  // ── Helpers de fecha ───────────────────────────────────────────────────────
  //
  // `delivery_date` se persiste como timestamptz a medianoche UTC
  // (p. ej. 2026-08-19T00:00:00+00:00), por lo que la parte de fecha en UTC ES
  // el día operativo. Todo el módulo agrupa en UTC de forma deliberada:
  // convertir a America/Bogota (UTC-5) correría cada entrega al día anterior.

  private toDateKey(iso: string): string {
    return iso.slice(0, 10);
  }

  private parseDateKey(key: string): Date {
    return new Date(`${key}T00:00:00.000Z`);
  }

  private addDays(key: string, days: number): string {
    const d = this.parseDateKey(key);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  private diffDays(fromKey: string, toKey: string): number {
    const ms =
      this.parseDateKey(toKey).getTime() - this.parseDateKey(fromKey).getTime();
    return Math.round(ms / 86_400_000);
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * Normaliza el rango pedido. El intervalo es semiabierto [from, to), y el
   * período de comparación es la ventana contigua de la misma longitud.
   */
  private resolvePeriod(from?: string, to?: string): AnalyticsPeriod {
    // Por defecto: los últimos 30 días, incluyendo hoy.
    const toKey = to ? this.toDateKey(to) : this.addDays(this.todayKey(), 1);
    const fromKey = from
      ? this.toDateKey(from)
      : this.addDays(toKey, -DEFAULT_RANGE_DAYS);

    const days = Math.max(1, this.diffDays(fromKey, toKey));

    return {
      from: fromKey,
      to: toKey,
      previousFrom: this.addDays(fromKey, -days),
      previousTo: fromKey,
      days,
    };
  }

  private buildDelta(value: number, previous: number): MetricDelta {
    const changePct =
      previous === 0 ? null : ((value - previous) / previous) * 100;

    return {
      value: this.round(value),
      previous: this.round(previous),
      changePct: changePct === null ? null : this.round(changePct, 1),
    };
  }

  private round(n: number, decimals = 2): number {
    const f = 10 ** decimals;
    return Math.round((Number(n) || 0) * f) / f;
  }

  // ── Carga del dataset del período (compartida y cacheada) ──────────────────

  private async loadDataset(from: string, to: string): Promise<PeriodDataset> {
    return this.datasetCache.wrap(`${from}|${to}`, async () => {
      const [ordersRes, itemsRes, catalogRes] = await Promise.all([
        this.analyticsRepository.getDeliveredOrders(from, to),
        this.analyticsRepository.getDeliveredItems(from, to),
        this.analyticsRepository.getProductCatalog(),
      ]);

      const products = new Map<string, ProductCatalogRow>();
      for (const p of catalogRes.products) products.set(p.id, p);

      return {
        orders: ordersRes.orders,
        items: itemsRes.order_items,
        products,
        truncated:
          ordersRes.orders.length >= MAX_PROJECTED_ROWS ||
          itemsRes.order_items.length >= MAX_PROJECTED_ROWS,
      };
    });
  }

  // ── 1. Resumen ejecutivo ───────────────────────────────────────────────────

  async getOverview(from?: string, to?: string): Promise<SalesOverview> {
    const period = this.resolvePeriod(from, to);

    const [kpis, current, previous] = await Promise.all([
      this.analyticsRepository.getPeriodKpis(
        period.from,
        period.to,
        period.previousFrom,
        period.previousTo,
      ),
      this.loadDataset(period.from, period.to),
      this.loadDataset(period.previousFrom, period.previousTo),
    ]);

    const curRevenue = kpis.current_revenue.aggregate.sum?.total ?? 0;
    const prevRevenue = kpis.previous_revenue.aggregate.sum?.total ?? 0;
    const curOrders = kpis.current_revenue.aggregate.count;
    const prevOrders = kpis.previous_revenue.aggregate.count;
    const curAllOrders = kpis.current_all_orders.aggregate.count;
    const prevAllOrders = kpis.previous_all_orders.aggregate.count;

    const distinct = (rows: DeliveredOrderSlim[]) =>
      new Set(rows.map((o) => o.customer_id).filter(Boolean)).size;

    return {
      period,
      revenue: this.buildDelta(curRevenue, prevRevenue),
      deliveredOrders: this.buildDelta(curOrders, prevOrders),
      averageTicket: this.buildDelta(
        kpis.current_revenue.aggregate.avg?.total ?? 0,
        kpis.previous_revenue.aggregate.avg?.total ?? 0,
      ),
      unitsSold: this.buildDelta(
        kpis.current_units.aggregate.sum?.quantity ?? 0,
        kpis.previous_units.aggregate.sum?.quantity ?? 0,
      ),
      activeCustomers: this.buildDelta(
        distinct(current.orders),
        distinct(previous.orders),
      ),
      fulfillmentRate: this.buildDelta(
        curAllOrders === 0 ? 0 : (curOrders / curAllOrders) * 100,
        prevAllOrders === 0 ? 0 : (prevOrders / prevAllOrders) * 100,
      ),
      issueOrders: this.buildDelta(
        kpis.current_issues.aggregate.count,
        kpis.previous_issues.aggregate.count,
      ),
    };
  }

  // ── 2. Serie temporal de ventas ────────────────────────────────────────────

  private bucketKey(dateKey: string, granularity: Granularity): string {
    if (granularity === Granularity.MONTH) return dateKey.slice(0, 7);

    if (granularity === Granularity.WEEK) {
      // Se ancla al lunes de la semana ISO.
      const d = this.parseDateKey(dateKey);
      const dow = d.getUTCDay();
      const backToMonday = dow === 0 ? 6 : dow - 1;
      return this.addDays(dateKey, -backToMonday);
    }

    return dateKey;
  }

  private bucketLabel(bucket: string, granularity: Granularity): string {
    if (granularity === Granularity.MONTH) {
      const [y, m] = bucket.split('-');
      return `${MONTH_LABELS[Number(m) - 1]} ${y}`;
    }

    const d = this.parseDateKey(bucket);
    const label = `${String(d.getUTCDate()).padStart(2, '0')} ${MONTH_LABELS[d.getUTCMonth()]}`;

    return granularity === Granularity.WEEK ? `Sem. ${label}` : label;
  }

  /** Enumera todos los buckets del rango para que la serie no tenga huecos. */
  private enumerateBuckets(
    period: AnalyticsPeriod,
    granularity: Granularity,
  ): string[] {
    const seen: string[] = [];
    const known = new Set<string>();

    for (let cursor = period.from; cursor < period.to; cursor = this.addDays(cursor, 1)) {
      const bucket = this.bucketKey(cursor, granularity);
      if (!known.has(bucket)) {
        known.add(bucket);
        seen.push(bucket);
      }
    }

    return seen;
  }

  async getSalesTimeseries(
    from?: string,
    to?: string,
    granularity: Granularity = Granularity.DAY,
  ): Promise<{ period: AnalyticsPeriod; granularity: Granularity; points: TimeseriesPoint[] }> {
    const period = this.resolvePeriod(from, to);
    const data = await this.loadDataset(period.from, period.to);

    const revenue = new Map<string, number>();
    const orders = new Map<string, number>();
    const units = new Map<string, number>();

    for (const order of data.orders) {
      const bucket = this.bucketKey(this.toDateKey(order.delivery_date), granularity);
      revenue.set(bucket, (revenue.get(bucket) ?? 0) + Number(order.total));
      orders.set(bucket, (orders.get(bucket) ?? 0) + 1);
    }

    for (const item of data.items) {
      if (!item.order) continue;
      const bucket = this.bucketKey(this.toDateKey(item.order.delivery_date), granularity);
      units.set(bucket, (units.get(bucket) ?? 0) + Number(item.quantity));
    }

    const points = this.enumerateBuckets(period, granularity).map((bucket) => {
      const r = revenue.get(bucket) ?? 0;
      const o = orders.get(bucket) ?? 0;

      return {
        bucket,
        label: this.bucketLabel(bucket, granularity),
        revenue: this.round(r),
        orders: o,
        units: this.round(units.get(bucket) ?? 0),
        averageTicket: o === 0 ? 0 : this.round(r / o),
      };
    });

    return { period, granularity, points };
  }

  // ── 3. Estacionalidad por día de semana ────────────────────────────────────

  async getWeekdaySeasonality(
    from?: string,
    to?: string,
  ): Promise<{ period: AnalyticsPeriod; points: WeekdayPoint[] }> {
    const period = this.resolvePeriod(from, to);
    const data = await this.loadDataset(period.from, period.to);

    const revenue = new Array<number>(7).fill(0);
    const orders = new Array<number>(7).fill(0);
    const units = new Array<number>(7).fill(0);
    const occurrences = new Array<number>(7).fill(0);

    // Se cuentan TODAS las jornadas del rango, incluidas las de venta cero:
    // si la panadería no despacha los domingos, el promedio debe reflejarlo.
    for (let cursor = period.from; cursor < period.to; cursor = this.addDays(cursor, 1)) {
      occurrences[this.parseDateKey(cursor).getUTCDay()] += 1;
    }

    for (const order of data.orders) {
      const dow = this.parseDateKey(this.toDateKey(order.delivery_date)).getUTCDay();
      revenue[dow] += Number(order.total);
      orders[dow] += 1;
    }

    for (const item of data.items) {
      if (!item.order) continue;
      const dow = this.parseDateKey(this.toDateKey(item.order.delivery_date)).getUTCDay();
      units[dow] += Number(item.quantity);
    }

    const totalRevenue = revenue.reduce((a, b) => a + b, 0);

    // Se presenta de lunes a domingo, el orden natural de la semana operativa.
    const order_ = [1, 2, 3, 4, 5, 6, 0];

    return {
      period,
      points: order_.map((dow) => ({
        weekday: dow,
        label: WEEKDAY_LABELS[dow],
        revenue: this.round(revenue[dow]),
        orders: orders[dow],
        units: this.round(units[dow]),
        occurrences: occurrences[dow],
        averageRevenue:
          occurrences[dow] === 0 ? 0 : this.round(revenue[dow] / occurrences[dow]),
        sharePct:
          totalRevenue === 0 ? 0 : this.round((revenue[dow] / totalRevenue) * 100, 1),
      })),
    };
  }

  // ── 4. Ranking de productos + análisis ABC ─────────────────────────────────

  async getProductRanking(
    from?: string,
    to?: string,
    limit?: number,
  ): Promise<{ period: AnalyticsPeriod; rows: ProductRankRow[]; totalRevenue: number }> {
    const period = this.resolvePeriod(from, to);
    const data = await this.loadDataset(period.from, period.to);

    interface Acc {
      revenue: number;
      units: number;
      orders: Set<string>;
    }
    const acc = new Map<string, Acc>();

    for (const item of data.items) {
      if (!item.product_id) continue;

      const entry = acc.get(item.product_id) ?? {
        revenue: 0,
        units: 0,
        orders: new Set<string>(),
      };

      entry.revenue += Number(item.subtotal);
      entry.units += Number(item.quantity);
      if (item.order) entry.orders.add(item.order.id);

      acc.set(item.product_id, entry);
    }

    const totalRevenue = Array.from(acc.values()).reduce((a, e) => a + e.revenue, 0);

    const sorted = Array.from(acc.entries()).sort(
      (a, b) => b[1].revenue - a[1].revenue,
    );

    let cumulative = 0;
    const rows: ProductRankRow[] = sorted.map(([productId, entry]) => {
      const sharePct = totalRevenue === 0 ? 0 : (entry.revenue / totalRevenue) * 100;
      cumulative += sharePct;

      return {
        productId,
        name: data.products.get(productId)?.name?.trim() || 'Producto no catalogado',
        revenue: this.round(entry.revenue),
        units: this.round(entry.units),
        orders: entry.orders.size,
        averageUnitPrice: entry.units === 0 ? 0 : this.round(entry.revenue / entry.units),
        sharePct: this.round(sharePct, 1),
        cumulativeSharePct: this.round(cumulative, 1),
        abcClass: cumulative <= 80 ? 'A' : cumulative <= 95 ? 'B' : 'C',
      };
    });

    return {
      period,
      totalRevenue: this.round(totalRevenue),
      rows: limit ? rows.slice(0, limit) : rows,
    };
  }

  // ── 5. Ranking de clientes + recencia ──────────────────────────────────────

  async getCustomerRanking(
    from?: string,
    to?: string,
    limit?: number,
  ): Promise<{ period: AnalyticsPeriod; rows: CustomerRankRow[]; totalRevenue: number }> {
    const period = this.resolvePeriod(from, to);

    const [data, recency] = await Promise.all([
      this.loadDataset(period.from, period.to),
      this.analyticsRepository.getCustomerRecency(),
    ]);

    const acc = new Map<string, { revenue: number; orders: number; name: string }>();

    for (const order of data.orders) {
      if (!order.customer_id) continue;

      const entry = acc.get(order.customer_id) ?? {
        revenue: 0,
        orders: 0,
        name: order.customer?.name?.trim() || 'Cliente sin nombre',
      };

      entry.revenue += Number(order.total);
      entry.orders += 1;
      acc.set(order.customer_id, entry);
    }

    const totalRevenue = Array.from(acc.values()).reduce((a, e) => a + e.revenue, 0);
    const today = this.todayKey();

    // Se parte del catálogo de clientes activos para que también aparezcan los
    // que NO compraron en el período: son justamente los que hay que recuperar.
    const rows: CustomerRankRow[] = recency.customers.map((c) => {
      const entry = acc.get(c.id);
      const lastPurchase = c.orders[0]?.delivery_date
        ? this.toDateKey(c.orders[0].delivery_date)
        : null;

      const daysSince = lastPurchase ? this.diffDays(lastPurchase, today) : null;

      let status: CustomerRankRow['recency'] = 'sin_compras';
      if (daysSince !== null) {
        status =
          daysSince <= RECENCY_AT_RISK_DAYS
            ? 'activo'
            : daysSince <= RECENCY_INACTIVE_DAYS
              ? 'en_riesgo'
              : 'inactivo';
      }

      const revenue = entry?.revenue ?? 0;
      const orders = entry?.orders ?? 0;

      return {
        customerId: c.id,
        name: c.name?.trim() || 'Cliente sin nombre',
        label: c.label,
        revenue: this.round(revenue),
        orders,
        averageTicket: orders === 0 ? 0 : this.round(revenue / orders),
        sharePct: totalRevenue === 0 ? 0 : this.round((revenue / totalRevenue) * 100, 1),
        lastPurchase,
        daysSinceLastPurchase: daysSince,
        recency: status,
      };
    });

    rows.sort((a, b) => b.revenue - a.revenue);

    return {
      period,
      totalRevenue: this.round(totalRevenue),
      rows: limit ? rows.slice(0, limit) : rows,
    };
  }

  // ── 6. Pronóstico de demanda para producción ───────────────────────────────

  /**
   * Proyecta unidades por producto para los próximos días.
   *
   * Método: promedio por día de semana sobre las últimas N semanas. Es el
   * modelo correcto para una panadería porque la demanda es fuertemente
   * semanal — un sábado se parece mucho más al sábado anterior que al viernes.
   *
   * El denominador cuenta TODAS las jornadas de ese día de semana en la
   * ventana, no solo las que tuvieron ventas, de modo que una jornada sin
   * despachos proyecta cero en lugar de inflar el promedio.
   */
  async getDemandForecast(
    days = 7,
    lookbackWeeks = 8,
  ): Promise<DemandForecast> {
    const today = this.todayKey();
    const lookbackTo = this.addDays(today, 1);
    const lookbackFrom = this.addDays(lookbackTo, -lookbackWeeks * 7);

    const data = await this.loadDataset(lookbackFrom, lookbackTo);

    // Jornadas por día de semana dentro de la ventana histórica.
    const occurrences = new Array<number>(7).fill(0);
    for (let c = lookbackFrom; c < lookbackTo; c = this.addDays(c, 1)) {
      occurrences[this.parseDateKey(c).getUTCDay()] += 1;
    }

    // Unidades acumuladas por producto y día de semana.
    const unitsByProductDow = new Map<string, number[]>();

    for (const item of data.items) {
      if (!item.product_id || !item.order) continue;

      const dow = this.parseDateKey(this.toDateKey(item.order.delivery_date)).getUTCDay();
      const row = unitsByProductDow.get(item.product_id) ?? new Array<number>(7).fill(0);
      row[dow] += Number(item.quantity);
      unitsByProductDow.set(item.product_id, row);
    }

    const targets = Array.from({ length: days }, (_, i) => {
      const date = this.addDays(today, i + 1);
      const weekday = this.parseDateKey(date).getUTCDay();
      return { date, label: WEEKDAY_LABELS[weekday], weekday };
    });

    const rows: ForecastRow[] = [];

    for (const [productId, dowUnits] of unitsByProductDow) {
      const byDate = targets.map((t) => ({
        date: t.date,
        label: t.label,
        units:
          occurrences[t.weekday] === 0
            ? 0
            : this.round(dowUnits[t.weekday] / occurrences[t.weekday], 1),
      }));

      const totalUnits = this.round(byDate.reduce((a, b) => a + b.units, 0), 1);

      // Un producto sin demanda proyectada no aporta nada al plan de producción.
      if (totalUnits <= 0) continue;

      rows.push({
        productId,
        name: data.products.get(productId)?.name?.trim() || 'Producto no catalogado',
        byDate,
        totalUnits,
        observations: targets.reduce((a, t) => a + occurrences[t.weekday], 0),
      });
    }

    rows.sort((a, b) => b.totalUnits - a.totalUnits);

    return {
      generatedFor: targets,
      lookbackFrom,
      lookbackTo,
      lookbackWeeks,
      rows,
      totalUnits: this.round(rows.reduce((a, r) => a + r.totalUnits, 0), 1),
    };
  }
}
