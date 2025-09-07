import { create } from "zustand";
import type { User, TicketCheckinResponse } from "@/types/api";

type AppState = {
  token?: string;
  user?: User;
  wsConnected: boolean;
  setWs: (v: boolean) => void;

  ticketModal?: TicketCheckinResponse | null;
  setTicketModal: (v: TicketCheckinResponse | null) => void;

  activeGateTab: "visitor" | "subscriber";
  setActiveGateTab: (t: "visitor" | "subscriber") => void;

  setAuth: (payload: { token?: string; user?: User } | null) => void;
  logout: () => void;
};

export const useApp = create<AppState>((set) => ({
  token: undefined,
  user: undefined,
  wsConnected: false,
  setWs: (v) => set({ wsConnected: v }),

  ticketModal: null,
  setTicketModal: (v) => set({ ticketModal: v }),

  activeGateTab: "visitor",
  setActiveGateTab: (t) => set({ activeGateTab: t }),

  setAuth: (p) => set({ token: p?.token, user: p?.user }),
  logout: () => set({ token: undefined, user: undefined }),
}));
