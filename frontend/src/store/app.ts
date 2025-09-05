import { create } from 'zustand';

type TicketForPrint = { id: string; code: string } | null;

type AppState = {
  token?: string;
  gateId?: string;
  wsConnected: boolean;
  ticketForPrint: TicketForPrint;

  setToken: (t?: string) => void;
  setGateId: (g?: string) => void;
  setWs: (ok: boolean) => void;
  setTicket: (t: TicketForPrint) => void;
  logout: () => void;
};

export const useApp = create<AppState>((set) => ({
  token: undefined,
  gateId: undefined,
  wsConnected: false,
  ticketForPrint: null,

  setToken: (t) => set({ token: t }),
  setGateId: (g) => set({ gateId: g }),
  setWs: (ok) => set({ wsConnected: ok }),
  setTicket: (t) => set({ ticketForPrint: t }),
  logout: () => set({ token: undefined, gateId: undefined }),
}));
