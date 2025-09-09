"use client";

import { useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
    useAdminZones,
    useCreateZone,
    useUpdateZone,
    useDeleteZone,
    useToggleZoneOpen,
} from "@/services/queries/admin";
import type { Zone } from "@/types/api";

export default function AdminZonesPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminZones(token);

    const createM = useCreateZone(token);
    const updateM = useUpdateZone(token);
    const deleteM = useDeleteZone(token);
    const toggleM = useToggleZoneOpen(token);

    const [form, setForm] = useState({
        id: "",
        name: "",
        categoryId: "cat_regular",
        gateIds: [] as string[],
        totalSlots: 0,
        rateNormal: 0,
        rateSpecial: 0,
        open: true,
    });

    const canCreate = useMemo(
        () => form.id.trim() && form.name.trim() && form.totalSlots > 0,
        [form]
    );



    return (
        <div className="space-y-6">
            {/* <h1 className="text-xl font-semibold">Zones</h1> */}

            <div className="rounded-xl  bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                        className="rounded-lg  px-3 py-2 text-sm"
                        placeholder="id"
                        value={form.id}
                        onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))}
                    />
                    <input
                        className="rounded-lg  px-3 py-2 text-sm"
                        placeholder="name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                    <select
                        className="rounded-lg  px-3 py-2 text-sm"
                        value={form.categoryId}
                        onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
                    >
                        <option value="cat_regular">cat_regular</option>
                        <option value="cat_premium">cat_premium</option>
                        <option value="cat_economy">cat_economy</option>
                        <option value="cat_vip">cat_vip</option>
                    </select>
                    <input
                        type="number"
                        className="rounded-lg  px-3 py-2 text-sm"
                        placeholder="total slots"
                        value={form.totalSlots || ""}
                        onChange={(e) => setForm((s) => ({ ...s, totalSlots: Number(e.target.value) || 0 }))}
                    />
                    <input
                        type="number"
                        className="rounded-lg  px-3 py-2 text-sm"
                        placeholder="rate normal"
                        value={form.rateNormal || ""}
                        onChange={(e) => setForm((s) => ({ ...s, rateNormal: Number(e.target.value) || 0 }))}
                    />
                    <input
                        type="number"
                        className="rounded-lg  px-3 py-2 text-sm"
                        placeholder="rate special"
                        value={form.rateSpecial || ""}
                        onChange={(e) => setForm((s) => ({ ...s, rateSpecial: Number(e.target.value) || 0 }))}
                    />
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.open}
                            onChange={(e) => setForm((s) => ({ ...s, open: e.target.checked }))}
                        />
                        Open
                    </label>
                </div>
                <div className="mt-3">
                    <button
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={!canCreate || createM.isPending}
                        onClick={() =>
                            createM.mutate({
                                id: form.id.trim(),
                                name: form.name.trim(),
                                categoryId: form.categoryId,
                                gateIds: form.gateIds,
                                totalSlots: form.totalSlots,
                                rateNormal: form.rateNormal,
                                rateSpecial: form.rateSpecial,
                                open: form.open,
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
                <div className="text-red-600">Failed to load zones.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl  bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2 text-right">Total</th>
                                <th className="px-3 py-2 text-right">Rate N</th>
                                <th className="px-3 py-2 text-right">Rate S</th>
                                <th className="px-3 py-2">Open</th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((z: Zone) => (
                                <tr key={z.id} className="-t">
                                    <td className="px-3 py-2">{z.id}</td>
                                    <td className="px-3 py-2">{z.name}</td>
                                    <td className="px-3 py-2">{z.categoryId}</td>
                                    <td className="px-3 py-2 text-right">{z.totalSlots}</td>
                                    <td className="px-3 py-2 text-right">{z.rateNormal ?? "—"}</td>
                                    <td className="px-3 py-2 text-right">{z.rateSpecial ?? "—"}</td>
                                    <td className="px-3 py-2">
                                        <button
                                            className="rounded-full  px-3 py-1 text-xs"
                                            onClick={() => toggleM.mutate({ id: z.id, open: !z.open })}
                                            disabled={toggleM.isPending}
                                        >
                                            {z.open ? "Close" : "Open"}
                                        </button>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                className="rounded-full  px-3 py-1 text-xs"
                                                onClick={() => updateM.mutate({ id: z.id, patch: { rateNormal: (z.rateNormal ?? 0) + 1 } })}
                                                disabled={updateM.isPending}
                                            >
                                                + RateN
                                            </button>
                                            <button
                                                className="rounded-full  px-3 py-1 text-xs text-red-600"
                                                onClick={() => deleteM.mutate({ id: z.id })}
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
