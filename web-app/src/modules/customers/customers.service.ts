import { apiRequest } from "../../services/api";
import type { Client, CreateClientInput, UpdateClientInput } from "./clientsTypes";

function normalizeInput<T extends CreateClientInput | UpdateClientInput>(input: T): T {
  const normalized = {
    ...input,
    dni: input.dni?.trim() || undefined,
    label: input.label?.trim() || undefined,
    user_id: input.user_id?.trim() || undefined,
  };

  return normalized as T;
}

export async function getCustomers(token: string): Promise<Client[]> {
  return apiRequest<Client[]>("/customers", { method: "GET" }, token);
}

export async function getCustomerById(id: string, token: string): Promise<Client> {
  return apiRequest<Client>(`/customers/${id}`, { method: "GET" }, token);
}

export async function createCustomer(
  payload: CreateClientInput,
  token: string,
): Promise<Client> {
  return apiRequest<Client>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify(normalizeInput(payload)),
    },
    token,
  );
}

export async function updateCustomer(
  id: string,
  payload: UpdateClientInput,
  token: string,
): Promise<Client> {
  return apiRequest<Client>(
    `/customers/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(normalizeInput(payload)),
    },
    token,
  );
}

export async function deleteCustomer(id: string, token: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/customers/${id}`, { method: "DELETE" }, token);
}
