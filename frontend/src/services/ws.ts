import { useApp } from "@/store/app";
import type { ServerMessage, Handlers } from "@/types/ws";

let socket: WebSocket | null = null;
let subscribedGateId: string | null = null;
let reconnectAttempts = 0;
let heartbeatTimer: number | null = null;

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

export function connectWS(handlers: Handlers = {}, token?: string) {
  if (typeof window === "undefined") return null;
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  const base = process.env.NEXT_PUBLIC_WS_URL;
  if (!base) {
    const msg = "Missing WS URL";
    console.error(msg);
    try {
      useApp.getState().setWs(false);
    } catch {
      // ignore
    }
    handlers.error?.(new Event("ws-url-missing"));
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-alert
      alert(msg);
    }
    return null;
  }

  const url = token
    ? `${base}${base.includes("?") ? "&" : "?"}token=${encodeURIComponent(
        token
      )}`
    : base;

  const sock = new WebSocket(url);
  socket = sock;
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
    const delay = backoff(500, reconnectAttempts++);
    window.setTimeout(() => connectWS(handlers, token), delay);
  });

  sock.addEventListener("error", (e) => {
    setWs(false);
    handlers.error?.(e);
    try {
      socket?.close();
    } catch {
      // ignore
    }
  });

  sock.addEventListener("message", (ev: MessageEvent) => {
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
  try {
    socket?.close();
  } finally {
    socket = null;
  }
}
