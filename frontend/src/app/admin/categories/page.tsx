"use client";

import Cookies from "js-cookie";
import {
    useAdminCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from "@/services/queries/admin";
import { useMemo, useState } from "react";
import type { Category } from "@/types/api";

export default function AdminCategoriesPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminCategories(token);

    const createM = useCreateCategory(token);
    const updateM = useUpdateCategory(token);
    const deleteM = useDeleteCategory(token);

    const [form, setForm] = useState({
        id: "",
        name: "",
        description: "",
        rateNormal: 0,
        rateSpecial: 0,
    });

    const canCreate = useMemo(
        () => form.id.trim() && form.name.trim(),
        [form]
    );

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Categories</h1>

            <div className="rounded-xl border bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="id" value={form.id} onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))} />
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
                    <input type="number" className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="rate normal" value={form.rateNormal || ""} onChange={(e) => setForm((s) => ({ ...s, rateNormal: Number(e.target.value) || 0 }))} />
                    <input type="number" className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="rate special" value={form.rateSpecial || ""} onChange={(e) => setForm((s) => ({ ...s, rateSpecial: Number(e.target.value) || 0 }))} />
                </div>
                <div className="mt-3">
                    <button
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={!canCreate || createM.isPending}
                        onClick={() =>
                            createM.mutate({
                                id: form.id.trim(),
                                name: form.name.trim(),
                                description: form.description.trim() || undefined,
                                rateNormal: form.rateNormal,
                                rateSpecial: form.rateSpecial,
                            })
                        }
                    >
                        {createM.isPending ? "Creating…" : "Create"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load categories.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2 text-right">Rate N</th>
                                <th className="px-3 py-2 text-right">Rate S</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((c: Category) => (
                                <tr key={c.id} className="border-t">
                                    <td className="px-3 py-2">{c.id}</td>
                                    <td className="px-3 py-2">{c.name}</td>
                                    <td className="px-3 py-2 text-right">{c.rateNormal}</td>
                                    <td className="px-3 py-2 text-right">{c.rateSpecial}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs"
                                                onClick={() =>
                                                    updateM.mutate({
                                                        id: c.id,
                                                        patch: { rateNormal: c.rateNormal + 1 },
                                                    })
                                                }
                                                disabled={updateM.isPending}
                                            >
                                                + RateN
                                            </button>
                                            <button
                                                className="rounded-full border px-3 py-1 text-xs text-red-600"
                                                onClick={() => deleteM.mutate({ id: c.id })}
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
