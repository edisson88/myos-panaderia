export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  statusCode?: number;
  timestamp?: string;
  path?: string;
  message?: string | string[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function getErrorMessage(payload: ApiErrorResponse | null): string {
  if (!payload?.message) {
    return "No se pudo completar la solicitud";
  }

  return Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL no esta configurada");
  }

  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let parsed: ApiSuccessResponse<T> | ApiErrorResponse | null = null;

  if (text) {
    try {
      parsed = JSON.parse(text) as ApiSuccessResponse<T> | ApiErrorResponse;
    } catch {
      throw new Error("Respuesta invalida del servidor");
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(parsed as ApiErrorResponse | null));
  }

  if (!parsed || !("success" in parsed) || parsed.success !== true || !("data" in parsed)) {
    throw new Error("Respuesta invalida del servidor");
  }

  return parsed.data;
}
