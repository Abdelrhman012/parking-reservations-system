import { Zone } from "./api";

// src/types/ws.ts
export type WSSubscribe = {
  type: "subscribe";
  payload: { gateId: string };
};

export type WSUnsubscribe = {
  type: "unsubscribe";
  payload: { gateId: string };
};

export type WSZoneUpdate = {
  type: "zone-update";
  payload: Zone;
};

export type WSAdminUpdate = {
  type: "admin-update";
  payload?: Record<string, unknown>;
};

export type ClientMessage = WSSubscribe | WSUnsubscribe;

export type ZoneUpdatePayload = WSZoneUpdate["payload"];
export type AdminUpdatePayload = WSAdminUpdate["payload"];

export type ServerMessage =
  | (WSZoneUpdate | WSAdminUpdate)
  | { type: "subscribed"; payload: { gateId: string } }
  | { type: "pong" };

export type Handlers = {
  zoneUpdate?: (p: ZoneUpdatePayload) => void;
  adminUpdate?: (p: AdminUpdatePayload) => void;
  open?: () => void;
  close?: () => void;
  error?: (e: Event) => void;
};
