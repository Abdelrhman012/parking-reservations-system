import type { Zone } from "./domain";

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
  zoneState?: Zone;
};

export type LoginResponse = { token: string };
