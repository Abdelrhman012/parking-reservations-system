"use client";

import { useMemo } from "react";
import Cookies from "js-cookie";
import { useParkingState } from "@/services/queries/admin";

type ParkingStateRow = {
    zoneId: string;
    name: string;
    totalSlots: number;
    occupied: number;
    free: number;
    reserved: number;
    availableForVisitors: number;
    availableForSubscribers: number;
    open: boolean;
    categoryId?: string;
};

function humanizeCategoryId(id?: string): string {
    if (!id) return "—";
    const cleaned = id.replace(/^cat[_-]?/i, "").replace(/[_-]+/g, " ");
    return cleaned
        .split(" ")
        .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(" ");
}

export default function AdminDashboard() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useParkingState(token);

    const rows = (data as unknown as ParkingStateRow[]) ?? [];

    const totals = useMemo(() => {
        if (!rows.length) {
            return {
                capacity: 0,
                occupied: 0,
                free: 0,
                reservedFree: 0,
                visitorsAvail: 0,
                subsAvail: 0,
                occRate: 0,
            };
        }
        const capacity = rows.reduce((s, r) => s + r.totalSlots, 0);
        const occupied = rows.reduce((s, r) => s + r.occupied, 0);
        const free = rows.reduce((s, r) => s + r.free, 0);
        const visitorsAvail = rows.reduce((s, r) => s + r.availableForVisitors, 0);
        const subsAvail = rows.reduce((s, r) => s + r.availableForSubscribers, 0);
        const reservedFree = Math.max(0, subsAvail - visitorsAvail);
        const occRate = capacity ? occupied / (occupied + free) : 0;
        return { capacity, occupied, free, reservedFree, visitorsAvail, subsAvail, occRate };
    }, [rows]);
    const openClosed = useMemo(() => {
        const open = rows.filter((r) => r.open).length;
        const closed = rows.length - open;
        const pct = rows.length ? open / rows.length : 0;
        return { open, closed, pct };
    }, [rows]);

    const topOccupied = useMemo(
        () => [...rows].sort((a, b) => b.occupied - a.occupied).slice(0, 6),
        [rows]
    );
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Parking State</h1>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load report.</div>
            ) : !rows.length ? (
                <div className="text-gray-600">No zones.</div>
            ) : (
                <>
                    {/* KPIs */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <KpiCard label="Capacity" value={totals.capacity} hint="Total slots" />
                        <KpiCard
                            label="Occupied"
                            value={totals.occupied}
                            hint={`${(totals.occRate * 100).toFixed(0)}% occupancy`}
                            tone="occupied"
                        />
                        <KpiCard label="Free" value={totals.free} hint="All free slots" tone="free" />
                        <KpiCard
                            label="Reserved (Free)"
                            value={totals.reservedFree}
                            hint="For subscribers only"
                            tone="reserved"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div>

                            <div className="rounded-xl h-fit bg-white p-5 shadow-sm mb-4">
                                <h3 className="mb-4 text-sm font-semibold text-gray-900">Overall Occupancy</h3>
                                <div className="flex items-center gap-6">
                                    <Donut
                                        size={140}
                                        thickness={18}
                                        percent={totals.occRate}
                                        trackClass="text-gray-200"
                                        fillClass="text-slate-600"
                                        label={`${(totals.occRate * 100).toFixed(0)}%`}
                                        subLabel="occupied"
                                    />
                                    <div className="grid gap-2 text-sm">
                                        <LegendItem color="bg-slate-600" label="Occupied" value={totals.occupied} />
                                        <LegendItem color="bg-emerald-400" label="Free (Visitors)" value={totals.visitorsAvail} />
                                        <LegendItem color="bg-amber-300" label="Reserved (Free)" value={totals.reservedFree} />
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl h-fit bg-white p-5 shadow-sm mb-4">
                                <h3 className="mb-4 text-sm font-semibold text-gray-900">Zones status</h3>
                                <div className="flex items-center gap-6">
                                    <Donut
                                        size={140}
                                        thickness={18}
                                        percent={openClosed.open / (openClosed.open + openClosed.closed)}
                                        trackClass="text-gray-200"
                                        fillClass="text-slate-600"
                                        label={`${(openClosed.open / (openClosed.open + openClosed.closed) * 100).toFixed(0)}%`}
                                        subLabel="open"
                                    />
                                    <div className="grid gap-2 text-sm">
                                        <LegendItem color="bg-slate-600" label="Open Zones" value={openClosed.open} />
                                        <LegendItem color="bg-emerald-400" label="Closed Zones" value={openClosed.closed} />
                                    </div>
                                </div>
                            </div>


                            {/* Top occupied zones */}
                            <div className="rounded-xl h-fit bg-white p-5 shadow-sm ">
                                <div className="mb-2 text-sm font-medium text-gray-900">Top occupied zones</div>
                                <ul className="space-y-4">
                                    {topOccupied.map((z) => {
                                        const total = Math.max(1, z.totalSlots);
                                        const pct = Math.min(100, (z.occupied / total) * 100);
                                        return (
                                            <li key={z.zoneId}>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="truncate text-gray-700">{z.name}</span>
                                                    <span className="tabular-nums text-gray-600">
                                                        <span className="text-black font-semibold text-sm">{z.occupied}</span>/{z.totalSlots}
                                                    </span>
                                                </div>
                                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                                    <div
                                                        className="h-full bg-slate-600"
                                                        style={{ width: `${pct}%` }}
                                                        aria-label="Occupied"
                                                    />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        <div className="rounded-xl  bg-white p-5 shadow-sm lg:col-span-2">
                            <h3 className="mb-4 text-sm font-semibold text-gray-900">Zones Utilization</h3>
                            <div className="space-y-3">
                                {rows.map((z) => {
                                    const total = Math.max(1, z.totalSlots);
                                    const occupiedPct = Math.min(100, (z.occupied / total) * 100);
                                    const reservedFree = Math.max(0, z.availableForSubscribers - z.availableForVisitors);
                                    const reservedPct = Math.min(100, (reservedFree / total) * 100);
                                    const visitorsPct = Math.min(100, (z.availableForVisitors / total) * 100);
                                    return (
                                        <div key={z.zoneId} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="truncate font-medium text-gray-900">
                                                    {z.name} <span className="ml-1 text-gray-500">({humanizeCategoryId(z.categoryId)})</span>
                                                </div>
                                                <div className="tabular-nums text-gray-600">
                                                    <span className="text-black font-semibold text-sm"> {z.occupied}</span>/{z.totalSlots}
                                                </div>
                                            </div>
                                            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className="h-full bg-slate-600"
                                                    style={{ width: `${occupiedPct}%` }}
                                                    aria-label="Occupied"
                                                />
                                                <div
                                                    className="h-full bg-amber-300"
                                                    style={{ width: `${reservedPct}%` }}
                                                    aria-label="Reserved free"
                                                />
                                                <div
                                                    className="h-full bg-emerald-400"
                                                    style={{ width: `${visitorsPct}%` }}
                                                    aria-label="Visitors free"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-gray-500">
                                                <span>Occupied</span>
                                                <span>Free </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl bg-white">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-3 py-2">Zone</th>
                                    <th className="px-3 py-2">Category</th>
                                    <th className="px-3 py-2 text-right">Occupied</th>
                                    <th className="px-3 py-2 text-right">Free</th>
                                    <th className="px-3 py-2 text-right">Reserved</th>
                                    <th className="px-3 py-2 text-right">Avail. Visitors</th>
                                    <th className="px-3 py-2 text-right">Avail. Subscribers</th>
                                    <th className="px-3 py-2">Open</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((z) => (
                                    <tr key={z.zoneId} className="-t">
                                        <td className="px-3 py-2">{z.name}</td>
                                        <td className="px-3 py-2">{humanizeCategoryId(z.categoryId)}</td>
                                        <td className="px-3 py-2 text-right">{z.occupied}</td>
                                        <td className="px-3 py-2 text-right">{z.free}</td>
                                        <td className="px-3 py-2 text-right">{z.reserved}</td>
                                        <td className="px-3 py-2 text-right">{z.availableForVisitors}</td>
                                        <td className="px-3 py-2 text-right">{z.availableForSubscribers}</td>
                                        <td className="px-3 py-2">{z.open ? "Yes" : "No"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

/* ---------- UI bits ---------- */

function KpiCard({
    label,
    value,
    hint,
    tone = "default",
}: {
    label: string;
    value: number | string;
    hint?: string;
    tone?: "default" | "occupied" | "free" | "reserved";
}) {
    const toneClasses =
        tone === "occupied"
            ? "bg-slate-600/10 text-slate-700"
            : tone === "free"
                ? "bg-emerald-500/10 text-emerald-700"
                : tone === "reserved"
                    ? "bg-amber-400/10 text-amber-700"
                    : "bg-gray-100 text-gray-700";
    return (
        <div className="rounded-xl  bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-gray-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{value}</div>
            {hint ? <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs ${toneClasses}`}>{hint}</div> : null}
        </div>
    );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded ${color}`} />
            <span className="text-gray-700">{label}</span>
            <span className="ml-auto tabular-nums text-gray-500">{value}</span>
        </div>
    );
}

function Donut({
    size = 120,
    thickness = 14,
    percent,
    trackClass = "text-gray-200",
    fillClass = "text-slate-600",
    label,
    subLabel
}: {
    size?: number;
    thickness?: number;
    percent: number; // 0..1
    trackClass?: string;
    fillClass?: string;
    label?: string;
    subLabel?: string;
}) {
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(1, percent));
    const filled = c * p;
    const gap = c - filled;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={thickness}
                    className={trackClass}
                    stroke="currentColor"
                    strokeDasharray={`${c}`}
                    strokeDashoffset={0}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={thickness}
                    className={fillClass}
                    stroke="currentColor"
                    strokeDasharray={`${filled} ${gap}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                    <div className="text-2xl font-semibold text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500">{subLabel}</div>
                </div>
            </div>
        </div>
    );
}
