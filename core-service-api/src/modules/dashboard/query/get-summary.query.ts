/**
 * Resumen del día para el dashboard.
 *
 * Dos rangos distintos a propósito:
 *
 *   - $deliveryFrom / $deliveryTo  → filtran `delivery_date`, que es el DÍA
 *     OPERATIVO (cuándo salió el pan). Se persiste como timestamptz a
 *     medianoche UTC, así que sus límites deben calcularse en UTC.
 *
 *   - $createdFrom / $createdTo    → filtran `created_at`, que es un instante
 *     real. `product_returns` no tiene `delivery_date`: una devolución se
 *     cuenta el día en que se registra, con límites en hora local.
 *
 * `delivery_date` es la columna de referencia del sistema: es la misma que usa
 * el módulo de analítica, de modo que ambas pantallas coinciden. Antes esta
 * consulta mezclaba `created_at` y `updated_at`, lo que además hacía inestable
 * el top de clientes (cualquier edición del pedido lo movía de día).
 */
export const GET_SUMMARY_QUERY = `
    query GetDashboardSummary(
        $deliveryFrom: timestamptz!
        $deliveryTo: timestamptz!
        $createdFrom: timestamptz!
        $createdTo: timestamptz!
    ) {

        completed_orders: orders_aggregate(
            where: {
                status: { _eq: "delivered" },
                delivery_date: { _gte: $deliveryFrom, _lt: $deliveryTo }
            }
        ) {
            aggregate {
                count
                sum { total }
            }
        }

        returns_today: product_returns_aggregate(
            where: {
                created_at: { _gte: $createdFrom, _lt: $createdTo }
            }
        ) {
            aggregate {
              sum { quantity }
            }
            nodes {
                quantity
                product { unit_price }
            }
        }

        top_customers: orders(
            where: {
                status: { _eq: "delivered" },
                delivery_date: { _gte: $deliveryFrom, _lt: $deliveryTo }
            }
            order_by: { total: desc }
            limit: 3
        )   {
            total
            customer { name}
        }

        top_products: order_items_aggregate(
            where: {
                order: {
                    status: { _eq: "delivered" },
                    delivery_date: { _gte: $deliveryFrom, _lt: $deliveryTo }
                }
            }
        ) {
            nodes {
                subtotal
                products { name }
            }
        }
    }
`;
