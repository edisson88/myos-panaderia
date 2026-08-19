// get-production-config.query.ts
export const GET_PRODUCTION_CONFIG_QUERY = `
  query GetProductionConfig {
    products(
      where: { active: { _eq: true } }
      order_by: { name: asc }
    ) {
      id
      name
      product_production_config {
        id
        sale_unit_name
        units_per_tray
        notes
      }
    }
  }
`;