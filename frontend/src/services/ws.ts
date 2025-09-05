import { useApp } from "@/store/app";

type Handlers = {
  zoneUpdate?: (payload: any) => void;
  adminUpdate?: (payload: any) => void;
  open?: () => void;
  close?: () => void;
  error?: (e: Event) => void;
};

let socket: WebSocket | null = null;
let subscribedGateId: string | null = null;

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/api/v1/ws";

export function connectWS(handlers: Handlers = {}) {
  if (typeof window === "undefined") return null;
  if (socket && socket.readyState === WebSocket.OPEN) return socket;

  socket = new WebSocket(WS_URL);
  const setWs = useApp.getState().setWs;

  socket.addEventListener("open", () => {
    setWs(true);
    handlers.open?.();
    // لو فيه اشتراك قديم
    if (subscribedGateId) {
      subscribeGate(subscribedGateId);
    }
  });

  socket.addEventListener("close", () => {
    setWs(false);
    handlers.close?.();
  });

  socket.addEventListener("error", (e) => {
    setWs(false);
    handlers.error?.(e);
  });

  socket.addEventListener("message", (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg?.type === "zone-update") handlers.zoneUpdate?.(msg.payload);
      if (msg?.type === "admin-update")
        handlers.adminUpdate?.(msg.payload);
    } catch {
      // ignore parse errors
    }
  });

  return socket;
}

export function subscribeGate(gateId: string) {
  subscribedGateId = gateId;
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type: "subscribe", payload: { gateId } }));
}

export function disconnectWS() {
  subscribedGateId = null;
  if (socket) {
    socket.close();
    socket = null;
  }
}
