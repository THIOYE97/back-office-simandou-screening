// src/api.ts
import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "./auth/auth";

// ------------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------------
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------------------------------------------------
// REQUEST INTERCEPTOR
// ------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  const url = config.url || "";

  // ✅ on n'envoie PAS X-Tenant-Id pour les routes globales tenants
  const skipTenantHeader =
    url.startsWith("/admin/tenants") || url.startsWith("/auth/");

  if (!skipTenantHeader) {
    const activeTenant = localStorage.getItem("active_tenant_id");
    if (activeTenant) {
      config.headers = config.headers ?? {};
      config.headers["X-Tenant-Id"] = activeTenant;
    }
  }

  return config;
});


// ------------------------------------------------------------------
// RESPONSE INTERCEPTOR
// ------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(
        new Error("Network error. Backend unreachable?")
      );
    }

    const { status, data, headers } = error.response;

    // Si 401 → logout automatique
    if (status === 401) {
      clearToken();
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    // Si le backend renvoie du HTML (ex: index.html ou erreur serveur)
    const contentType = headers?.["content-type"] || "";
    if (typeof data === "string" && contentType.includes("text/html")) {
      console.error("Backend returned HTML instead of JSON:", data.slice(0, 200));
      return Promise.reject(
        new Error(
          "Backend returned HTML instead of JSON. Check API baseURL or routing."
        )
      );
    }

    // Sinon renvoie message propre
    if (typeof data === "object" && data !== null) {
      return Promise.reject(
        new Error((data as any).detail || JSON.stringify(data))
      );
    }

    return Promise.reject(
      new Error(`HTTP ${status}: ${JSON.stringify(data)}`)
    );
  }
);

// ------------------------------------------------------------------
// AUTH
// ------------------------------------------------------------------
export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data as { access_token: string; token_type?: string };
}

// ------------------------------------------------------------------
// Helpers génériques (optionnels mais utiles)
// ------------------------------------------------------------------
export async function get<T>(url: string, params?: any): Promise<T> {
  const { data } = await api.get(url, { params });
  return data;
}

export async function post<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.post(url, body);
  return data;
}

export async function put<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.put(url, body);
  return data;
}

export async function del<T>(url: string): Promise<T> {
  const { data } = await api.delete(url);
  return data; where.append("u.tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid")
}

