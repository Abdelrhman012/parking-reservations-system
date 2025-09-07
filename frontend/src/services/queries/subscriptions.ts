import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Subscriptions,
  AdminSubscriptions,
} from "../api";
import { qk } from "../queryKeys";
import { Subscription } from "@/types/api";

export const useSubscription = (id?: string) =>
  useQuery<Subscription>({
    queryKey: id ? qk.subscriptions.one(id) : ["subscription", undefined],
    queryFn: () => Subscriptions.get(id!),
    enabled: !!id,
  });

export const useCreateSubscription = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Subscription,
    Error,
    Omit<Subscription, "currentCheckins"> & {
      currentCheckins?: Subscription["currentCheckins"];
    }
  >({
    mutationFn: (body) => AdminSubscriptions.create(token!, body),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: qk.admin.subscriptions });
      qc.setQueryData(qk.subscriptions.one(s.id), s);
    },
  });
};

export const useUpdateSubscription = (token?: string) => {
  const qc = useQueryClient();
  return useMutation<
    Subscription,
    Error,
    { id: string; patch: Partial<Subscription> }
  >({
    mutationFn: ({ id, patch }) =>
      AdminSubscriptions.update(token!, id, patch),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: qk.admin.subscriptions });
      qc.setQueryData(qk.subscriptions.one(s.id), s);
    },
  });
};
