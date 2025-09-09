import { create } from "zustand";

export type AdminEvent = {
  id?: string;
  action: string; // ex: "zone-open", "rate-update"
  by?: string; 
  at?: string; 
  details?: Record<string, unknown>;
};

type AdminState = {
  events: AdminEvent[];
  pushEvent: (e: AdminEvent) => void;
  clear: () => void;
};

export const useAdmin = create<AdminState>((set) => ({
  events: [],
  pushEvent: (e) =>
    set((s) => ({
      events: [
        { ...e, id: e.id ?? crypto.randomUUID() },
        ...s.events,
      ].slice(0, 50),
    })),
  clear: () => set({ events: [] }),
}));
