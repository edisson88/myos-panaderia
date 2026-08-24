// ─────────────────────────────────────────────────────────────────────────────
// inventory.queries.ts
// Todas las operaciones GraphQL del módulo inventory en un solo lugar.
// ─────────────────────────────────────────────────────────────────────────────

export const GET_INVENTORY_QUANTITIES = `
  query GetInventoryQuantities($productIds: [uuid!]!) {
    product_inventory(where: { product_id: { _in: $productIds } }) {
      product_id
      available_quantity
    }
  }
`;

/**
 * Upsert atómico de inventario + movimiento en una sola transacción.
 * `available_quantity` es la ÚNICA columna que se pisa en conflicto: si ya
 * existe fila para el producto, las demás columnas (reserved_quantity,
 * damaged_quantity, minimum_stock, active) no se tocan. El insert anidado de
 * `finished_product_inventory_movements` corre siempre, sea inserción nueva
 * o actualización por conflicto.
 */
export const CONFIRM_PRODUCTION_INVENTORY = `
  mutation ConfirmProductionInventory(
    $objects: [product_inventory_insert_input!]!
  ) {
    insert_product_inventory(
      objects: $objects
      on_conflict: {
        constraint: product_inventory_product_id_key
        update_columns: [available_quantity]
      }
    ) {
      returning {
        id
        product_id
        available_quantity
      }
    }
  }
`;
