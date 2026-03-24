// Consultas de GraphQL para el módulo de Clientes
// Nota: Estas se importan en el frontend desde el core-service-api

export const GET_CLIENTS = `
  query GetClients {
    clients(order_by: { name: asc }) {
      id
      name
      dni
      address
      phone
      email
      active
      created_at
      updated_at
    }
  }
`;

export const GET_CLIENT_BY_ID = `
  query GetClientById($id: uuid!) {
    clients_by_pk(id: $id) {
      id
      name
      dni
      address
      phone
      email
      active
      created_at
      updated_at
    }
  }
`;

export const INSERT_CLIENT = `
  mutation InsertClient($object: clients_insert_input!) {
    insert_clients_one(object: $object) {
      id
      name
    }
  }
`;

export const UPDATE_CLIENT = `
  mutation UpdateClient($id: uuid!, $changes: clients_set_input!) {
    update_clients_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
      name
    }
  }
`;

export const DELETE_CLIENT = `
  mutation DeleteClient($id: uuid!) {
    delete_clients_by_pk(id: $id) {
      id
    }
  }
`;
