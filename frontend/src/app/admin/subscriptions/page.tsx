"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Eye, Pencil } from "lucide-react";
import {
    useAdminSubscriptions,
    useCreateAdminSubscription,
    useUpdateAdminSubscription,
} from "@/services/queries/admin";
import type { Subscription } from "@/types/api";
import { Modal } from "@/components/admin/Modal";
import { IconButton } from "@/components/admin/IconButton";
import { toast } from "@/lib/toast";
import SubscriberDetails from "@/components/checkpoint/SubscriberDetails";
import Button from "@/components/Button";

/* helpers */

type CurrentCheckin = { ticketId: string; zoneId: string; checkinAt: string };
type Car = { plate: string; brand?: string; model?: string; color?: string };
type ExtSub = Subscription & {
    categories?: string[];
    currentCheckins?: CurrentCheckin[];
    cars?: Car[];
};

function humanizeCategoryId(id?: string): string {
    if (!id) return "—";
    const cleaned = id.replace(/^cat[_-]?/i, "").replace(/[_-]+/g, " ");
    return cleaned
        .split(" ")
        .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(" ");
}

function getCategoriesSafe(s: ExtSub): string[] {
    if (Array.isArray(s.categories) && s.categories.length) return s.categories;
    return s.category ? [s.category] : [];
}

function toDateInput(iso: string): string {
    if (!iso) return "";
    try {
        return new Date(iso).toISOString().slice(0, 10);
    } catch {
        return "";
    }
}

function toIsoFromDateInput(input: string): string {
    return input ? new Date(input + "T00:00:00.000Z").toISOString() : "";
}

