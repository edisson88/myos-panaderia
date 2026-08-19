/**
 * Pedidos del día operativo para el dashboard.
 *
 * Se filtra por `delivery_date` (qué se despacha hoy), no por `created_at`
 * (qué se registró hoy): un pedido tomado ayer para entregar hoy debe aparecer
 * en la operación de hoy. Los límites vienen en UTC porque `delivery_date` se
 * persiste a medianoche UTC.
 *
 * El orden sigue siendo por `created_at` descendente — dentro de la jornada,
 * lo último registrado va primero.
 */
export const GET_RECENT_ORDERS_QUERY = `
    query GetRecentOrders($deliveryFrom: timestamptz!, $deliveryTo: timestamptz!) {
        orders(
            where: {
                delivery_date: { _gte: $deliveryFrom, _lt: $deliveryTo }
            }
            order_by: { created_at: desc }
        ) {
            id
            order_code
            status
            total
            created_at
            delivery_date
            notes
            customer {
                name
                phone
                address
            }
            order_items {
                id
                quantity
                unit_price
                subtotal
                products {
                    name
                }
            }
        }
    }
`;
