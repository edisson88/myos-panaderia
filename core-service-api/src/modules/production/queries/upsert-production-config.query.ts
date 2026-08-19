// upsert-production-config.query.ts
export const UPSERT_PRODUCTION_CONFIG_QUERY = `
  mutation UpsertProductionConfig(
    $product_id: uuid!
    $sale_unit_name: String!
    $units_per_tray: numeric!
    $notes: String
  ) {
    insert_product_production_config_one(
      object: {
        product_id: $product_id
        sale_unit_name: $sale_unit_name
        units_per_tray: $units_per_tray
        notes: $notes
      }
      on_conflict: {
        constraint: product_production_config_product_id_key
        update_columns: [sale_unit_name, units_per_tray, notes]
      }
    ) {
      id
      product_id
      sale_unit_name
      units_per_tray
      notes
    }
  }
`;