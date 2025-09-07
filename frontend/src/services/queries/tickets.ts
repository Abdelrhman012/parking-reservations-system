// src/services/queries/tickets.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tickets } from "../api";
import type {
  Ticket,
  TicketCheckinResponse,
  TicketCheckoutResponse,
} from "@/types/api";
import { qk } from "../queryKeys";

export const useTicket = (id?: string) =>
  useQuery<Ticket>({
    queryKey: id ? qk.tickets.one(id) : ["ticket", undefined],
    queryFn: () => Tickets.get(id!),
    enabled: !!id,
  });

export const useCheckinVisitor = () =>
  useMutation<
    TicketCheckinResponse,
    Error,
    { gateId: string; zoneId: string }
  >({
    mutationFn: Tickets.checkinVisitor,
  });

export const useCheckinSubscriber = () =>
  useMutation<
    TicketCheckinResponse,
    Error,
    { gateId: string; zoneId: string; subscriptionId: string }
  >({
    mutationFn: Tickets.checkinSubscriber,
  });

export const useCheckout = () =>
  useMutation<
    TicketCheckoutResponse,
    Error,
    { ticketId: string; forceConvertToVisitor?: boolean }
  >({
    mutationFn: Tickets.checkout,
  });
