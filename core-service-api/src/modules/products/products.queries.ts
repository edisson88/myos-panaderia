// ─────────────────────────────────────────────────────────────────────────────
// products.queries.ts
// Todas las operaciones GraphQL del módulo products en un solo lugar.
// ─────────────────────────────────────────────────────────────────────────────

// ── Queries ───────────────────────────────────────────────────────────────────

export const GET_ALL_PRODUCTS = `
  query GetAllProducts {
    products(order_by: { created_at: desc }) {
      id
      name
      description
      unit_price
      active
      created_at
      updated_at
    }
  }
`;

export const GET_PRODUCT_BY_ID = `
  query GetProductById($id: uuid!) {
    products_by_pk(id: $id) {
      id
      name
      description
      unit_price
      active
      created_at
      updated_at
    }
  }
`;

// ── Mutations ─────────────────────────────────────────────────────────────────

export const INSERT_PRODUCT = `
  mutation InsertProduct(
    $name: String!
    $description: String
    $unit_price: numeric!
    $active: Boolean
  ) {
    insert_products_one(object: {
      name: $name
      description: $description
      unit_price: $unit_price
      active: $active
    }) {
      id
      name
      description
      unit_price
      active
      created_at
      updated_at
    }
  }
`;

export const UPDATE_PRODUCT = `
  mutation UpdateProduct(
    $id: uuid!
    $name: String
    $description: String
    $unit_price: numeric
    $active: Boolean
  ) {
    update_products_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        description: $description
        unit_price: $unit_price
        active: $active
      }
    ) {
      id
      name
      description
      unit_price
      active
      created_at
      updated_at
    }
  }
`;

export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: uuid!) {
    delete_products_by_pk(id: $id) {
      id
    }
  }
`;
