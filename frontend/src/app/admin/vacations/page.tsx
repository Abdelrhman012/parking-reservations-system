// src/app/admin/vacations/page.tsx
"use client";

import Cookies from "js-cookie";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
    useVacations,
    useCreateVacation,
    useUpdateVacation,
    useDeleteVacation,
} from "@/services/queries/admin";
import type { Vacation } from "@/types/api";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { Modal } from "@/components/admin/Modal";
import { IconButton } from "@/components/admin/IconButton";

export default function AdminVacationsPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useVacations(token);

    const createM = useCreateVacation(token);
    const updateM = useUpdateVacation(token);
    const deleteM = useDeleteVacation(token);

    const [form, setForm] = useState({ name: "", from: "", to: "" });
    const canCreate = useMemo(() => form.name.trim() && form.from && form.to, [form]);

    const onCreate = useCallback(() => {
        if (!canCreate) return;
        createM.mutate(
            { name: form.name.trim(), from: form.from, to: form.to },
            {
                onSuccess: () => {
                    toast("Vacation created.", "success");
                    setForm({ name: "", from: "", to: "" });
                },
                onError: (e) =>
                    toast(e instanceof Error ? e.message : "Failed to create vacation.", "error"),
            }
        );
    }, [canCreate, createM, form]);

    const onDelete = useCallback(
        (id: string) => {
            deleteM.mutate(
                { id },
                {
                    onSuccess: () => toast("Vacation deleted.", "success"),
                    onError: (e) =>
                        toast(e instanceof Error ? e.message : "Failed to delete vacation.", "error"),
                }
            );
        },
        [deleteM]
    );

    // Edit modal
    const [editOpen, setEditOpen] = useState(false);
    const [editOriginal, setEditOriginal] = useState<Vacation | null>(null);
    const [editForm, setEditForm] = useState<{ name: string; from: string; to: string }>({
        name: "",
        from: "",
        to: "",
    });

    const startEdit = useCallback((v: Vacation) => {
        setEditOriginal(v);
        setEditForm({ name: v.name, from: v.from, to: v.to });
        setEditOpen(true);
    }, []);

    const submitEdit = useCallback(() => {
        if (!editOriginal) return;
        updateM.mutate(
            { id: editOriginal.id, patch: { name: editForm.name, from: editForm.from, to: editForm.to } },
            {
                onSuccess: () => {
                    toast("Vacation updated.", "success");
                    setEditOpen(false);
                },
                onError: (e) =>
                    toast(e instanceof Error ? e.message : "Failed to update vacation.", "error"),
            }
        );
    }, [editOriginal, editForm, updateM]);

    useEffect(() => {
        if (!editOpen) setEditOriginal(null);
    }, [editOpen]);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Vacations</h1>

            {/* Create form — one row on desktop, no borders */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row">
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                    <input
                        type="date"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="from"
                        value={form.from}
                        onChange={(e) => setForm((s) => ({ ...s, from: e.target.value }))}
                    />
                    <input
                        type="date"
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

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load vacations.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr className="text-gray-500">
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">From</th>
                                <th className="px-3 py-2">To</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            {data?.map((v: Vacation) => (
                                <tr key={v.id}>
                                    <td className="px-3 py-2">{v.id}</td>
                                    <td className="px-3 py-2">{v.name}</td>
                                    <td className="px-3 py-2">{v.from}</td>
                                    <td className="px-3 py-2">{v.to}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton title="Edit" onClick={() => startEdit(v)} disabled={updateM.isPending}>
                                                <Pencil className="h-4 w-4" />
                                            </IconButton>
                                            <IconButton
                                                title="Delete"
                                                onClick={() => onDelete(v.id)}
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
                                        No vacations.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editOpen && (
                <Modal onClose={() => setEditOpen(false)} title={`Edit vacation: ${editOriginal?.id ?? ""}`}>
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                        />
                        <input
                            type="date"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="from"
                            value={editForm.from}
                            onChange={(e) => setEditForm((s) => ({ ...s, from: e.target.value }))}
                        />
                        <input
                            type="date"
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

