"use client";

import Cookies from "js-cookie";
import { useAdminUsers, useCreateAdminUser } from "@/services/queries/admin";
import { useMemo, useState } from "react";
import type { User } from "@/types/api";

export default function AdminUsersPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminUsers(token);
    const createM = useCreateAdminUser(token);

    const [form, setForm] = useState({
        username: "",
        name: "",
        role: "employee" as "admin" | "employee",
        password: "",
    });

    const canCreate = useMemo(
        () => form.username.trim() && form.name.trim() && form.password.trim(),
        [form]
    );

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Users</h1>

            <div className="rounded-xl border bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="username" value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} />
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                    <select className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as "admin" | "employee" }))}>
                        <option value="employee">employee</option>
                        <option value="admin">admin</option>
                    </select>
                    <input className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" placeholder="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
                </div>
                <div className="mt-3">
                    <button
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={!canCreate || createM.isPending}
                        onClick={() =>
                            createM.mutate({
                                username: form.username.trim(),
                                name: form.name.trim(),
                                role: form.role,
                                password: form.password,
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
                <div className="text-red-600">Failed to load users.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">Username</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((u: User) => (
                                <tr key={u.username} className="border-t">
                                    <td className="px-3 py-2">{u.username}</td>
                                    <td className="px-3 py-2">{u.name}</td>
                                    <td className="px-3 py-2">{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
