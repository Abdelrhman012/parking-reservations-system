// src/app/admin/zones/page.tsx
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import {
    useAdminZones,
    useCreateZone,
    useUpdateZone,
    useDeleteZone,
    useToggleZoneOpen,
    useAdminGates,
} from "@/services/queries/admin";
import type { Zone, Gate } from "@/types/api";
import { Pencil, Trash2 } from "lucide-react";
import { makeZoneId } from "@/utils/ids";
import { toast } from "@/lib/toast";
import { Modal } from "@/components/admin/Modal";
import { IconButton } from "@/components/admin/IconButton";
import { MultiSelect } from "@/components/admin/MultiSelect";

type ZoneForm = {
    name: string;
    categoryId: string;
    gateIds: string[];
    totalSlots: number;
    open: boolean;
};

const defaultForm: ZoneForm = {
    name: "",
    categoryId: "cat_regular",
    gateIds: [],
    totalSlots: 0,
    open: true,
};

export default function AdminZonesPage() {
    const token = Cookies.get("ps_token");

    const { data, isLoading, isError } = useAdminZones(token);
    const { data: gates, isLoading: gatesLoading } = useAdminGates(token);
    const gateOptions = (gates as Gate[] | undefined)?.map((g) => ({
        value: g.id,
        label: g.location ? `${g.name} — ${g.location}` : g.name,
    })) ?? [];

    const createM = useCreateZone(token);
    const updateM = useUpdateZone(token);
    const deleteM = useDeleteZone(token);
    const toggleM = useToggleZoneOpen(token);

    const [form, setForm] = useState<ZoneForm>(defaultForm);

    const [editOpen, setEditOpen] = useState(false);
    const [editOriginal, setEditOriginal] = useState<Zone | null>(null);
    const [editForm, setEditForm] = useState<{
        id: string;
        name: string;
        categoryId: string;
        gateIds: string[];
        totalSlots: number;
        open: boolean;
    }>({ id: "", ...defaultForm });

    const canCreate = useMemo(() => form.name.trim() && form.totalSlots > 0, [form]);

    useEffect(() => {
        if (isError) toast("Failed to load zones.", "error");
    }, [isError]);

    const startEdit = useCallback((z: Zone) => {
        setEditOriginal(z);
        setEditForm({
            id: z.id,
            name: z.name,
            categoryId: z.categoryId,
            gateIds: Array.isArray(z.gateIds) ? z.gateIds : [],
            totalSlots: z.totalSlots,
            open: !!z.open,
        });
        setEditOpen(true);
    }, []);

    const submitEdit = useCallback(() => {
        if (!editOriginal) return;
        const patch: Partial<Zone> = {
            name: editForm.name.trim(),
            categoryId: editForm.categoryId,
            gateIds: editForm.gateIds,
            totalSlots: editForm.totalSlots,
        };

        updateM.mutate(
            { id: editOriginal.id, patch },
            {
                onSuccess: () => {
                    toast("Zone updated.", "success");
                    if (editForm.open !== editOriginal.open) {
                        toggleM.mutate(
                            { id: editOriginal.id, open: editForm.open },
                            {
                                onSuccess: () => toast(editForm.open ? "Zone opened." : "Zone closed.", "success"),
                                onError: (e) =>
                                    toast(e instanceof Error ? e.message : "Failed to toggle zone.", "error"),
                                onSettled: () => setEditOpen(false),
                            }
                        );
                    } else {
                        setEditOpen(false);
                    }
                },
                onError: (e) => toast(e instanceof Error ? e.message : "Failed to update zone.", "error"),
            }
        );
    }, [editOriginal, editForm, updateM, toggleM]);

    useEffect(() => {
        if (!editOpen) setEditOriginal(null);
    }, [editOpen]);

    const onCreate = useCallback(() => {
        const id = makeZoneId(form.name);
        if (!id) {
            toast("Please enter a valid name.", "error");
            return;
        }

        createM.mutate(
            {
                id,
                name: form.name.trim(),
                categoryId: form.categoryId,
                gateIds: form.gateIds,
                totalSlots: form.totalSlots,
                open: form.open,
            },
            {
                onSuccess: () => {
                    toast("Zone created.", "success");
                    setForm(defaultForm);
                },
                onError: (e) => toast(e instanceof Error ? e.message : "Failed to create zone.", "error"),
            }
        );
    }, [createM, form]);

    const handleMultiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions).map((o) => o.value);
        setForm((s) => ({ ...s, gateIds: values }));
    };

    const handleEditMultiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(e.target.selectedOptions).map((o) => o.value);
        setEditForm((s) => ({ ...s, gateIds: values }));
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl bg-white p-4">
                <div className="grid items-center gap-3 md:grid-cols-12">
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-3"
                        placeholder="name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                    <select
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        value={form.categoryId}
                        onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
                    >
                        <option value="cat_regular">cat_regular</option>
                        <option value="cat_premium">cat_premium</option>
                        <option value="cat_economy">cat_economy</option>
                        <option value="cat_vip">cat_vip</option>
                    </select>

                    <MultiSelect
                        options={gateOptions}
                        value={form.gateIds}
                        onChange={(vals) => setForm((s) => ({ ...s, gateIds: vals }))}
                        placeholder="Select gates…"
                        disabled={gatesLoading}
                        className="md:col-span-3"
                    />


                    <input
                        type="number"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        placeholder="total slots"
                        value={form.totalSlots || ""}
                        onChange={(e) => setForm((s) => ({ ...s, totalSlots: Number(e.target.value) || 0 }))}
                    />

                    <div className="flex items-center gap-2 md:col-span-1">
                        <Toggle checked={form.open} onChange={(v) => setForm((s) => ({ ...s, open: v }))} />
                        <span className="text-sm text-gray-700">Open</span>
                    </div>

                    <div className="md:col-span-1">
                        <button
                            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            disabled={!canCreate || createM.isPending}
                            onClick={onCreate}
                        >
                            {createM.isPending ? "Creating…" : "Create"}
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load zones.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2 text-right">Total</th>
                                <th className="px-3 py-2">Open</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((z: Zone) => (
                                <tr key={z.id} className="-t">
                                    <td className="px-3 py-2">{z.id}</td>
                                    <td className="px-3 py-2">{z.name}</td>
                                    <td className="px-3 py-2">{z.categoryId}</td>
                                    <td className="px-3 py-2 text-right">{z.totalSlots}</td>
                                    <td className="px-3 py-2">
                                        <Toggle
                                            checked={!!z.open}
                                            onChange={(v) =>
                                                toggleM.mutate(
                                                    { id: z.id, open: v },
                                                    {
                                                        onSuccess: () => toast(v ? "Zone opened." : "Zone closed.", "success"),
                                                        onError: (e) =>
                                                            toast(
                                                                e instanceof Error ? e.message : "Failed to toggle zone.",
                                                                "error"
                                                            ),
                                                    }
                                                )
                                            }
                                            disabled={toggleM.isPending}
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton title="Edit" onClick={() => startEdit(z)} disabled={updateM.isPending}>
                                                <Pencil className="h-4 w-4" />
                                            </IconButton>
                                            <IconButton
                                                title="Delete"
                                                onClick={() =>
                                                    deleteM.mutate(
                                                        { id: z.id },
                                                        {
                                                            onSuccess: () => toast("Zone deleted.", "success"),
                                                            onError: (e) =>
                                                                toast(
                                                                    e instanceof Error ? e.message : "Failed to delete zone.",
                                                                    "error"
                                                                ),
                                                        }
                                                    )
                                                }
                                                disabled={deleteM.isPending}
                                                danger
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editOpen && (
                <Modal onClose={() => setEditOpen(false)} title={`Edit zone: ${editForm.id}`}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm sm:col-span-2" value={editForm.id} disabled />
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm"
                            placeholder="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                        />
                        <select
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm"
                            value={editForm.categoryId}
                            onChange={(e) => setEditForm((s) => ({ ...s, categoryId: e.target.value }))}
                        >
                            <option value="cat_regular">cat_regular</option>
                            <option value="cat_premium">cat_premium</option>
                            <option value="cat_economy">cat_economy</option>
                            <option value="cat_vip">cat_vip</option>
                        </select>

                        <MultiSelect
                            options={gateOptions}
                            value={editForm.gateIds}
                            onChange={(vals) => setEditForm((s) => ({ ...s, gateIds: vals }))}
                            placeholder="Select gates…"
                            disabled={gatesLoading}
                            className="sm:col-span-2"
                        />


                        <input
                            type="number"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm"
                            placeholder="total slots"
                            value={editForm.totalSlots || ""}
                            onChange={(e) =>
                                setEditForm((s) => ({ ...s, totalSlots: Number(e.target.value) || 0 }))
                            }
                        />
                        <div className="sm:col-span-2 flex items-center gap-3">
                            <Toggle checked={editForm.open} onChange={(v) => setEditForm((s) => ({ ...s, open: v }))} />
                            <span className="text-sm text-gray-700">Open</span>
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                        <button
                            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            onClick={() => setEditOpen(false)}
                            disabled={updateM.isPending || toggleM.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                            onClick={submitEdit}
                            disabled={updateM.isPending || toggleM.isPending}
                        >
                            {updateM.isPending || toggleM.isPending ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label className={`inline-flex items-center ${disabled ? "opacity-60" : "cursor-pointer"}`}>
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className="relative h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-emerald-500">
                <span
                    className={`absolute ${checked ? "right-0.5" : "left-0.5"} top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4`}
                />
            </span>
        </label>
    );
}
