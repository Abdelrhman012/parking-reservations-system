"use client";
import { useEffect, useRef, useState } from "react";
import { useSubscription } from "@/services/queries/subscriptions";
import { useCheckinSubscriber } from "@/services/queries/tickets";
import ZoneCard from "@/components/ZoneCard";
import type { Zone } from "@/types/api";

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
    onTicket: (res: any) => void;
}) {
    const [subId, setSubId] = useState<string>("");
    const [verifiedId, setVerifiedId] = useState<string>("");

    const { data: sub, isFetching, isError } = useSubscription(verifiedId);
    const checkin = useCheckinSubscriber();

    // avoid re-triggering the same value
    const lastVerifiedRef = useRef<string>("");

    const verify = () => {
        const v = subId.trim();
        if (!v) return;
        if (v === lastVerifiedRef.current) return;
        lastVerifiedRef.current = v;
        setVerifiedId(v);
    };

    // auto-verify when length >= MIN_LEN (debounced)
    useEffect(() => {
        const v = subId.trim();
        if (v.length < MIN_LEN) {
            // if user deletes chars, clear verified target
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

    const onCheckin = (zoneId: string) => {
        if (!gateId || !sub?.id) return;
        checkin.mutate(
            { gateId, zoneId, subscriptionId: sub.id },
            {
                onSuccess: (res) => {
                    onZoneStateUpdate(res.zoneState);
                    onTicket(res);
                },
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
                <button
                    type="button"
                    className="h-9 rounded-lg bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    disabled={!subId.trim() || isFetching}
                    onClick={verify}
                >
                    {isFetching ? "Verifying…" : "Verify"}
                </button>
            </div>

            {verifiedId ? (
                <div
                    className={`rounded-lg border p-3 text-sm ${isError
                            ? "border-red-200 bg-red-50 text-red-700"
                            : sub?.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                >
                    {isError
                        ? "Subscription not found."
                        : sub?.active
                            ? `Subscription ${sub.id} is Active.`
                            : `Subscription ${sub?.id ?? verifiedId} is Inactive.`}
                </div>
            ) : null}

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
