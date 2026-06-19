export const GET_RECENT_ORDERS_QUERY = `
    query GetRecentOrders($today: timestamptz!, $tomorrow: timestamptz!) {
        orders(
            where: {
                created_at: { _gte: $today, _lt: $tomorrow }
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