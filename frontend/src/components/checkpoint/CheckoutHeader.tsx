"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { clearSession } from "@/lib/auth";
import { toast } from "@/lib/toast";
import Clock from "../Clock";
import Button from "../Button";
import WSStatus from "../WSStatus";

type Props = { className?: string };

export default function CheckoutHeader({ className = "" }: Props) {
    const router = useRouter();

    const [name, setName] = useState<string | null>(null);
    useEffect(() => {
        setName(Cookies.get("ps_name") ?? null);
    }, []);

    const handleLogout = useCallback(() => {
        clearSession();
        toast("Logged out successfully.", "success");
        router.replace("/login");
    }, [router]);

    return (
        <header
            className={`flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3 shadow-sm backdrop-blur ${className}`}
        >


            <div className="flex items-center gap-3">
                <WSStatus />
                <div className="hidden items-center gap-2 sm:flex">
                    <span
                        className="max-w-[160px] truncate text-sm font-medium text-gray-900"
                        suppressHydrationWarning
                    >
                        {name ?? "—"}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Clock />
                <Button onClick={handleLogout} style={{ width: "5rem" }}>
                    Logout
                </Button>
            </div>
        </header>
    );
}
