import type { Gate, Zone, Ticket } from "@/types/domain";
import type { CheckoutResult, LoginResponse } from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`
    );
  }
  return res.json() as Promise<T>;
}

// Auth
export const Auth = {
  login: (b: { username: string; password: string }) =>
    api<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(b),
    }),
};

// Master
export const Master = {
  gates: () => api<Gate[]>("/master/gates"),
  zonesByGate: (gateId: string) =>
    api<Zone[]>(`/master/zones?gateId=${encodeURIComponent(gateId)}`),
};

// Tickets
export const Tickets = {
  checkinVisitor: (p: {
    gateId: string;
    zoneId: string;
    plate?: string;
  }) =>
    api<Ticket>("/tickets/checkin", {
      method: "POST",
      body: JSON.stringify({ ...p, type: "visitor" }),
    }),
  checkinSubscriber: (p: {
    gateId: string;
    zoneId: string;
    subscriptionId: string;
  }) =>
    api<Ticket>("/tickets/checkin", {
      method: "POST",
      body: JSON.stringify({ ...p, type: "subscriber" }),
    }),
  checkout: (p: { ticketCode: string; forceConvertToVisitor?: boolean }) =>
    api<CheckoutResult>("/tickets/checkout", {
      method: "POST",
      body: JSON.stringify(p),
    }),
};

// Admin
export const Admin = {
  parkingState: (token: string) =>
    api<Zone[]>("/admin/reports/parking-state", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  toggleZoneOpen: (token: string, zoneId: string, open: boolean) =>
    api<Zone>(`/admin/zones/${zoneId}/open`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ open }),
    }),
  updateCategory: (
    token: string,
    id: string,
    body: Record<string, unknown>
  ) =>
    api(`/admin/categories/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
};
