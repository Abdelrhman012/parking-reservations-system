// ---------- Auth & Users ----------
export type User = {
  id: string;
  username: string;
  name: string;
  role: "admin" | "employee";
};

export type LoginResponse = {
  user: User;
  token: string;
};

// ---------- Master data ----------
export type Category = {
  id: string;
  name: string;
  description?: string;
  rateNormal: number;
  rateSpecial: number;
};

export type Gate = {
  id: string;
  name: string;
  zoneIds: string[];
  location?: string;
};

export type Zone = {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
};

// Parking-state adds an extra aggregate count for admin report
export type AdminParkingStateZone = Zone & {
  subscriberCount?: number;
};
// ---------- Global rules ----------
export type RushHour = {
  id: string;
  weekDay: number; // 0-6 (implementation-defined; keep consistent)
  from: string; // "HH:mm"
  to: string; // "HH:mm"
};

export type Vacation = {
  id: string;
  name: string;
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
};

// ---------- Subscriptions ----------
export type SubscriptionCar = {
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
};

export type Subscription = {
  id: string;
  userName: string;
  active: boolean;
  category: string; // categoryId
  cars: SubscriptionCar[];
  startsAt: string;
  expiresAt: string;
  currentCheckins: Array<{
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }>;
};

// ---------- Tickets / Reservations ----------
export type Ticket = {
  id: string;
  type: "visitor" | "subscriber";
  zoneId: string;
  gateId: string;
  checkinAt: string;
  checkoutAt: string | null; 
};

export type TicketCheckinResponse = {
  ticket: Pick<Ticket, "id" | "type" | "zoneId" | "gateId" | "checkinAt">;
  zoneState: Zone;
};

export type TicketCheckoutBreakdownItem = {
  from: string;
  to: string;
  hours: number;
  rateMode: "normal" | "special";
  rate: number;
  amount: number;
};

export type TicketCheckoutResponse = {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: TicketCheckoutBreakdownItem[];
  amount: number;
  zoneState: Zone;
};
