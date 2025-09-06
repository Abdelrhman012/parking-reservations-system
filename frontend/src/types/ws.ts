import type { Zone } from "./domain";

export type ZoneUpdatePayload = Zone & { gateId: string };

export type AdminUpdatePayload = {
  action: string;
  zoneId?: string;
  gateId?: string;
  at: string;
  actor?: { id?: string; username?: string; role?: string };
  meta?: Record<string, unknown>;
};

export type ServerMessage =
  | { type: "zone-update"; payload: ZoneUpdatePayload }
  | { type: "admin-update"; payload: AdminUpdatePayload }
  | { type: "subscribed"; payload: { gateId: string } }
  | { type: "pong" };

export type Handlers = {
  zoneUpdate?: (p: ZoneUpdatePayload) => void;
  adminUpdate?: (p: AdminUpdatePayload) => void;
  open?: () => void;
  close?: () => void;
  error?: (e: Event) => void;
};
