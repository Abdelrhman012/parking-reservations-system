// src/services/ws.ts
import { useApp } from "@/store/app";
import type { ServerMessage, Handlers } from "@/types/ws";

let socket: WebSocket | null = null;
let subscribedGateId: string | null = null;
let reconnectAttempts = 0;
let heartbeatTimer: number | null = null;
let intentionalClose = false;

function backoff(base = 500, attempt = 0, max = 8000) {
  return Math.min(base * 2 ** attempt, max);
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = window.setInterval(() => {
    try {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    } catch {
      // ignore
    }
  }, 15000);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function isMsg(v: unknown): v is ServerMessage {
  return (
    typeof v === "object" &&
    v !== null &&
    "type" in (v as Record<string, unknown>)
  );
}

function normalizeWsUrl(raw: string): string {
  try {
    const httpsPage =
      typeof window !== "undefined" &&
      window.location.protocol === "https:";
    const hasScheme = /^wss?:\/\//i.test(raw);
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";
    const url = new URL(raw, hasScheme ? undefined : base);
    // Force protocol to match page security to avoid mixed-content
    url.protocol = httpsPage ? "wss:" : "ws:";
    return url.toString();
  } catch {
    return raw;
  }
}

export function connectWS(handlers: Handlers = {}, token?: string) {
  if (typeof window === "undefined") return null;

  // Reuse existing socket if OPEN or CONNECTING
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return socket;
  }

  const raw = process.env.NEXT_PUBLIC_WS_URL;
  if (!raw) {
    const msg = "Missing NEXT_PUBLIC_WS_URL";
    console.error(msg);
    try {
      useApp.getState().setWs(false);
    } catch {}
    handlers.error?.(new Event("ws-url-missing"));
    return null;
  }

  const base = normalizeWsUrl(raw);
  const url = token
    ? `${base}${base.includes("?") ? "&" : "?"}token=${encodeURIComponent(
        token
      )}`
    : base;

  const sock = new WebSocket(url);
  socket = sock;
  intentionalClose = false;

  const setWs = useApp.getState().setWs;

  sock.addEventListener("open", () => {
    setWs(true);
    reconnectAttempts = 0;
    startHeartbeat();
    handlers.open?.();
    if (subscribedGateId) subscribeGate(subscribedGateId);
  });

  sock.addEventListener("close", () => {
    setWs(false);
    stopHeartbeat();
    handlers.close?.();
    if (!intentionalClose) {
      const delay = backoff(500, reconnectAttempts++);
      window.setTimeout(() => connectWS(handlers, token), delay);
    } else {
      intentionalClose = false; // reset flag after an intentional close
    }
  });

  sock.addEventListener("error", (e) => {
    setWs(false);
    handlers.error?.(e as Event);
    try {
      socket?.close();
    } catch {
      // ignore
    }
  });

  sock.addEventListener("message", (ev: MessageEvent<string>) => {
    if (typeof ev.data !== "string") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (!isMsg(parsed)) return;
    if (parsed.type === "zone-update")
      handlers.zoneUpdate?.(parsed.payload);
    if (parsed.type === "admin-update")
      handlers.adminUpdate?.(parsed.payload);
    // "pong" and "subscribed" messages are safe to ignore here
  });

  return sock;
}

export function subscribeGate(gateId: string) {
  subscribedGateId = gateId;
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type: "subscribe", payload: { gateId } }));
}

export function disconnectWS() {
  subscribedGateId = null;
  stopHeartbeat();
  intentionalClose = true;
  try {
    socket?.close();
  } finally {
    socket = null;
  }
}
