"use client";

import Cookies from "js-cookie";
import { useState, useMemo } from "react";
import { useAdminGates, useCreateGate, useUpdateGate, useDeleteGate } from "@/services/queries/admin";
import type { Gate } from "@/types/api";

export default function AdminGatesPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminGates(token);

    const createM = useCreateGate(token);
    const updateM = useUpdateGate(token);
    const deleteM = useDeleteGate(token);

    const [form, setForm] = useState({ id: "", name: "", location: "" });
    const canCreate = useMemo(() => form.id.trim() && form.name.trim(), [form]);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Gates</h1>

            <div className="rounded-xl border bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="id" value={form.id} onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))} />
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                    <input className="rounded-lg border px-3 py-2 text-sm" placeholder="location" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
                </div>
                <div className="mt-3">
                    <button
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={!canCreate || createM.isPending}
                        onClick={() => createM.mutate({ id: form.id.trim(), name: form.name.trim(), location: form.location.trim() || undefined })}
                    >
                        {createM.isPending ? "Creating…" : "Create"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load gates.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Location</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((g: Gate) => (
                                <tr key={g.id} className="border-t">
                                    <td className="px-3 py-2">{g.id}</td>
                                    <td className="px-3 py-2">{g.name}</td>
                                    <td className="px-3 py-2">{g.location ?? "—"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs"
                                                onClick={() => updateM.mutate({ id: g.id, patch: { location: (g.location ?? "HQ") + " *" } })}
                                                disabled={updateM.isPending}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs text-red-600"
                                                onClick={() => deleteM.mutate({ id: g.id })}
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
