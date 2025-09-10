"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";

import GateHeader from "@/components/GateHeader";
import ZoneCard from "@/components/ZoneCard";
import TicketModal from "@/components/TicketModal";
import ZoneCardSkeleton from "@/components/ZoneCardSkeleton";
import Tabs from "@/components/Tabs";
import SubscriberPanel from "@/components/SubscriberPanel";
import WSStatus from "@/components/WSStatus";
import { toast } from "@/lib/toast";

import { useGates, useZones } from "@/services/queries/master";
import { useRushHours, useVacations } from "@/services/queries/admin";
import { connectWS, subscribeGate, disconnectWS } from "@/services/ws";

import { useParams } from "next/navigation";
import { useApp } from "@/store/app";
import type { TicketCheckinResponse, Zone, RushHour, Vacation } from "@/types/api";
import { useCheckinVisitor } from "@/services/queries";



function nowUtcHHMM(d = new Date()): string {
    const hh = String(d.getHours()).padStart(2, "0");     
    const mm = String(d.getMinutes()).padStart(2, "0");  
    return `${hh}:${mm}`;
}

function nowUtcWeekday(d = new Date()): number {
    return d.getDay(); // Local weekday (0..6)
}

function todayIsoDate(d = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // Local YYYY-MM-DD
}

function isSpecialNow(rush: RushHour[] | undefined, vac: Vacation[] | undefined) {
    const day = todayIsoDate();
    const hhmm = nowUtcHHMM();
    const w = nowUtcWeekday();
    // vacations win first (same as backend)
    const inVacation = (vac ?? []).some(v => day >= v.from && day <= v.to);
    if (inVacation) return { special: true, reason: "vacation" as const };
    
    const inRush = (rush ?? []).some(r => r.weekDay === w && r.from <= hhmm && hhmm < r.to);
    console.log(hhmm)
    if (inRush) return { special: true, reason: "rush" as const };

    return { special: false as const };
}

export default function GatePage() {
    const { gateId } = useParams<{ gateId: string }>();

    // gates list (to validate gateId)
    const { data: gatesData, isLoading: gatesLoading } = useGates();
    const gateExists = useMemo(() => {
        if (!gateId || !gatesData) return false;
        return gatesData.some(g => g.id === gateId);
    }, [gateId, gatesData]);

    // zones for this gate
    const { data: zones, isLoading, error } = useZones(gateId);

    // rush hours + vacations (admin endpoints, enabled only if token exists)
    const token = Cookies.get("ps_token");
    const { data: rushHours } = useRushHours(token);
    const { data: vacations } = useVacations(token);

    const qc = useQueryClient();
    const setWs = useApp((s) => s.setWs);
    const setTicketModal = useApp((s) => s.setTicketModal);
    const activeGateTab = useApp((s) => s.activeGateTab);
    const setActiveGateTab = useApp((s) => s.setActiveGateTab);

    useEffect(() => {
        if (!gateId) return;
        connectWS({
            open: () => setWs(true),
            close: () => setWs(false),
            error: () => setWs(false),
            zoneUpdate: (payload) => {
                qc.setQueryData<Zone[]>(["zones", gateId], (prev) =>
                    prev?.map((z) => (z.id === payload.id ? { ...z, ...payload } : z)) ?? prev
                );
            },
        });
        subscribeGate(gateId);
        return () => disconnectWS();
    }, [gateId, qc, setWs]);

    // Check-in visitor
    const { mutate: checkinVisitor, isPending: checkinPending } = useCheckinVisitor();
    const onVisitorCheckin = (zoneId: string) => {
        if (!gateId) return;
        checkinVisitor(
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

    // Special mode now (rush/vacation)
    const special = isSpecialNow(rushHours, vacations);

    // GateId validation feedback
    if (!gateId) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-6xl p-4 md:p-8">
                    <div className="rounded-xl bg-white p-6 shadow-sm">Missing gate id.</div>
                </div>
            </div>
        );
    }
    if (!gatesLoading && gatesData && !gateExists) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="mx-auto max-w-6xl p-4 md:p-8">
                    <div className="rounded-xl bg-white p-6 shadow-sm text-red-600">
                        Gate &#34;{gateId}&#34; not found.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
                <GateHeader gateId={gateId || "—"} />

                {/* Optional banner to indicate current pricing mode */}
                <div className="rounded-xl  bg-white p-3 text-sm text-gray-700">
                    {special.special ? (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
                            <span>
                                Special rates active ({special.reason === "vacation" ? "Vacation" : "Rush hour"}).
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            <span>Normal rates right now.</span>
                        </div>
                    )}
                </div>

                <section className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-center">
                        <Tabs active={activeGateTab} onChange={setActiveGateTab} />
                        {checkinPending ? (
                            <span className="ml-3 text-sm text-gray-500">Processing…</span>
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
                            {checkinPending && (
                                <div className="mb-3 text-sm text-gray-500">Processing…</div>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {zones.map((z) => {
                                    const disabled = !z.open || z.availableForVisitors <= 0;
                                    return (
                                        <div key={z.id} className="relative">

                                            <ZoneCard
                                                zone={z}
                                                mode="visitor"
                                                onCheckin={onVisitorCheckin}
                                                disabled={disabled}
                                                special={special.special}
                                            />
                                        </div>
                                    );
                                })}
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
                            onTicket={(res: TicketCheckinResponse, subId: string = "") =>
                                setTicketModal({ ...res, subscriptionId: subId })
                            }
                        />
                    )}
                </section>
            </div>

            <TicketModal />
        </div>
    );
}
