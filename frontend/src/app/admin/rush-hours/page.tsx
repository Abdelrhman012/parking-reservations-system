"use client";

import Cookies from "js-cookie";
import { useMemo, useState } from "react";
import { useRushHours, useCreateRushHour, useUpdateRushHour, useDeleteRushHour } from "@/services/queries/admin";
import type { RushHour } from "@/types/api";

export default function AdminRushHoursPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useRushHours(token);

    const createM = useCreateRushHour(token);
    const updateM = useUpdateRushHour(token);
    const deleteM = useDeleteRushHour(token);

    const [form, setForm] = useState({ weekDay: 1, from: "08:00", to: "10:00" });
    const canCreate = useMemo(() => !!form.from && !!form.to, [form]);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Rush Hours</h1>

            <div className="rounded-xl border bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                    <input type="number" className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="weekday (1-7)" value={form.weekDay} onChange={(e) => setForm((s) => ({ ...s, weekDay: Number(e.target.value) || 1 }))} />
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="from" value={form.from} onChange={(e) => setForm((s) => ({ ...s, from: e.target.value }))} />
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="to" value={form.to} onChange={(e) => setForm((s) => ({ ...s, to: e.target.value }))} />
                </div>
                <div className="mt-3">
                    <button
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={!canCreate || createM.isPending}
                        onClick={() => createM.mutate({ weekDay: form.weekDay, from: form.from, to: form.to })}
                    >
                        {createM.isPending ? "Creating…" : "Create"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load rush hours.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Weekday</th>
                                <th className="px-3 py-2">From</th>
                                <th className="px-3 py-2">To</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((r: RushHour) => (
                                <tr key={r.id} className="border-t">
                                    <td className="px-3 py-2">{r.id}</td>
                                    <td className="px-3 py-2">{r.weekDay}</td>
                                    <td className="px-3 py-2">{r.from}</td>
                                    <td className="px-3 py-2">{r.to}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs"
                                                onClick={() => updateM.mutate({ id: r.id, patch: { to: r.to === "10:00" ? "11:00" : "10:00" } })}
                                                disabled={updateM.isPending}
                                            >
                                                Toggle To
                                            </button>
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs text-red-600"
                                                onClick={() => deleteM.mutate({ id: r.id })}
                                                disabled={deleteM.isPending}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
