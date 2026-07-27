import { getAuthHeaders } from "./auth";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  me: () => request<{ email: string; display_name: string; role: string }>("/me"),

  clients: () =>
    request<Array<{ id: number; name: string; tenant_id: string; status: string; created_at: string }>>("/clients"),

  client: (id: string | number) =>
    request<{
      id: number;
      name: string;
      tenant_id: string;
      status: string;
      created_at: string;
      microsoft_users: Array<{ id: number; email: string; display_name: string; synced_at: string }>;
    }>(`/clients/${id}`),

  graphUsers: (tenantId: string) =>
    request<{ value: Array<{ email: string; display_name: string }>; tenant_id: string }>(
      `/graph/users?tenant_id=${encodeURIComponent(tenantId)}`
    ),

  startOnboarding: (clientId: number) =>
    request<{ success: boolean; client_id: number; status: string }>("/onboarding/start", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    }),

  syncMicrosoft: (clientId: number) =>
    request<{ success: boolean; synced: number }>("/sync/microsoft", {
      method: "POST",
      body: JSON.stringify({ client_id: clientId }),
    }),

  audit: (limit = 50) =>
    request<
      Array<{
        id: number;
        actor_email: string;
        action: string;
        target_type: string | null;
        target_id: string | null;
        metadata: string | null;
        created_at: string;
      }>
    >(`/audit?limit=${limit}`),
};
