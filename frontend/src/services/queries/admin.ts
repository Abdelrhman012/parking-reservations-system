import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AdminReports,
  AdminZones,
  AdminCategories,
  AdminGates,
  AdminUsers,
  AdminTickets,
  AdminRushHours,
  AdminVacations,
} from "../api";
import { qk } from "../queryKeys";
import { Category, Gate, RushHour, Ticket, User, Vacation, Zone } from "@/types/api";

// Reports
export const useParkingState = (token?: string) =>
  useQuery<Zone[]>({
    queryKey: qk.admin.parkingState,
    queryFn: () => AdminReports.parkingState(token!),
    enabled: !!token,
  });

// Zones
export const useAdminZones = (token?: string) =>
  useQuery<Zone[]>({
    queryKey: qk.admin.zones,
    queryFn: () => AdminZones.list(token!),
    enabled: !!token,
  });

export const useCreateZone = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Zone,
    Error,
    {
      id: string;
      name: string;
      categoryId: string;
      gateIds: string[];
      totalSlots: number;
      rateNormal?: number;
      rateSpecial?: number;
      open?: boolean;
    }
  >({
    mutationFn: (body) => AdminZones.create(token!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.zones });
      qc.invalidateQueries({ queryKey: qk.admin.parkingState });
    },
  });
};

export const useUpdateZone = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Zone,
    Error,
    { id: string; patch: Partial<Record<string, unknown>> }
  >({
    mutationFn: ({ id, patch }) => AdminZones.update(token!, id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.zones });
      qc.invalidateQueries({ queryKey: qk.admin.parkingState });
    },
  });
};

export const useDeleteZone = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, Error, { id: string }>({
    mutationFn: ({ id }) => AdminZones.remove(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.zones });
      qc.invalidateQueries({ queryKey: qk.admin.parkingState });
    },
  });
};

export const useToggleZoneOpen = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<Zone, Error, { id: string; open: boolean }>({
    mutationFn: ({ id, open }) => AdminZones.toggleOpen(token!, id, open),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.parkingState });
      qc.invalidateQueries({ queryKey: qk.admin.zones });
    },
  });
};

// Categories (admin)
export const useAdminCategories = (token?: string) =>
  useQuery<Category[]>({
    queryKey: qk.admin.categories,
    queryFn: () => AdminCategories.list(token!),
    enabled: !!token,
  });

export const useCreateCategory = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Category,
    Error,
    {
      id: string;
      name: string;
      description?: string;
      rateNormal: number;
      rateSpecial: number;
    }
  >({
    mutationFn: (body) => AdminCategories.create(token!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.categories });
      qc.invalidateQueries({ queryKey: qk.admin.parkingState });
    },
  });
};

export const useUpdateCategory = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Category,
    Error,
    {
      id: string;
      patch: Partial<
        Pick<
          Category,
          "name" | "description" | "rateNormal" | "rateSpecial"
        >
      >;
    }
  >({
    mutationFn: ({ id, patch }) =>
      AdminCategories.update(token!, id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.categories });
      qc.invalidateQueries({ queryKey: qk.admin.parkingState });
    },
  });
};

export const useDeleteCategory = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, Error, { id: string }>({
    mutationFn: ({ id }) => AdminCategories.remove(token!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.admin.categories });
      qc.invalidateQueries({ queryKey: qk.admin.parkingState });
    },
  });
};

// Gates (admin)
export const useAdminGates = (token?: string) =>
  useQuery<Gate[]>({
    queryKey: qk.admin.gates,
    queryFn: () => AdminGates.list(token!),
    enabled: !!token,
  });

export const useCreateGate = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Gate,
    Error,
    { id: string; name: string; location?: string; zoneIds?: string[] }
  >({
    mutationFn: (body) => AdminGates.create(token!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.gates }),
  });
};

export const useUpdateGate = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Gate,
    Error,
    { id: string; patch: Partial<Record<string, unknown>> }
  >({
    mutationFn: ({ id, patch }) => AdminGates.update(token!, id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.gates }),
  });
};

export const useDeleteGate = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, Error, { id: string }>({
    mutationFn: ({ id }) => AdminGates.remove(token!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.gates }),
  });
};

// Users (admin)
export const useAdminUsers = (token?: string) =>
  useQuery<User[]>({
    queryKey: qk.admin.users,
    queryFn: () => AdminUsers.list(token!),
    enabled: !!token,
  });

export const useCreateAdminUser = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    User,
    Error,
    {
      username: string;
      name: string;
      role: "admin" | "employee";
      password: string;
    }
  >({
    mutationFn: (body) => AdminUsers.create(token!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.users }),
  });
};

export const useAdminTickets = (
  token?: string,
  status?: "checkedin" | "checkedout"
) =>
  useQuery<Ticket[]>({
    queryKey: qk.admin.tickets(status),
    queryFn: () =>
      AdminTickets.list(token!, status ? { status } : undefined),
    enabled: !!token,
  });

// Rush hours (admin)
export const useRushHours = (token?: string) =>
  useQuery<RushHour[]>({
    queryKey: qk.admin.rushHours,
    queryFn: () => AdminRushHours.list(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

export const useCreateRushHour = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    RushHour,
    Error,
    { weekDay: number; from: string; to: string }
  >({
    mutationFn: (body) => AdminRushHours.create(token!, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.admin.rushHours }),
  });
};

export const useUpdateRushHour = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    RushHour,
    Error,
    { id: string; patch: Partial<RushHour> }
  >({
    mutationFn: ({ id, patch }) =>
      AdminRushHours.update(token!, id, patch),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.admin.rushHours }),
  });
};

export const useDeleteRushHour = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, Error, { id: string }>({
    mutationFn: ({ id }) => AdminRushHours.remove(token!, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.admin.rushHours }),
  });
};

// Vacations (admin)
export const useVacations = (token?: string) =>
  useQuery<Vacation[]>({
    queryKey: qk.admin.vacations,
    queryFn: () => AdminVacations.list(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

export const useCreateVacation = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Vacation,
    Error,
    { name: string; from: string; to: string }
  >({
    mutationFn: (body) => AdminVacations.create(token!, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.admin.vacations }),
  });
};

export const useUpdateVacation = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Vacation,
    Error,
    { id: string; patch: Partial<Vacation> }
  >({
    mutationFn: ({ id, patch }) =>
      AdminVacations.update(token!, id, patch),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.admin.vacations }),
  });
};

export const useDeleteVacation = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<{ ok: true }, Error, { id: string }>({
    mutationFn: ({ id }) => AdminVacations.remove(token!, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.admin.vacations }),
  });
};
