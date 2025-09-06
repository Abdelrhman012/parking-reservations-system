import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Admin,
  Master,
  Tickets,
} from "./api";
import type { Gate, Zone, Ticket } from "@/types/domain";
import type { CheckoutResult } from "@/types/api";


type CheckoutPayload = {
  ticketCode: string;
  forceConvertToVisitor?: boolean;
};

export const useGates = () =>
  useQuery<Gate[]>({ queryKey: ["gates"], queryFn: Master.gates });

export const useZones = (gateId?: string) =>
  useQuery<Zone[]>({
    queryKey: ["zones", gateId],
    queryFn: () => Master.zonesByGate(gateId!),
    enabled: !!gateId,
  });

export const useParkingState = (token?: string) =>
  useQuery<Zone[]>({
    queryKey: ["admin", "parking-state"],
    queryFn: () => Admin.parkingState(token!),
    enabled: !!token,
  });

export const useToggleZoneOpen = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<Zone, Error, { id: string; open: boolean }>({
    mutationFn: ({ id, open }) => Admin.toggleZoneOpen(token!, id, open),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "parking-state"] }),
  });
};

export const useCheckinVisitor = () =>
  useMutation<
    Ticket,
    Error,
    { gateId: string; zoneId: string; plate?: string }
  >({
    mutationFn: Tickets.checkinVisitor,
  });

export const useCheckinSubscriber = () =>
  useMutation<
    Ticket,
    Error,
    { gateId: string; zoneId: string; subscriptionId: string }
  >({
    mutationFn: Tickets.checkinSubscriber,
  });

export const useCheckout = () =>
  useMutation<CheckoutResult, Error, CheckoutPayload>({
    mutationFn: (p) => Tickets.checkout(p),
  });
