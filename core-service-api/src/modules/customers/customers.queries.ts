// ─────────────────────────────────────────────────────────────────────────────
// customers.queries.ts
// Todas las operaciones GraphQL del módulo customers en un solo lugar.
// ─────────────────────────────────────────────────────────────────────────────

// ── Queries ───────────────────────────────────────────────────────────────────

export const GET_ALL_CUSTOMERS = `
  query GetAllCustomers {
    customers(order_by: { created_at: desc }) {
      id
      name
      email
      phone
      address
      dni
      active
      user_id
      label
      created_at
      updated_at
    }
  }
`;

export const GET_CUSTOMER_BY_ID = `
  query GetCustomerById($id: uuid!) {
    customers_by_pk(id: $id) {
      id
      name
      email
      phone
      address
      dni
      active
      user_id
      label
      created_at
      updated_at
    }
  }
`;

export const GET_CUSTOMER_BY_USER_ID = `
  query GetCustomerByUserId($userId: uuid!) {
    customers(where: { user_id: { _eq: $userId } }) {
      id
      name
      email
      phone
      address
      dni
      active
      user_id
      label
    }
  }
`;

// ── Mutations ─────────────────────────────────────────────────────────────────

export const INSERT_CUSTOMER = `
  mutation InsertCustomer(
    $name: String!
    $email: String!
    $phone: String!
    $address: String!
    $dni: String
    $active: Boolean
    $user_id: uuid
    $label: String
  ) {
    insert_customers_one(object: {
      name: $name
      email: $email
      phone: $phone
      address: $address
      dni: $dni
      active: $active
      user_id: $user_id
      label: $label
    }) {
      id
      name
      email
      phone
      address
      dni
      active
      user_id
      label
      created_at
      updated_at
    }
  }
`;

export const UPDATE_CUSTOMER = `
  mutation UpdateCustomer(
    $id: uuid!
    $name: String
    $email: String
    $phone: String
    $address: String
    $dni: String
    $active: Boolean
    $user_id: uuid
    $label: String
  ) {
    update_customers_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        email: $email
        phone: $phone
        address: $address
        dni: $dni
        active: $active
        user_id: $user_id
        label: $label
      }
    ) {
      id
      name
      email
      phone
      address
      dni
      active
      user_id
      label
      created_at
      updated_at
    }
  }
`;

export const DELETE_CUSTOMER = `
  mutation DeleteCustomer($id: uuid!) {
    delete_customers_by_pk(id: $id) {
      id
    }
  }
`;
