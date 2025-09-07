import { useQuery } from "@tanstack/react-query";
import { Master } from "../api";
import type { Gate, Zone, Category } from "@/types/api";
import { qk } from "../queryKeys";

export const useGates = () =>
  useQuery<Gate[]>({ queryKey: qk.master.gates, queryFn: Master.gates });

export const useZones = (gateId?: string) =>
  useQuery<Zone[]>({
    queryKey: gateId ? qk.master.zones(gateId) : ["zones", undefined],
    queryFn: () => Master.zonesByGate(gateId!),
    enabled: !!gateId,
  });

export const useMasterCategories = () =>
  useQuery<Category[]>({
    queryKey: qk.master.categories,
    queryFn: Master.categories,
  });
