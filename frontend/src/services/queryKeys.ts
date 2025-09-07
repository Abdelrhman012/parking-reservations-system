export const qk = {
  master: {
    gates: ["gates"] as const,
    zones: (gateId: string) => ["zones", gateId] as const,
    categories: ["categories"] as const,
  },
  tickets: {
    one: (id: string) => ["ticket", id] as const,
  },
  admin: {
    parkingState: ["admin", "parking-state"] as const,
    zones: ["admin", "zones"] as const,
    categories: ["admin", "categories"] as const,
    gates: ["admin", "gates"] as const,
    users: ["admin", "users"] as const,
    subscriptions: ["admin", "subscriptions"] as const,
    tickets: (status?: "checkedin" | "checkedout") =>
      status
        ? (["admin", "tickets", status] as const)
        : (["admin", "tickets"] as const),
    rushHours: ["admin", "rush-hours"] as const,
    vacations: ["admin", "vacations"] as const,
  },
  subscriptions: {
    one: (id: string) => ["subscription", id] as const,
  },
};
