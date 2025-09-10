// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Auth } from "@/services/api";
import { setSession } from "@/lib/auth";
import { toast } from "@/lib/toast";
import Button from "@/components/Button";

function getErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    return "Login failed";
}

export default function LoginPage() {
    const [username, setU] = useState<string>("");
    const [password, setP] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const sp = useSearchParams();
    const router = useRouter();

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await Auth.login({ username, password }); // typed LoginResponse
            setSession(res.token, res.user);
            toast("Logged in successfully", "success");
            router.replace( res.user.role === "admin" ? "/admin" : "/checkpoint");
        } catch (err: unknown) {
            toast(getErrorMessage(err), "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="w-screen h-screen flex justify-center items-center bg-gray-100">
            <div className="mx-auto  max-w-md rounded-xl  text-black bg-white p-8 text-center shadow-sm">
                <h1 className="mb-4 text-lg font-semibold">Login</h1>
                <form className="space-y-3" onSubmit={onSubmit}>
                    <input
                        className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setU(e.currentTarget.value)}
                        autoComplete="username"
                    />
                    <input
                        className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setP(e.currentTarget.value)}
                        autoComplete="current-password"
                    />
                    <Button
                        disabled={loading || !username || !password}
                        type="submit"
                    >
                        {loading ? "Signing in…" : "Login"}
                    </Button>
                </form>
            </div>
        </main>
    );
}
