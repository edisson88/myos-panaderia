import { apiRequest } from "../../services/api";
import type { Product, CreateProductInput, UpdateProductInput } from "./products.schema";

export async function getProducts(token: string): Promise<Product[]> {
  return apiRequest<Product[]>("/products", { method: "GET" }, token);
}

export async function getProductById(id: string, token: string): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, { method: "GET" }, token);
}

export async function createProduct(payload: CreateProductInput, token: string): Promise<Product> {
  return apiRequest<Product>(
    "/products",
    { method: "POST", body: JSON.stringify(payload) },
    token,
  );
}

export async function updateProduct(
  id: string,
  payload: UpdateProductInput,
  token: string,
): Promise<Product> {
  return apiRequest<Product>(
    `/products/${id}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    token,
  );
}

export async function deleteProduct(id: string, token: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(`/products/${id}`, { method: "DELETE" }, token);
}
