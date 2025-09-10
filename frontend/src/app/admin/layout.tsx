"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import WSStatus from "@/components/WSStatus";
import Clock from "@/components/Clock";
import Button from "@/components/Button";
import AdminRealtime from "@/components/admin/AdminRealtime";
import { clearSession } from "@/lib/auth";
import { toast } from "@/lib/toast";
import {
    Menu,
    LayoutDashboard,
    Map,
    Tags,
    DoorOpen,
    Users,
    Ticket,
    Timer,
    CalendarDays,
    IdCard,
    ScrollText,
} from "lucide-react";
import dynamic from "next/dynamic";

 function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [name, setName] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setName(Cookies.get("ps_name") ?? null);
    }, []);

    const handleLogout = useCallback(() => {
        clearSession();
        toast("Logged out successfully.", "success");
        router.replace("/login");
    }, [router]);

    const nav = [
        { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
        { href: "/admin/zones", label: "Zones", Icon: Map },
        { href: "/admin/categories", label: "Categories", Icon: Tags },
        { href: "/admin/gates", label: "Gates", Icon: DoorOpen },
        { href: "/admin/users", label: "Users", Icon: Users },
        { href: "/admin/tickets", label: "Tickets", Icon: Ticket },
        { href: "/admin/rush-hours", label: "Rush Hours", Icon: Timer },
        { href: "/admin/vacations", label: "Vacations", Icon: CalendarDays },
        { href: "/admin/subscriptions", label: "Subscriptions", Icon: IdCard },
        { href: "/admin/logs", label: "Logs", Icon: ScrollText },
    ] as const;

    const linkCls = (href: string) =>
        `rounded-lg px-3 py-2 text-sm ${pathname === href
            ? "bg-gray-900 text-white"
            : "text-gray-800 hover:bg-gray-100"
        }`;

    return (
        <>
            <AdminRealtime />
            <div className="min-h-screen bg-gray-100 text-[#333] pt-4">
                {/* Header */}
                <header className="sticky top-0 z-20 w-[80%] mx-auto rounded-lg bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                        {/* Left: status + name */}
                        <div className="flex items-center gap-3">
                            <WSStatus />
                            <span
                                className="hidden sm:inline-block max-w-[200px] truncate text-sm font-medium text-gray-900"
                                suppressHydrationWarning
                            >
                                {name ?? "Admin"}
                            </span>
                        </div>

                        {/* Desktop actions (clock + logout) */}
                        <div className="hidden md:flex items-center gap-3">
                            <Clock />
                            <Button onClick={handleLogout} style={{ width: "5rem" }}>
                                Logout
                            </Button>
                        </div>

                        {/* Burger for md- */}
                        <div className="md:hidden flex items-center gap-2">
                            <Clock />
                            <button
                                type="button"
                                aria-label="Open menu"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                                onClick={() => setMenuOpen(true)}
                            >
                                <Menu className="h-5 w-5 text-gray-800" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Layout: Sidebar (md+) + Content */}
                <div className="mx-auto max-w-[90vw] px-4 md:px-6">
                    <div className="md:grid md:grid-cols-[220px_1fr] md:gap-6">
                        {/* Sidebar (md and up) */}
                        <aside className="sticky top-[56px] hidden md:block self-start py-4">
                            <nav className="rounded-xl bg-white p-2 shadow-sm">
                                <ul className="space-y-1">
                                    {nav.map(({ href, label, Icon }) => (
                                        <li key={href}>
                                            <Link href={href} className={`${linkCls(href)} flex items-center gap-2`}>
                                                <Icon className="h-4 w-4" />
                                                <span className="truncate">{label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-3 border-t pt-3">
                                    <Button
                                        onClick={handleLogout}
                                        style={{ width: "100%" }}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </nav>
                        </aside>

                        {/* Main content */}
                        <main className="py-4 md:py-6">{children}</main>
                    </div>
                </div>

                {/* Mobile / tablet drawer */}
                {menuOpen && (
                    <div className="fixed inset-0 z-30 md:hidden">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setMenuOpen(false)}
                            aria-hidden
                        />
                        <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <WSStatus />
                                    <span
                                        className="max-w-[180px] truncate font-medium"
                                        suppressHydrationWarning
                                    >
                                        {name ?? "Admin"}
                                    </span>
                                </div>
                                <button
                                    aria-label="Close menu"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <nav className="grid gap-1 p-3">
                                {nav.map(({ href, label, Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${pathname === href
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-800 hover:bg-gray-100"
                                            }`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{label}</span>
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto border-t p-3">
                                <Button onClick={handleLogout} style={{ width: "100%" }}>
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
export default dynamic(() => Promise.resolve(AdminLayout), { ssr: false });
