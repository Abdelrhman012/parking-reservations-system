"use client";

import Cookies from "js-cookie";
import { useState } from "react";
import { useAdminTickets } from "@/services/queries/admin";
import type { Ticket } from "@/types/api";

export default function AdminTicketsPage() {
    const token = Cookies.get("ps_token");
    const [tab, setTab] = useState<"checkedin" | "checkedout">("checkedin");
    const { data, isLoading, isError } = useAdminTickets(token, tab);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Tickets</h1>

            <div className="inline-flex rounded-lg border bg-white p-1">
                {(["checkedin", "checkedout"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-md px-3 py-1 text-sm ${tab === t ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load tickets.</div>
            ) : !data?.length ? (
                <div className="text-gray-600">No tickets.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Gate</th>
                                <th className="px-3 py-2">Zone</th>
                                <th className="px-3 py-2">Check-in</th>
                                {tab === "checkedout" && <th className="px-3 py-2">Check-out</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((t: Ticket) => (
                                <tr key={t.id} className="border-t">
                                    <td className="px-3 py-2">{t.id}</td>
                                    <td className="px-3 py-2">{t.type}</td>
                                    <td className="px-3 py-2">{t.gateId}</td>
                                    <td className="px-3 py-2">{t.zoneId}</td>
                                    <td className="px-3 py-2">{t.checkinAt ? new Date(t.checkinAt).toLocaleString() : "—"}</td>
                                    {tab === "checkedout" && <td className="px-3 py-2">{t.checkoutAt ? new Date(t.checkoutAt).toLocaleString() : "—"}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
