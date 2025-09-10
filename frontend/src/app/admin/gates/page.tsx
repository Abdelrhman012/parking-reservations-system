"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import {
    useAdminGates,
    useCreateGate,
    useUpdateGate,
    useDeleteGate,
} from "@/services/queries/admin";
import type { Gate } from "@/types/api";
import { Pencil, Trash2, X } from "lucide-react";
import { slugifyName } from "@/utils/ids";
import { toast } from "@/lib/toast";
import { Modal } from "@/components/admin/Modal";
import { IconButton } from "@/components/admin/IconButton";

type GateForm = {
    name: string;
    location: string;
};

const defaultForm: GateForm = {
    name: "",
    location: "",
};

export default function AdminGatesPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminGates(token);

    const createM = useCreateGate(token);
    const updateM = useUpdateGate(token);
    const deleteM = useDeleteGate(token);

    const [form, setForm] = useState<GateForm>(defaultForm);

    const [editOpen, setEditOpen] = useState(false);
    const [editOriginal, setEditOriginal] = useState<Gate | null>(null);
    const [editForm, setEditForm] = useState<GateForm>(defaultForm);

    const canCreate = useMemo(() => form.name.trim().length > 0, [form.name]);

    const onCreate = useCallback(() => {
        if (!canCreate) return;
        const id = slugifyName(form.name);
        createM.mutate(
            {
                id,
                name: form.name.trim(),
                location: form.location.trim() || undefined,
            },
            {
                onSuccess: () => {
                    toast("Gate created.", "success");
                    setForm(defaultForm);
                },
                onError: (e) => toast(e instanceof Error ? e.message : "Failed to create gate.", "error"),
            }
        );
    }, [canCreate, createM, form]);

    const startEdit = useCallback((g: Gate) => {
        setEditOriginal(g);
        setEditForm({
            name: g.name,
            location: g.location ?? "",
        });
        setEditOpen(true);
    }, []);

    const submitEdit = useCallback(() => {
        if (!editOriginal) return;
        const patch: Partial<Gate> = {
            name: editForm.name.trim(),
            location: editForm.location.trim() || undefined,
        };
        updateM.mutate(
            { id: editOriginal.id, patch },
            {
                onSuccess: () => {
                    toast("Gate updated.", "success");
                    setEditOpen(false);
                },
                onError: (e) => toast(e instanceof Error ? e.message : "Failed to update gate.", "error"),
            }
        );
    }, [editOriginal, editForm, updateM]);

    const onDelete = useCallback(
        (id: string) => {
            deleteM.mutate(
                { id },
                {
                    onSuccess: () => toast("Gate deleted.", "success"),
                    onError: (e) => toast(e instanceof Error ? e.message : "Failed to delete gate.", "error"),
                }
            );
        },
        [deleteM]
    );

    useEffect(() => {
        if (!editOpen) setEditOriginal(null);
    }, [editOpen]);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Gates</h1>

            {/* Create form */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row">
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="location"
                        value={form.location}
                        onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
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

            {/* Table */}
            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load gates.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr >
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Location</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody >
                            {data?.map((g: Gate) => (
                                <tr key={g.id}>
                                    <td className="px-3 py-2">{g.id}</td>
                                    <td className="px-3 py-2">{g.name}</td>
                                    <td className="px-3 py-2">{g.location ?? "—"}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton title="Edit" onClick={() => startEdit(g)} disabled={updateM.isPending}>
                                                <Pencil className="h-4 w-4" />
                                            </IconButton>
                                            <IconButton
                                                title="Delete"
                                                onClick={() => onDelete(g.id)}
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
                                    <td className="px-3 py-4 text-gray-500" colSpan={4}>
                                        No gates.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit modal */}
            {editOpen && (
                <Modal onClose={() => setEditOpen(false)} title={`Edit gate: ${editOriginal?.id ?? ""}`}>
                    <div className="grid gap-3 md:grid-cols-2">
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                            value={editOriginal?.id ?? ""}
                            disabled
                        />
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                        />
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="location"
                            value={editForm.location}
                            onChange={(e) => setEditForm((s) => ({ ...s, location: e.target.value }))}
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

