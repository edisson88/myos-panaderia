// ─────────────────────────────────────────────────────────────────────────────
// analytics.queries.ts
// Todas las operaciones GraphQL del módulo analytics en un solo lugar.
//
// Estrategia de escalabilidad:
//   - Los KPIs usan *_aggregate: Postgres hace la suma/conteo, viaja un solo
//     número por métrica. El costo no crece con el volumen de pedidos.
//   - Los desgloses (producto, día de semana, serie temporal) usan UNA consulta
//     proyectada por ventana de tiempo — solo las columnas necesarias — y se
//     agrupan en memoria. Se prefiere esto sobre cientos de agregados aliased:
//     medido contra el Hasura de UAT, 112 agregados aliased tardan ~4.7 s
//     mientras que una proyección de un año completo tarda ~1.1 s.
//   - Toda consulta está acotada por rango de fechas y por LIMIT explícito.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * KPIs del período: se resuelven íntegramente en Postgres.
 * Se piden el período actual y el anterior en una sola ida y vuelta para
 * poder calcular variaciones sin una segunda petición.
 */
export const GET_PERIOD_KPIS = `
  query GetPeriodKpis(
    $from: timestamptz!
    $to: timestamptz!
    $prevFrom: timestamptz!
    $prevTo: timestamptz!
  ) {
    current_revenue: orders_aggregate(
      where: {
        status: { _eq: "delivered" }
        delivery_date: { _gte: $from, _lt: $to }
      }
    ) {
      aggregate {
        count
        sum { total }
        avg { total }
      }
    }

    current_units: order_items_aggregate(
      where: {
        order: {
          status: { _eq: "delivered" }
          delivery_date: { _gte: $from, _lt: $to }
        }
      }
    ) {
      aggregate {
        sum { quantity }
      }
    }

    current_all_orders: orders_aggregate(
      where: { delivery_date: { _gte: $from, _lt: $to } }
    ) {
      aggregate { count }
    }

    current_issues: orders_aggregate(
      where: {
        status: { _eq: "with_issue" }
        delivery_date: { _gte: $from, _lt: $to }
      }
    ) {
      aggregate {
        count
        sum { total }
      }
    }

    previous_revenue: orders_aggregate(
      where: {
        status: { _eq: "delivered" }
        delivery_date: { _gte: $prevFrom, _lt: $prevTo }
      }
    ) {
      aggregate {
        count
        sum { total }
        avg { total }
      }
    }

    previous_units: order_items_aggregate(
      where: {
        order: {
          status: { _eq: "delivered" }
          delivery_date: { _gte: $prevFrom, _lt: $prevTo }
        }
      }
    ) {
      aggregate {
        sum { quantity }
      }
    }

    previous_all_orders: orders_aggregate(
      where: { delivery_date: { _gte: $prevFrom, _lt: $prevTo } }
    ) {
      aggregate { count }
    }

    previous_issues: orders_aggregate(
      where: {
        status: { _eq: "with_issue" }
        delivery_date: { _gte: $prevFrom, _lt: $prevTo }
      }
    ) {
      aggregate { count }
    }
  }
`;

/**
 * Pedidos entregados del período, proyectados al mínimo necesario para
 * construir series temporales, estacionalidad semanal y ranking de clientes.
 */
export const GET_DELIVERED_ORDERS_SLIM = `
  query GetDeliveredOrdersSlim(
    $from: timestamptz!
    $to: timestamptz!
    $limit: Int!
  ) {
    orders(
      where: {
        status: { _eq: "delivered" }
        delivery_date: { _gte: $from, _lt: $to }
      }
      order_by: { delivery_date: asc }
      limit: $limit
    ) {
      id
      total
      delivery_date
      customer_id
      customer { name }
    }
  }
`;

/**
 * Líneas de pedido entregadas del período, proyectadas al mínimo necesario
 * para el ranking de productos, el análisis ABC y el pronóstico de demanda.
 */
export const GET_DELIVERED_ITEMS_SLIM = `
  query GetDeliveredItemsSlim(
    $from: timestamptz!
    $to: timestamptz!
    $limit: Int!
  ) {
    order_items(
      where: {
        order: {
          status: { _eq: "delivered" }
          delivery_date: { _gte: $from, _lt: $to }
        }
      }
      order_by: { created_at: asc }
      limit: $limit
    ) {
      product_id
      quantity
      subtotal
      order {
        id
        delivery_date
      }
    }
  }
`;

/**
 * Catálogo de productos. Es una tabla pequeña y estable (decenas de filas),
 * por lo que se resuelve como un mapa id -> nombre en memoria en vez de
 * anidar la relación en cada línea de pedido.
 */
export const GET_PRODUCT_CATALOG = `
  query GetProductCatalog {
    products(order_by: { name: asc }) {
      id
      name
      unit_price
      active
    }
  }
`;

/**
 * Última compra por cliente, sin acotar al período, para poder calcular
 * recencia y riesgo de fuga incluso si el cliente no compró en la ventana.
 */
export const GET_CUSTOMER_RECENCY = `
  query GetCustomerRecency {
    customers(where: { active: { _eq: true } }, order_by: { name: asc }) {
      id
      name
      label
      orders_aggregate(where: { status: { _eq: "delivered" } }) {
        aggregate {
          count
          sum { total }
        }
      }
      orders(
        where: { status: { _eq: "delivered" } }
        order_by: { delivery_date: desc }
        limit: 1
      ) {
        delivery_date
      }
    }
  }
`;
