// src/components/admin/AdminRealtime.tsx
"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/services/queryKeys";
import { connectWS, disconnectWS, subscribeGate } from "@/services/ws";
import { useGates } from "@/services/queries/master";
import { useApp } from "@/store/app";
import type { Gate } from "@/types/api";

type AdminUpdatePayload = {
    adminId: string;
    action: string;
    targetType: "zone" | "category" | "vacation" | "rush" | "gate" | "user" | "ticket";
    targetId: string;
    details?: unknown;
    timestamp: string;
};

export default function AdminRealtime() {
    const qc = useQueryClient();
    const setWs = useApp((s) => s.setWs);

    const { data: gates } = useGates(); // من master
    const subscribed = useRef<Set<string>>(new Set());
    const latestGatesRef = useRef<Gate[]>([]);
    useEffect(() => {
        latestGatesRef.current = gates ?? [];
    }, [gates]);

    useEffect(() => {
        connectWS({
            open: () => {
                setWs(true);
                // re-subscribe لكل الجيتس بعد reconnect
                subscribed.current.clear();
                for (const g of latestGatesRef.current) {
                    subscribeGate(g.id);
                    subscribed.current.add(g.id);
                }
            },
            close: () => setWs(false),
            error: () => setWs(false),

            zoneUpdate: () => {
                qc.invalidateQueries({ queryKey: qk.admin.parkingState });
                qc.invalidateQueries({ queryKey: qk.admin.zones });
            },

            adminUpdate: (p: AdminUpdatePayload) => {
                switch (p.targetType) {
                    case "zone":
                        qc.invalidateQueries({ queryKey: qk.admin.zones });
                        qc.invalidateQueries({ queryKey: qk.admin.parkingState });
                        break;
                    case "category":
                        qc.invalidateQueries({ queryKey: qk.admin.categories });
                        qc.invalidateQueries({ queryKey: qk.admin.parkingState });
                        break;
                    case "vacation":
                        qc.invalidateQueries({ queryKey: qk.admin.vacations });
                        break;
                    case "rush":
                        qc.invalidateQueries({ queryKey: qk.admin.rushHours });
                        break;
                    case "gate":
                        qc.invalidateQueries({ queryKey: qk.admin.gates });
                        break;
                    case "user":
                        qc.invalidateQueries({ queryKey: qk.admin.users });
                        break;
                    case "ticket":
                        qc.invalidateQueries({ queryKey: qk.admin.tickets("checkedin") });
                        qc.invalidateQueries({ queryKey: qk.admin.tickets("checkedout") });
                        break;
                    default:
                        qc.invalidateQueries({ queryKey: qk.admin.parkingState });
                }
            },
        });

        // return () => disconnectWS();
    }, [qc, setWs]);

    useEffect(() => {
        if (!gates) return;
        for (const g of gates) {
            if (!subscribed.current.has(g.id)) {
                subscribeGate(g.id);
                subscribed.current.add(g.id);
            }
        }
    }, [gates]);

    return null;
}