/* toggle (as requested) */
export function Toggle({
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

/* forms */

type CreateForm = {
    id: string;
    userName: string;
    active: boolean;
    category: string;
    startsAt: string;   // yyyy-mm-dd
    expiresAt: string;  // yyyy-mm-dd
};

const defaultCreate = (): CreateForm => {
    const today = new Date();
    const in30 = new Date(today.getTime() + 30 * 24 * 3600 * 1000);
    const d = (x: Date) => x.toISOString().slice(0, 10);
    return {
        id: "",
        userName: "",
        active: true,
        category: "cat_regular",
        startsAt: d(today),
        expiresAt: d(in30),
    };
};

type Row = {
    id: string;
    active: boolean;
    categories: string[];
    currentCheckins: CurrentCheckin[];
    raw: ExtSub;
};

export default function AdminSubscriptionsPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminSubscriptions(token);
    const createM = useCreateAdminSubscription(token);
    const updateM = useUpdateAdminSubscription(token);

    useEffect(() => {
        if (isError) toast("Failed to load subscriptions.", "error");
    }, [isError]);

    const rows: Row[] = useMemo(() => {
        const list = (data ?? []) as ExtSub[];
        return list.map((s) => ({
            id: s.id,
            active: !!s.active,
            categories: getCategoriesSafe(s),
            currentCheckins: s.currentCheckins ?? [],
            raw: s,
        }));
    }, [data]);

    const total = rows.length;
    const activeCount = rows.filter((r) => r.active).length;
    const inactiveCount = total - activeCount;

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Row | null>(null);

    /* create */
    const [form, setForm] = useState<CreateForm>(defaultCreate());
    const canCreate = useMemo(
        () => form.id.trim() && form.userName.trim() && form.startsAt && form.expiresAt && form.category.trim(),
        [form]
    );

    const onCreate = useCallback(() => {
        if (!canCreate) return;

        const body: Omit<Subscription, "currentCheckins"> & {
            currentCheckins?: CurrentCheckin[];
        } = {
            id: form.id.trim(),
            userName: form.userName.trim(),
            active: form.active,
            category: form.category,
            startsAt: toIsoFromDateInput(form.startsAt),
            expiresAt: toIsoFromDateInput(form.expiresAt),
            cars: [],
            currentCheckins: [],
        };

        createM.mutate(body, {
            onSuccess: () => {
                toast("Subscription created.", "success");
                setForm(defaultCreate());
            },
            onError: (e) => toast(e instanceof Error ? e.message : "Failed to create subscription.", "error"),
        });
    }, [canCreate, createM, form]);

    /* edit */
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState<CreateForm>(defaultCreate());

    const openEdit = useCallback((r: Row) => {
        const s = r.raw;
        setEditForm({
            id: s.id,
            userName: s.userName ?? "",
            active: !!s.active,
            category: s.category ?? r.categories[0] ?? "cat_regular",
            startsAt: toDateInput(s.startsAt),
            expiresAt: toDateInput(s.expiresAt),
        });
        setEditOpen(true);
    }, []);

    const submitEdit = useCallback(() => {
        const patch: Partial<Subscription> = {
            userName: editForm.userName.trim(),
            active: editForm.active,
            category: editForm.category,
            startsAt: toIsoFromDateInput(editForm.startsAt),
            expiresAt: toIsoFromDateInput(editForm.expiresAt),
        };

        updateM.mutate(
            { id: editForm.id, patch },
            {
                onSuccess: () => {
                    toast("Subscription updated.", "success");
                    setEditOpen(false);
                },
                onError: (e) => toast(e instanceof Error ? e.message : "Failed to update subscription.", "error"),
            }
        );
    }, [editForm, updateM]);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Subscriptions</h1>

            {/* create form */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="grid items-center gap-3 md:grid-cols-14">
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        placeholder="id"
                        value={form.id}
                        onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))}
                    />
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        placeholder="user name"
                        value={form.userName}
                        onChange={(e) => setForm((s) => ({ ...s, userName: e.target.value }))}
                    />
                    <select
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        value={form.category}
                        onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                    >
                        <option value="cat_regular">cat_regular</option>
                        <option value="cat_premium">cat_premium</option>
                        <option value="cat_economy">cat_economy</option>
                        <option value="cat_vip">cat_vip</option>
                    </select>

                    

                    <input
                        type="date"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        value={form.startsAt}
                        onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))}
                    />
                    <input
                        type="date"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 md:col-span-2"
                        value={form.expiresAt}
                        onChange={(e) => setForm((s) => ({ ...s, expiresAt: e.target.value }))}
                    />

                    <div className="flex items-center gap-2 md:col-span-2">
                        <span className="text-sm text-gray-700">Active</span>
                        <Toggle
                            checked={form.active}
                            onChange={(v) => setForm((s) => ({ ...s, active: v }))}
                        />
                    </div>

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

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-3">
                <KpiCard label="Total" value={total} />
                <KpiCard label="Active" value={activeCount} tone="ok" />
                <KpiCard label="Inactive" value={inactiveCount} tone="warn" />
            </div>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load subscriptions.</div>
            ) : !rows.length ? (
                <div className="text-gray-600">No subscriptions.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">ID</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2 text-right">Active</th>
                                <th className="px-3 py-2 text-right">Check-ins</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id} className="-t">
                                    <td className="px-3 py-2">{r.id}</td>
                                    <td className="px-3 py-2">{r.raw.userName}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-1">
                                            {r.categories.length
                                                ? r.categories.map((c) => (
                                                    <span
                                                        key={c}
                                                        className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                                                    >
                                                        {humanizeCategoryId(c)}
                                                    </span>
                                                ))
                                                : "—"}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <Toggle
                                            checked={r.active}
                                            disabled={updateM.isPending}
                                            onChange={(v) =>
                                                updateM.mutate(
                                                    { id: r.id, patch: { active: v } },
                                                    {
                                                        onSuccess: () =>
                                                            toast(v ? "Subscription activated." : "Subscription deactivated.", "success"),
                                                        onError: (err) =>
                                                            toast(
                                                                err instanceof Error ? err.message : "Failed to update subscription.",
                                                                "error"
                                                            ),
                                                    }
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right">{r.currentCheckins.length}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <IconButton
                                                title="View details"
                                                onClick={() => {
                                                    setSelected(r);
                                                    setOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </IconButton>
                                            <IconButton
                                                title="Edit"
                                                onClick={() => openEdit(r)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* details modal */}
            {open && selected && (
                <Modal title={`Subscription: ${selected.id}`} onClose={() => setOpen(false)}>
                    <SubscriberDetails
                        sub={{
                            ...selected.raw,
                            categories: selected.categories,
                            currentCheckins: selected.currentCheckins,
                            cars: selected.raw.cars ?? [],
                        }}
                        categoryLabels={selected.categories.reduce<Record<string, string>>((m, c) => {
                            m[c] = humanizeCategoryId(c);
                            return m;
                        }, {})}
                    />
                </Modal>
            )}

            {/* edit modal */}
            {editOpen && (
                <Modal title={`Edit subscription: ${editForm.userName}`} onClose={() => setEditOpen(false)}>
                    <div className="grid items-center gap-3 md:grid-cols-12">
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm md:col-span-6"
                            value={editForm.id}
                            disabled
                        />
                        <input
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm md:col-span-6"
                            placeholder="user name"
                            value={editForm.userName}
                            onChange={(e) => setEditForm((s) => ({ ...s, userName: e.target.value }))}
                        />
                        <select
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm md:col-span-4"
                            value={editForm.category}
                            onChange={(e) => setEditForm((s) => ({ ...s, category: e.target.value }))}
                        >
                            <option value="cat_regular">cat_regular</option>
                            <option value="cat_premium">cat_premium</option>
                            <option value="cat_economy">cat_economy</option>
                            <option value="cat_vip">cat_vip</option>
                        </select>
                       
                        <input
                            type="date"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm md:col-span-4"
                            value={editForm.startsAt}
                            onChange={(e) => setEditForm((s) => ({ ...s, startsAt: e.target.value }))}
                        />
                        <input
                            type="date"
                            className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm md:col-span-4"
                            value={editForm.expiresAt}
                            onChange={(e) => setEditForm((s) => ({ ...s, expiresAt: e.target.value }))}
                        />
                        <div className="flex items-center gap-2 md:col-span-12 mx-auto">
                            <span className="text-sm text-gray-700">Active</span>
                            <Toggle
                                checked={editForm.active}
                                onChange={(v) => setEditForm((s) => ({ ...s, active: v }))}
                            />
                        </div>
                        <div className="flex justify-end md:col-span-12">
                            <Button
                                className="w-full"
                                onClick={submitEdit}
                                disabled={updateM.isPending}
                            >
                                {updateM.isPending ? "Saving…" : "Save"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* UI bits */

function KpiCard({
    label,
    value,
    tone = "default",
}: {
    label: string;
    value: number | string;
    tone?: "default" | "ok" | "warn";
}) {
    const toneCls =
        tone === "ok"
            ? "bg-emerald-500/10 text-emerald-700"
            : tone === "warn"
                ? "bg-amber-400/10 text-amber-700"
                : "bg-gray-100 text-gray-700";
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{value}</div>
            <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs ${toneCls}`}>{label}</div>
        </div>
    );
}
