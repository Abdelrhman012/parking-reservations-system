"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import GateHeader from "@/components/GateHeader";
import ZoneCard from "@/components/ZoneCard";
import TicketModal from "@/components/TicketModal";
import { useZones } from "@/services/queries/master";
import { useCheckinVisitor } from "@/services/queries/tickets";
import { connectWS, subscribeGate, disconnectWS } from "@/services/ws";
import type { TicketCheckinResponse, Zone } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/store/app";
import ZoneCardSkeleton from "@/components/ZoneCardSkeleton";
import Tabs from "@/components/Tabs";
import SubscriberPanel from "@/components/SubscriberPanel";
import { toast } from "@/lib/toast";

export default function GatePage() {
    const { gateId } = useParams<{ gateId: string }>();

    const { data: zones, isLoading, error } = useZones(gateId);
    const qc = useQueryClient();
    const setWs = useApp((s) => s.setWs);
    const setTicketModal = useApp((s) => s.setTicketModal);
    const activeGateTab = useApp((s) => s.activeGateTab);
    const setActiveGateTab = useApp((s) => s.setActiveGateTab);
    useEffect(() => {
        if (!gateId) return;
        connectWS(
            {
                open: () => setWs(true),
                close: () => setWs(false),
                error: () => setWs(false),
                zoneUpdate: (payload) => {
                    qc.setQueryData<Zone[]>(["zones", gateId], (prev) =>
                        prev?.map((z) => (z.id === payload.id ? { ...z, ...payload } : z)) ?? prev
                    );
                },
            },
            undefined
        );
        subscribeGate(gateId);
        return () => disconnectWS();
    }, [gateId, qc, setWs]);

    const checkinVisitor = useCheckinVisitor();
    const onVisitorCheckin = (zoneId: string) => {
        if (!gateId) return;
        checkinVisitor.mutate(
            { gateId, zoneId },
            {
                onSuccess: (res) => {
                    qc.setQueryData<Zone[]>(["zones", gateId], (prev) =>
                        prev?.map((z) => (z.id === res.zoneState.id ? res.zoneState : z)) ?? prev
                    );
                    setTicketModal(res);
                    toast("Checked-in successfully.", "success");
                },
                onError: (err) => {
                    const msg = err instanceof Error ? err.message : "Something went wrong.";
                    toast(msg, "error");
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
                <GateHeader gateId={gateId || "—"} />
                <section className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-center">
                        <Tabs active={activeGateTab} onChange={setActiveGateTab} />

                        {checkinVisitor.isPending ? (
                            <span className="text-sm text-gray-500">Processing…</span>
                        ) : null}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ZoneCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="py-10 text-center text-red-600">Failed to load zones</div>
                    ) : !zones || !zones.length ? (
                        <div className="py-10 text-center text-gray-500">No zones available.</div>
                    ) : activeGateTab === "visitor" ? (
                        <>
                            {checkinVisitor.isPending && (
                                <div className="mb-3 text-sm text-gray-500">Processing…</div>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {zones.map((z) => (
                                    <ZoneCard
                                        key={z.id}
                                        zone={z}
                                        mode="visitor"
                                        onCheckin={onVisitorCheckin}
                                        disabled={!z.open || z.availableForVisitors <= 0}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <SubscriberPanel
                            gateId={gateId}
                            zones={zones}
                            onZoneStateUpdate={(newZone) => {
                                qc.setQueryData<Zone[]>(["zones", gateId], (prev) =>
                                    prev?.map((z) => (z.id === newZone.id ? newZone : z)) ?? prev
                                );
                            }}
                            onTicket={(res: TicketCheckinResponse, subId: string = "") => setTicketModal({ ...res, subscriptionId: subId })}
                        />
                    )}
                </section>
            </div>

            <TicketModal />
        </div>
    );
}
