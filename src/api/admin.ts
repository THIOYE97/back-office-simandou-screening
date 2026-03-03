// src/api/admin.ts
import { api } from "../api"; // si tu as déjà un api.ts axios global, réutilise-le

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  active_from?: string | null;
  active_until?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function adminListTenants(): Promise<TenantRow[]> {
  const { data } = await api.get("/admin/tenants");
  return data;
}

export async function adminCreateTenant(payload: { name: string; slug: string }) {
  const { data } = await api.post("/admin/tenants", payload);
  return data as { id: string; name: string; slug: string };
}

export async function adminCreateInvitation(tenantId: string, payload: { email: string; role?: string; ttl_days?: number }) {
  const { data } = await api.post(`/admin/tenants/${tenantId}/invitations`, payload);
  return data as { ok: boolean; invite_email: string; role: string; expires_at: string; token: string };
}

