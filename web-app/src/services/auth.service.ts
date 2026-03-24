import { apiRequest } from "./api";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  access_token: string;
  user: AuthUser;
}

export async function loginRequest(input: LoginInput): Promise<LoginPayload> {
  return apiRequest<LoginPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function meRequest(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", { method: "GET" }, token);
}
