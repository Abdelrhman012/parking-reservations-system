"use client";
import { useEffect, useRef, useState } from "react";
import { useSubscription } from "@/services/queries/subscriptions";
import { useCheckinSubscriber } from "@/services/queries/tickets";
import ZoneCard from "@/components/ZoneCard";
import Spinner from "@/components/Spinner";
import { toast } from "@/lib/toast";
import type { Zone, TicketCheckinResponse } from "@/types/api";

const MIN_LEN = 7;
const DEBOUNCE_MS = 300;

export default function SubscriberPanel({
    gateId,
    zones,
    onZoneStateUpdate,
    onTicket,
}: {
    gateId: string;
    zones: Zone[];
    onZoneStateUpdate: (z: Zone) => void;
    onTicket: (res: TicketCheckinResponse) => void;
}) {
    const [subId, setSubId] = useState<string>("");
    const [verifiedId, setVerifiedId] = useState<string>("");

    const { data: sub, isFetching, isError } = useSubscription(verifiedId);
    const checkin = useCheckinSubscriber();

    const lastVerifiedRef = useRef<string>("");

    const verify = () => {
        const v = subId.trim();
        if (!v || v === lastVerifiedRef.current) return;
        lastVerifiedRef.current = v;
        setVerifiedId(v);
    };

    // auto-verify when input reaches MIN_LEN (debounced)
    useEffect(() => {
        const v = subId.trim();
        if (v.length < MIN_LEN) {
            if (verifiedId) setVerifiedId("");
            lastVerifiedRef.current = "";
            return;
        }
        if (v === lastVerifiedRef.current) return;

        const t = setTimeout(() => {
            lastVerifiedRef.current = v;
            setVerifiedId(v);
        }, DEBOUNCE_MS);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subId]);

    // show verification result in a toast
    useEffect(() => {
        if (!verifiedId || isFetching) return;

        if (isError) {
            toast("Subscription not found.", "error");
            return;
        }
        if (sub) {
            if (sub.active) toast(`Subscription ${sub.id} is Active.`, "success");
            else toast(`Subscription ${sub.id} is Inactive.`, "info");
        }
    }, [verifiedId, isFetching, isError, sub]);

    const onCheckin = (zoneId: string) => {
        if (!gateId || !sub?.id) return;
        checkin.mutate(
            { gateId, zoneId, subscriptionId: sub.id },
            {
                onSuccess: (res) => {
                    onZoneStateUpdate(res.zoneState);
                    onTicket(res);
                    toast("Subscriber checked-in successfully.", "success");
                },
                onError: (res) => toast(res.message, "error"),
            }
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-3">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Subscription ID
                    </label>
                    <input
                        value={subId}
                        onChange={(e) => setSubId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && verify()}
                        placeholder="e.g., sub_001"
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* button -> spinner while verifying */}
                {isFetching ? (
                    <div className="flex h-9 w-24 items-center justify-center rounded-lg border bg-white">
                        <Spinner size={16} />
                    </div>
                ) : (
                    <button
                        type="button"
                        className="h-9 w-24 rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        disabled={!subId.trim()}
                        onClick={verify}
                    >
                        Verify
                    </button>
                )}
            </div>

           
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {zones.map((z) => (
                    <ZoneCard
                        key={z.id}
                        zone={z}
                        mode="subscriber"
                        disabled={!z.open || z.availableForSubscribers <= 0 || !sub?.active}
                        onCheckin={onCheckin}
                    />
                ))}
            </div>
        </div>
    );
}
