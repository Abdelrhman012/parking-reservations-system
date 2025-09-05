const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL;

export type Gate = { id: string; name: string };
export type Zone = {
  id: string;
  name: string;
  category: "normal" | "special";
  open: boolean;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal?: number;
  rateSpecial?: number;
};
export type Ticket = {
  id: string;
  code: string;
  type: "visitor" | "subscriber";
  zoneId: string;
  gateId: string;
  createdAt: string;
};
export type CheckoutResult = {
  ticketId: string;
  durationHours: number;
  amount: number;
  breakdown: Array<{
    mode: "normal" | "special";
    hours: number;
    rate: number;
    total: number;
  }>;
  zoneState?: Zone; // updated zone snapshot (optional)
};

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

// ---------- raw calls ----------
export const Auth = {
  login: (body: { username: string; password: string }) =>
    api<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: (token: string) =>
    api<{ id: string; username: string; role: string }>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const Master = {
  gates: () => api<Gate[]>("/master/gates"),
  zonesByGate: (gateId: string) =>
    api<Zone[]>(`/master/zones?gateId=${encodeURIComponent(gateId)}`),
};

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

export const Admin = {
  parkingState: (token: string) =>
    api<Zone[]>("/admin/reports/parking-state", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  toggleZoneOpen: (token: string, zoneId: string, open: boolean) =>
    api<Zone>(`/admin/zones/${zoneId}/${open ? "open" : "close"}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
