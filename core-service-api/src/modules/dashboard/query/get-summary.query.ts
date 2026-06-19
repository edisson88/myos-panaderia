export const GET_SUMMARY_QUERY = `
    query GetDashboardSummary($today: timestamptz!, $tomorrow: timestamptz!) {
        
        completed_orders: orders_aggregate(
            where: {
                status: { _eq: "delivered" },
                created_at: { _gte: $today, _lt: $tomorrow }
            }
        ) {
            aggregate {
                count
                sum { total }
            }
        }
        
        returns_today: product_returns_aggregate(
            where: {
                created_at: { _gte: $today, _lt: $tomorrow }
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
                updated_at: { _gte: $today, _lt: $tomorrow }
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
                    updated_at: { _gte: $today, _lt: $tomorrow }
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