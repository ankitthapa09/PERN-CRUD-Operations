import { request } from "@/lib/http-client";
import type { AuthResponse } from "@/features/auth/types";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:4000/api/auth";

export const authApi = {
  me(): Promise<AuthResponse> {
    return request<AuthResponse>(`${AUTH_API_URL}/me`);
  },

  register(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>(`${AUTH_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  logout(): Promise<void> {
    return request<void>(`${AUTH_API_URL}/logout`, { method: "POST" });
  },
};
