// ─────────────────────────────────────────────────────────────────────────────
// orders.queries.ts
// Todas las operaciones GraphQL del módulo orders en un solo lugar.
// ─────────────────────────────────────────────────────────────────────────────

// ── Queries ───────────────────────────────────────────────────────────────────

export const GET_ALL_ORDERS = `
  query GetAllOrders($where: orders_bool_exp) {
    orders(where: $where, order_by: { created_at: desc }) {
      id
      order_code
      status
      total
      delivery_date
      created_at
      updated_at
      customer_id
      customer {
        name
      }
    }
  }
`;

export const GET_ORDER_BY_ID = `
  query GetOrderById($id: uuid!) {
    orders_by_pk(id: $id) {
      id
      order_code
      status
      total
      delivery_date
      notes
      created_at
      updated_at
      customer_id
      customer {
        id
        name
      }
      order_items {
        id
        product_id
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

// ── Mutations ─────────────────────────────────────────────────────────────────

export const INSERT_ORDER_WITH_ITEMS = `
  mutation InsertOrderWithItems($object: orders_insert_input!) {
    insert_orders_one(object: $object) {
      id
      order_code
      status
      total
      notes
      delivery_date
      created_at
      updated_at
      customer_id
      order_items {
        id
        product_id
        quantity
        unit_price
        subtotal
      }
    }
  }
`;

export const UPDATE_ORDER = `
  mutation UpdateOrder($id: uuid!, $set: orders_set_input!) {
    update_orders_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      order_code
      status
      total
      notes
      delivery_date
      updated_at
    }
  }
`;

export const UPDATE_ORDER_STATUS = `
  mutation UpdateOrderStatus($id: uuid!, $status: String!) {
    update_orders_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      order_code
      status
      updated_at
    }
  }
`;

/**
 * Reemplaza todos los items de una orden y actualiza el total.
 * Se ejecuta como una sola transacción en Hasura.
 */
export const REPLACE_ORDER_ITEMS = `
  mutation ReplaceOrderItems(
    $orderId: uuid!
    $items: [order_items_insert_input!]!
    $total: numeric!
  ) {
    delete_order_items(where: { order_id: { _eq: $orderId } }) {
      affected_rows
    }
    insert_order_items(objects: $items) {
      returning {
        id
        product_id
        quantity
        unit_price
        subtotal
      }
    }
    update_orders_by_pk(
      pk_columns: { id: $orderId }
      _set: { total: $total }
    ) {
      id
      total
      updated_at
    }
  }
`;

/**
 * Elimina primero los items del pedido y luego el pedido.
 * Hasura ejecuta múltiples root mutations en el orden declarado
 * dentro de la misma transacción.
 */
export const DELETE_ORDER_WITH_ITEMS = `
  mutation DeleteOrderWithItems($id: uuid!) {
    delete_order_items(where: { order_id: { _eq: $id } }) {
      affected_rows
    }
    delete_orders_by_pk(id: $id) {
      id
    }
  }
`;
