"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import {
    useAdminCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from "@/services/queries/admin";
import type { Category } from "@/types/api";
import { Pencil, Trash2} from "lucide-react";
import { makeCategoryId } from "@/utils/ids";
import { toast } from "@/lib/toast";
import AdminRealtime from "@/components/admin/AdminRealtime";
import { Modal } from "@/components/admin/Modal";
import Button from "@/components/Button";

type CatForm = {
    name: string;
    rateNormal: number;
    rateSpecial: number;
};

const defaultForm: CatForm = {
    name: "",
    rateNormal: 0,
    rateSpecial: 0,
};

export default function AdminCategoriesPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminCategories(token);

    const createM = useCreateCategory(token);
    const updateM = useUpdateCategory(token);
    const deleteM = useDeleteCategory(token);

    const [form, setForm] = useState<CatForm>(defaultForm);

    const [editOpen, setEditOpen] = useState(false);
    const [editOriginal, setEditOriginal] = useState<Category | null>(null);
    const [editForm, setEditForm] = useState<{
        id: string;
        name: string;
        rateNormal: number;
        rateSpecial: number;
    }>({ id: "", ...defaultForm });

    const canCreate = useMemo(
        () => form.name.trim() && (form.rateNormal >= 0 || form.rateSpecial >= 0),
        [form]
    );

    useEffect(() => {
        if (isError) toast("Failed to load categories.", "error");
    }, [isError]);

    const onCreate = useCallback(() => {
        const id = makeCategoryId(form.name);
        if (!id) {
            toast("Please enter a valid name.", "error");
            return;
        }
        createM.mutate(
            {
                id,
                name: form.name.trim(),
                rateNormal: Number(form.rateNormal) || 0,
                rateSpecial: Number(form.rateSpecial) || 0,
            },
            {
                onSuccess: () => {
                    toast("Category created.", "success");
                    setForm(defaultForm);
                },
                onError: (e) =>
                    toast(
                        e instanceof Error ? e.message : "Failed to create category.",
                        "error"
                    ),
            }
        );
    }, [createM, form]);

    const startEdit = useCallback((c: Category) => {
        setEditOriginal(c);
        setEditForm({
            id: c.id,
            name: c.name,
            rateNormal: c.rateNormal,
            rateSpecial: c.rateSpecial,
        });
        setEditOpen(true);
    }, []);

    const submitEdit = useCallback(() => {
        if (!editOriginal) return;
        updateM.mutate(
            {
                id: editOriginal.id,
                patch: {
                    name: editForm.name.trim(),
                    rateNormal: Number(editForm.rateNormal) || 0,
                    rateSpecial: Number(editForm.rateSpecial) || 0,
                },
            },
            {
                onSuccess: () => {
                    toast("Category updated.", "success");
                    setEditOpen(false);
                },
                onError: (e) =>
                    toast(
                        e instanceof Error ? e.message : "Failed to update category.",
                        "error"
                    ),
            }
        );
    }, [editOriginal, editForm, updateM]);

    useEffect(() => {
        if (!editOpen) setEditOriginal(null);
    }, [editOpen]);

    return (
        <div className="space-y-6">
            {/* Realtime invalidations (zone/category/rush/vacation...) */}
            <AdminRealtime />

            <h1 className="text-xl font-semibold">Categories</h1>

            {/* Create form – single row, no borders */}
            <div className="rounded-xl bg-white p-4">
                <div className="grid items-center gap-3 md:grid-cols-12">
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-3"
                        placeholder="name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                    <input
                        type="number"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        placeholder="rate normal"
                        value={form.rateNormal || ""}
                        onChange={(e) =>
                            setForm((s) => ({ ...s, rateNormal: Number(e.target.value) || 0 }))
                        }
                    />
                    <input
                        type="number"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        placeholder="rate special"
                        value={form.rateSpecial || ""}
                        onChange={(e) =>
                            setForm((s) => ({ ...s, rateSpecial: Number(e.target.value) || 0 }))
                        }
                    />
                    <div className="md:col-span-2">
                        <Button
                            className="w-full"
                            disabled={!canCreate || createM.isPending}
                            onClick={onCreate}
                        >
                            {createM.isPending ? "Creating…" : "Create"}
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load categories.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2 text-right">Rate N</th>
                                <th className="px-3 py-2 text-right">Rate S</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((c: Category) => (
                                <tr key={c.id} className="-t">
                                    <td className="px-3 py-2">{c.id}</td>
                                    <td className="px-3 py-2">{c.name}</td>
                                    <td className="px-3 py-2 text-right">
                                        {Number(c.rateNormal).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {Number(c.rateSpecial).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton
                                                title="Edit"
                                                onClick={() => startEdit(c)}
                                                disabled={updateM.isPending}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </IconButton>
                                            <IconButton
                                                title="Delete"
                                                onClick={() =>
                                                    deleteM.mutate(
                                                        { id: c.id },
                                                        {
                                                            onSuccess: () => toast("Category deleted.", "success"),
                                                            onError: (e) =>
                                                                toast(
                                                                    e instanceof Error
                                                                        ? e.message
                                                                        : "Failed to delete category.",
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
                <Modal onClose={() => setEditOpen(false)} title={`Edit category: ${editForm.id}`}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm sm:col-span-2"
                            value={editForm.id}
                            disabled
                        />
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm"
                            placeholder="name"
                            value={editForm.name}
                            onChange={(e) =>
                                setEditForm((s) => ({ ...s, name: e.target.value }))
                            }
                        />
                       
                        <input
                            type="number"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm"
                            placeholder="rate normal"
                            value={editForm.rateNormal || ""}
                            onChange={(e) =>
                                setEditForm((s) => ({
                                    ...s,
                                    rateNormal: Number(e.target.value) || 0,
                                }))
                            }
                        />
                        <input
                            type="number"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm"
                            placeholder="rate special"
                            value={editForm.rateSpecial || ""}
                            onChange={(e) =>
                                setEditForm((s) => ({
                                    ...s,
                                    rateSpecial: Number(e.target.value) || 0,
                                }))
                            }
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

/* UI bits */

function IconButton({
    children,
    title,
    onClick,
    disabled,
    danger,
}: {
    children: React.ReactNode;
    title?: string;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-full p-2 hover:bg-gray-100 disabled:opacity-50 ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                }`}
        >
            {children}
        </button>
    );
}

