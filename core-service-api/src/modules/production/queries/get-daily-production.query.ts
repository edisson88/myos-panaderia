export const GET_DAILY_PRODUCTION_QUERY = `
  query GetDailyProduction($today: timestamptz!, $tomorrow: timestamptz!) {
    order_items(
      where: {
        order: {
          created_at: { _gte: $today, _lt: $tomorrow }
        }
      }
    ) {
      quantity
      product_id
      products {
        name
        units_per_sale_unit
        product_production_config {
          units_per_tray
          sale_unit_name
        }
      }
    }
  }
`;