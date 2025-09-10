"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";

import { useAdminGates, useAdminUsers } from "@/services/queries/admin";
import { connectWS, disconnectWS, subscribeGate } from "@/services/ws";
import { IconButton } from "@/components/admin/IconButton";
import { Modal } from "@/components/admin/Modal";
import WSStatus from "@/components/WSStatus";

type AdminUpdatePayload = {
    adminId: string;
    action: string;
    targetType: "zone" | "category" | "vacation" | "rush" | "gate" | "user" | "ticket";
    targetId: string;
    details?: unknown;
    timestamp: string; // ISO
};

type LogEntry = AdminUpdatePayload & {
    adminName?: string;
};

function formatLocal(ts: string) {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString();
}

function summarize(p: AdminUpdatePayload) {
    switch (p.targetType) {
        case "zone":
            return p.action === "zone-opened" || p.action === "zone-closed"
                ? `${p.action.replace("zone-", "Zone ")} (${p.targetId})`
                : `Zone updated (${p.targetId})`;
        case "category":
            return p.action === "category-rates-changed"
                ? `Category rates changed (${p.targetId})`
                : `Category updated (${p.targetId})`;
        case "vacation":
            return `Vacation updated (${p.targetId})`;
        case "rush":
            return `Rush hours updated (${p.targetId})`;
        case "gate":
            return `Gate updated (${p.targetId})`;
        case "user":
            return `User updated (${p.targetId})`;
        case "ticket":
            return `Ticket updated (${p.targetId})`;
        default:
            return `${p.action} (${p.targetType}:${p.targetId})`;
    }
}

export default function AdminLogsPage() {
    const token = Cookies.get("ps_token");
    const qc = useQueryClient();

    // Load gates to subscribe; load users to map adminId → name
    const { data: gates } = useAdminGates(token);
    const { data: users } = useAdminUsers(token);

    const adminNameById = useMemo(() => {
        const map = new Map<string, string>();
        (users ?? []).forEach((u) => {
            // prefer display name; fallback to username
            map.set(u.id, (u.name as string) || (u.username as string));
        });
        return map;
    }, [users]);

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selected, setSelected] = useState<LogEntry | null>(null);
    const subscribed = useRef<Set<string>>(new Set());

    // Open WS + handle incoming adminUpdate
    // type guard
    function isAdminUpdatePayload(p: unknown): p is AdminUpdatePayload {
        if (!p || typeof p !== "object") return false;
        const o = p as Record<string, unknown>;
        return (
            typeof o.adminId === "string" &&
            typeof o.action === "string" &&
            typeof o.targetType === "string" &&
            typeof o.targetId === "string" &&
            typeof o.timestamp === "string"
        );
    }

    useEffect(() => {
        connectWS({
            open: () => { },
            close: () => { },
            error: () => { },

            zoneUpdate: (_payload: unknown) => {
                qc.invalidateQueries();
            },

            adminUpdate: (p?: Record<string, unknown>) => {
                if (!isAdminUpdatePayload(p)) return;
                const entry: LogEntry = {
                    ...p,
                    adminName: adminNameById.get(p.adminId),
                };
                setLogs((prev) => [entry, ...prev].slice(0, 500));
            },
        });

        return () => {
            disconnectWS();
        };
    }, [qc, adminNameById]);

    // Subscribe to all gates so this page receives broadcasted admin-update events
    useEffect(() => {
        if (!gates) return;
        for (const g of gates) {
            if (!subscribed.current.has(g.id)) {
                subscribeGate(g.id);
                subscribed.current.add(g.id);
            }
        }
    }, [gates]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Admin Activity Logs</h1>
                <WSStatus />
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-3 text-sm text-gray-600">
                    Live stream of admin changes. Showing {logs.length} event{logs.length === 1 ? "" : "s"}.
                </div>

                {!logs.length ? (
                    <div className="text-gray-600">No activity yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-3 py-2">Time</th>
                                    <th className="px-3 py-2">Admin</th>
                                    <th className="px-3 py-2">Action</th>
                                    <th className="px-3 py-2">Target</th>
                                    <th className="px-3 py-2 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((l, idx) => (
                                    <tr key={`${l.timestamp}-${l.adminId}-${idx}`} className="-t">
                                        <td className="px-3 py-2 whitespace-nowrap">{formatLocal(l.timestamp)}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900">{l.adminName ?? l.adminId}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">{summarize(l)}</td>
                                        <td className="px-3 py-2">
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                                                {l.targetType}:{l.targetId}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end">
                                                <IconButton title="View payload" onClick={() => setSelected(l)}>
                                                    <Eye className="h-4 w-4" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <Modal title="Admin event details" onClose={() => setSelected(null)}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Info label="When" value={formatLocal(selected.timestamp)} />
                        <Info label="Admin" value={selected.adminName ?? selected.adminId} />
                        <Info label="Action" value={selected.action} />
                        <Info label="Target" value={`${selected.targetType}:${selected.targetId}`} />
                    </div>
                    <div className="mt-4">
                        <div className="mb-2 text-sm font-semibold text-gray-900">Payload</div>
                        <pre className="max-h-80 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-800">
                            {JSON.stringify(selected, null, 2)}
                        </pre>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <span className="text-gray-600">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}
