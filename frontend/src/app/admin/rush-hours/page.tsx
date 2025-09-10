"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import {
    useRushHours,
    useCreateRushHour,
    useUpdateRushHour,
    useDeleteRushHour,
} from "@/services/queries/admin";
import type { RushHour } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { IconButton } from "@/components/admin/IconButton";
import { Modal } from "@/components/admin/Modal";

const WD_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // 0..6 (backend uses 0..6)

export default function AdminRushHoursPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useRushHours(token);

    const createM = useCreateRushHour(token);
    const updateM = useUpdateRushHour(token);
    const deleteM = useDeleteRushHour(token);

    const [form, setForm] = useState({ weekDay: 1, from: "08:00", to: "10:00" });
    const canCreate = useMemo(() => !!form.from && !!form.to, [form]);

    const onCreate = useCallback(() => {
        if (!canCreate) return;
        createM.mutate(
            { weekDay: form.weekDay, from: form.from, to: form.to },
            {
                onSuccess: () => {
                    toast("Rush hour created.", "success");
                },
                onError: (e) =>
                    toast(e instanceof Error ? e.message : "Failed to create rush hour.", "error"),
            }
        );
    }, [canCreate, createM, form]);


    const onDelete = useCallback(
        (id: string) => {
            deleteM.mutate(
                { id },
                {
                    onSuccess: () => toast("Rush hour deleted.", "success"),
                    onError: (e) =>
                        toast(e instanceof Error ? e.message : "Failed to delete rush hour.", "error"),
                }
            );
        },
        [deleteM]
    );

    // Edit modal state
    const [editOpen, setEditOpen] = useState(false);
    const [editOriginal, setEditOriginal] = useState<RushHour | null>(null);
    const [editForm, setEditForm] = useState<{ weekDay: number; from: string; to: string }>({
        weekDay: 1,
        from: "08:00",
        to: "10:00",
    });

    const startEdit = useCallback((r: RushHour) => {
        setEditOriginal(r);
        setEditForm({ weekDay: r.weekDay, from: r.from, to: r.to });
        setEditOpen(true);
    }, []);

    const submitEdit = useCallback(() => {
        if (!editOriginal) return;
        updateM.mutate(
            { id: editOriginal.id, patch: { weekDay: editForm.weekDay, from: editForm.from, to: editForm.to } },
            {
                onSuccess: () => {
                    toast("Rush hour updated.", "success");
                    setEditOpen(false);
                },
                onError: (e) =>
                    toast(e instanceof Error ? e.message : "Failed to update rush hour.", "error"),
            }
        );
    }, [editOriginal, editForm, updateM]);

    useEffect(() => {
        if (!editOpen) setEditOriginal(null);
    }, [editOpen]);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Rush Hours</h1>

            {/* Create form — one row on desktop, no borders */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row">
                    <select
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        value={form.weekDay}
                        onChange={(e) => setForm((s) => ({ ...s, weekDay: Number(e.target.value) || 0 }))}
                    >
                        {WD_LABELS.map((lbl, i) => (
                            <option key={i} value={i}>
                                {lbl} ({i})
                            </option>
                        ))}
                    </select>
                    <input
                        type="time"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="from"
                        value={form.from}
                        onChange={(e) => setForm((s) => ({ ...s, from: e.target.value }))}
                    />
                    <input
                        type="time"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="to"
                        value={form.to}
                        onChange={(e) => setForm((s) => ({ ...s, to: e.target.value }))}
                    />
                    <button
                        className="shrink-0 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={!canCreate || createM.isPending}
                        onClick={onCreate}
                    >
                        {createM.isPending ? "Creating…" : "Create"}
                    </button>
                </div>
            </div>

            {/* Table — no borders, icons, edit modal */}
            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load rush hours.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white ">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr className="text-gray-500">
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Weekday</th>
                                <th className="px-3 py-2">From</th>
                                <th className="px-3 py-2">To</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            {data?.map((r: RushHour) => (
                                <tr key={r.id}>
                                    <td className="px-3 py-2">{r.id}</td>
                                    <td className="px-3 py-2">
                                        {WD_LABELS[r.weekDay] ?? r.weekDay} ({r.weekDay})
                                    </td>
                                    <td className="px-3 py-2">{r.from}</td>
                                    <td className="px-3 py-2">{r.to}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton title="Edit" onClick={() => startEdit(r)} disabled={updateM.isPending}>
                                                <Pencil className="h-4 w-4" />
                                            </IconButton>

                                            <IconButton
                                                title="Delete"
                                                onClick={() => onDelete(r.id)}
                                                disabled={deleteM.isPending}
                                                danger
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!data?.length && (
                                <tr>
                                    <td className="px-3 py-4 text-gray-500" colSpan={5}>
                                        No rush hours.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editOpen && (
                <Modal onClose={() => setEditOpen(false)} title={`Edit rush hour: ${editOriginal?.id ?? ""}`}>
                    <div className="grid gap-3 md:grid-cols-3">
                        <select
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                            value={editForm.weekDay}
                            onChange={(e) => setEditForm((s) => ({ ...s, weekDay: Number(e.target.value) || 0 }))}
                        >
                            {WD_LABELS.map((lbl, i) => (
                                <option key={i} value={i}>
                                    {lbl} ({i})
                                </option>
                            ))}
                        </select>
                        <input
                            type="time"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="from"
                            value={editForm.from}
                            onChange={(e) => setEditForm((s) => ({ ...s, from: e.target.value }))}
                        />
                        <input
                            type="time"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="to"
                            value={editForm.to}
                            onChange={(e) => setEditForm((s) => ({ ...s, to: e.target.value }))}
                        />
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                        <button
                            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            onClick={() => setEditOpen(false)}
                            disabled={updateM.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            onClick={submitEdit}
                            disabled={updateM.isPending}
                        >
                            {updateM.isPending ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
