// Consultas de GraphQL para el módulo de Productos

export const GET_PRODUCTS = `
  query GetProducts {
    products(order_by: { name: asc }) {
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

export const INSERT_PRODUCT = `
  mutation InsertProduct($object: products_insert_input!) {
    insert_products_one(object: $object) {
      id
      name
    }
  }
`;

export const UPDATE_PRODUCT = `
  mutation UpdateProduct($id: uuid!, $changes: products_set_input!) {
    update_products_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      name
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
