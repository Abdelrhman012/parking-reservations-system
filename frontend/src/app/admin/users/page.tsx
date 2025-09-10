"use client";

import Cookies from "js-cookie";
import { useMemo, useState, useCallback } from "react";
import {
    useAdminUsers,
    useCreateAdminUser,
} from "@/services/queries/admin";
import type { User } from "@/types/api";
import { toast } from "@/lib/toast";

type UserForm = {
    username: string;
    name: string;
    role: "admin" | "employee";
    password: string;
};

const defaultForm: UserForm = {
    username: "",
    name: "",
    role: "employee",
    password: "",
};

export default function AdminUsersPage() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useAdminUsers(token);
    const createM = useCreateAdminUser(token);


    const [form, setForm] = useState<UserForm>(defaultForm);


    const canCreate = useMemo(
        () => form.username.trim() && form.name.trim() && form.password.trim(),
        [form]
    );

    const onCreate = useCallback(() => {
        if (!canCreate) return;
        createM.mutate(
            {
                username: form.username.trim(),
                name: form.name.trim(),
                role: form.role,
                password: form.password,
            },
            {
                onSuccess: () => {
                    toast("User created.", "success");
                    setForm(defaultForm);
                },
                onError: (e) => toast(e instanceof Error ? e.message : "Failed to create user.", "error"),
            }
        );
    }, [canCreate, createM, form]);



    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Users</h1>

            {/* Create form (one row on desktop) */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row">
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="username"
                        value={form.username}
                        onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                    />
                    <input
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="name"
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                    <select
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        value={form.role}
                        onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as "admin" | "employee" }))}
                    >
                        <option value="employee">employee</option>
                        <option value="admin">admin</option>
                    </select>
                    <input
                        type="password"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="password"
                        value={form.password}
                        onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
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
                <div className="text-red-600">Failed to load users.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl bg-white ">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr className="text-gray-500">
                                <th className="px-3 py-2">Username</th>
                                <th className="px-3 py-2">Name</th>
                                <th className="px-3 py-2">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((u: User) => (
                                <tr key={u.username}>
                                    <td className="px-3 py-2">{u.username}</td>
                                    <td className="px-3 py-2">{u.name}</td>
                                    <td className="px-3 py-2">{u.role}</td>

                                </tr>
                            ))}
                            {!data?.length && (
                                <tr>
                                    <td className="px-3 py-4 text-gray-500" colSpan={4}>
                                        No users.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}


        </div>
    );
}

