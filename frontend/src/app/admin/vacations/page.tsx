"use client";

import Cookies from "js-cookie";
import { useMemo, useState } from "react";
import { useVacations, useCreateVacation, useUpdateVacation, useDeleteVacation } from "@/services/queries/admin";
import type { Vacation } from "@/types/api";

export default function AdminVacationsPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useVacations(token);

    const createM = useCreateVacation(token);
    const updateM = useUpdateVacation(token);
    const deleteM = useDeleteVacation(token);

    const [form, setForm] = useState({ name: "", from: "", to: "" });
    const canCreate = useMemo(() => form.name.trim() && form.from && form.to, [form]);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Vacations</h1>

            <div className="rounded-xl border bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="from (YYYY-MM-DD)" value={form.from} onChange={(e) => setForm((s) => ({ ...s, from: e.target.value }))} />
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="to (YYYY-MM-DD)" value={form.to} onChange={(e) => setForm((s) => ({ ...s, to: e.target.value }))} />
                </div>
                <div className="mt-3">
                    <button
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={!canCreate || createM.isPending}
                        onClick={() => createM.mutate({ name: form.name.trim(), from: form.from, to: form.to })}
                    >
                        {createM.isPending ? "Creating…" : "Create"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load vacations.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">From</th>
                                <th className="px-3 py-2">To</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((v: Vacation) => (
                                <tr key={v.id} className="border-t">
                                    <td className="px-3 py-2">{v.id}</td>
                                    <td className="px-3 py-2">{v.name}</td>
                                    <td className="px-3 py-2">{v.from}</td>
                                    <td className="px-3 py-2">{v.to}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs"
                                                onClick={() => updateM.mutate({ id: v.id, patch: { name: v.name + " *" } })}
                                                disabled={updateM.isPending}
                                            >
                                                Rename
                                            </button>
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs text-red-600"
                                                onClick={() => deleteM.mutate({ id: v.id })}
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
