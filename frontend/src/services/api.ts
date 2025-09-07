import type {
  User,
  LoginResponse,
  Category,
  Gate,
  Zone,
  RushHour,
  Vacation,
  Subscription,
  Ticket,
  TicketCheckinResponse,
  TicketCheckoutResponse,
} from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// ---------- Fetch wrapper ----------
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

// ==================================
// Auth & Users (employees/admins)
// ==================================
export const Auth = {
  login: (b: { username: string; password: string }) =>
    api<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(b),
    }),
};

export const AdminUsers = {
  list: (token: string) =>
    api<User[]>("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  create: (
    token: string,
    body: {
      username: string;
      name: string;
      role: "admin" | "employee";
      password: string;
    }
  ) =>
    api<User>("/admin/users", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
};

// ==================================
// Master data (public read, admin control)
// - Categories, Zones, Gates
// ==================================
export const Master = {
  categories: () => api<Category[]>("/master/categories"),
  zonesByGate: (gateId: string) =>
    api<Zone[]>(`/master/zones?gateId=${encodeURIComponent(gateId)}`),
  gates: () => api<Gate[]>("/master/gates"),
};

export const AdminCategories = {
  list: (token: string) =>
    api<Category[]>("/admin/categories", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  create: (
    token: string,
    body: {
      id: string;
      name: string;
      description?: string;
      rateNormal: number;
      rateSpecial: number;
    }
  ) =>
    api<Category>("/admin/categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  update: (
    token: string,
    id: string,
    body: Partial<
      Pick<Category, "name" | "description" | "rateNormal" | "rateSpecial">
    >
  ) =>
    api<Category>(`/admin/categories/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  remove: (token: string, id: string) =>
    api<{ ok: true }>(`/admin/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const AdminZones = {
  list: (token: string) =>
    api<Zone[]>("/admin/zones", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  create: (
    token: string,
    body: {
      id: string;
      name: string;
      categoryId: string;
      gateIds: string[];
      totalSlots: number;
      rateNormal?: number;
      rateSpecial?: number;
      open?: boolean;
    }
  ) =>
    api<Zone>("/admin/zones", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  update: (
    token: string,
    id: string,
    body: Partial<Record<string, unknown>>
  ) =>
    api<Zone>(`/admin/zones/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  remove: (token: string, id: string) =>
    api<{ ok: true }>(`/admin/zones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  toggleOpen: (token: string, id: string, open: boolean) =>
    api<Zone>(`/admin/zones/${id}/open`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ open }),
    }),
};

export const AdminGates = {
  list: (token: string) =>
    api<Gate[]>("/admin/gates", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  create: (
    token: string,
    body: {
      id: string;
      name: string;
      location?: string;
      zoneIds?: string[];
    }
  ) =>
    api<Gate>("/admin/gates", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  update: (
    token: string,
    id: string,
    body: Partial<Record<string, unknown>>
  ) =>
    api<Gate>(`/admin/gates/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  remove: (token: string, id: string) =>
    api<{ ok: true }>(`/admin/gates/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ==================================
// Subscriptions
// ==================================
export const Subscriptions = {
  get: (id: string) =>
    api<Subscription>(`/subscriptions/${encodeURIComponent(id)}`),
};

export const AdminSubscriptions = {
  create: (
    token: string,
    body: Omit<Subscription, "currentCheckins"> & {
      currentCheckins?: Subscription["currentCheckins"];
    }
  ) =>
    api<Subscription>("/admin/subscriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  update: (token: string, id: string, body: Partial<Subscription>) =>
    api<Subscription>(`/admin/subscriptions/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
};

// ==================================
// Tickets / Reservations
// ==================================
export const Tickets = {
  checkinVisitor: (p: { gateId: string; zoneId: string }) =>
    api<TicketCheckinResponse>("/tickets/checkin", {
      method: "POST",
      body: JSON.stringify({ ...p, type: "visitor" }),
    }),
  checkinSubscriber: (p: {
    gateId: string;
    zoneId: string;
    subscriptionId: string;
  }) =>
    api<TicketCheckinResponse>("/tickets/checkin", {
      method: "POST",
      body: JSON.stringify({ ...p, type: "subscriber" }),
    }),
  checkout: (p: { ticketId: string; forceConvertToVisitor?: boolean }) =>
    api<TicketCheckoutResponse>("/tickets/checkout", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  get: (id: string) => api<Ticket>(`/tickets/${encodeURIComponent(id)}`),
};

export const AdminTickets = {
  list: (
    token: string,
    opts?: { status?: "checkedin" | "checkedout" }
  ) => {
    const qs = new URLSearchParams();
    if (opts?.status) qs.set("status", opts.status);
    return api<Ticket[]>(
      `/admin/tickets${qs.toString() ? `?${qs}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};

// ==================================
// Rush hours & Vacations (admin)
// ==================================
export const AdminRushHours = {
  list: (token: string) =>
    api<RushHour[]>("/admin/rush-hours", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  create: (
    token: string,
    body: { weekDay: number; from: string; to: string }
  ) =>
    api<RushHour>("/admin/rush-hours", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  update: (
    token: string,
    id: string,
    body: Partial<Pick<RushHour, "weekDay" | "from" | "to">>
  ) =>
    api<RushHour>(`/admin/rush-hours/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  remove: (token: string, id: string) =>
    api<{ ok: true }>(`/admin/rush-hours/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const AdminVacations = {
  list: (token: string) =>
    api<Vacation[]>("/admin/vacations", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  create: (
    token: string,
    body: { name: string; from: string; to: string }
  ) =>
    api<Vacation>("/admin/vacations", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  update: (
    token: string,
    id: string,
    body: Partial<Pick<Vacation, "name" | "from" | "to">>
  ) =>
    api<Vacation>(`/admin/vacations/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
  remove: (token: string, id: string) =>
    api<{ ok: true }>(`/admin/vacations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ==================================
// Admin reports
// ==================================
export const AdminReports = {
  parkingState: (token: string) =>
    api<Zone[]>("/admin/reports/parking-state", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
