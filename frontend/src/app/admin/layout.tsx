"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import WSStatus from "@/components/WSStatus";
import AdminRealtime from "@/components/admin/AdminRealtime";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();


    const nav = [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/zones", label: "Zones" },
        { href: "/admin/categories", label: "Categories" },
        { href: "/admin/gates", label: "Gates" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/tickets", label: "Tickets" },
        { href: "/admin/rush-hours", label: "Rush Hours" },
        { href: "/admin/vacations", label: "Vacations" },
    ];

    return (
        <>
            <AdminRealtime />
            <div className="min-h-screen bg-gray-100 text-[#333]">
                <header className="sticky top-0 z-10 border-b bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <WSStatus />
                            <div className="text-lg font-semibold">Admin</div>
                        </div>
                        <nav className="flex flex-wrap gap-3 text-sm">
                            {nav.map((n) => (
                                <Link
                                    key={n.href}
                                    href={n.href}
                                    className={`rounded-full px-3 py-1 ${pathname === n.href ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                >
                                    {n.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </header>
                <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
            </div>
        </>
    );
}
