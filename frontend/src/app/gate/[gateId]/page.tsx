"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import GateHeader from "@/components/GateHeader";
import ZoneCard from "@/components/ZoneCard";
import TicketModal from "@/components/TicketModal";
import { useZones } from "@/services/queries/master";
import { useCheckinVisitor } from "@/services/queries/tickets";
import { connectWS, subscribeGate, disconnectWS } from "@/services/ws";
import type { Zone } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/store/app";

export default function GatePage() {
    const { gateId } = useParams<{ gateId: string }>();

    const { data: zones, isLoading, error } = useZones(gateId);
    const qc = useQueryClient();
    const setWs = useApp((s) => s.setWs);
    const setTicketModal = useApp((s) => s.setTicketModal);

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

    const checkin = useCheckinVisitor();
    const onCheckin = (zoneId: string) => {
        if (!gateId) return;
        checkin.mutate(
            { gateId, zoneId },
            {
                onSuccess: (res) => {
                    qc.setQueryData<Zone[]>(["zones", gateId], (prev) =>
                        prev?.map((z) => (z.id === res.zoneState.id ? res.zoneState : z)) ?? prev
                    );
                    setTicketModal(res);
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
                <GateHeader gateId={gateId || "—"} />

                <section className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Visitor Check-in</h2>
                        {checkin.isPending ? (
                            <span className="text-sm text-gray-500">Processing…</span>
                        ) : null}
                    </div>

                    {isLoading ? (
                        <div className="py-10 text-center text-gray-500">Loading zones…</div>
                    ) : error ? (
                        <div className="py-10 text-center text-red-600">Failed to load zones</div>
                    ) : zones && zones.length ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {zones.map((z) => (
                                <ZoneCard
                                    key={z.id}
                                    zone={z}
                                    onCheckin={onCheckin}
                                    disabled={!z.open || z.availableForVisitors <= 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center text-gray-500">No zones available.</div>
                    )}
                </section>
            </div>

            <TicketModal />
        </div>
    );
}
