"use client";

import type { Subscription } from "@/types/api";
import { formatInCairo } from "@/utils/datetime";
import CarFront from "../CarFront";

type SubscriptionWithCategories = Subscription & {
    categories?: string[];
};

type Props = {
    sub: SubscriptionWithCategories;
    categoryLabels?: Record<string, string>; // optional: map id -> human label
};

function Pill({
    children,
    className = "",
    title,
}: {
    children: React.ReactNode;
    className?: string;
    title?: string;
}) {
    return (
        <span
            title={title}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
        >
            {children}
        </span>
    );
}

export default function SubscriberDetails({ sub, categoryLabels }: Props) {
    const isActive = !!sub.active;

    const mainCategoryLabel =
        (categoryLabels && categoryLabels[sub.category]) ?? sub.category;

    const extraCategories =
        sub.categories?.filter((c) => c !== sub.category) ?? [];

    return (
        <section className="w-full max-w-3xl rounded-xl  bg-white p-5 ">
            {/* Header */}
            <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {sub.userName || "Subscriber"}
                    </h2>
                    <div className="mt-1 text-sm text-gray-600">ID: {sub.id}</div>
                </div>

                <div className="flex items-center gap-2">
                    <Pill
                        className={
                            isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                        }
                        title={isActive ? "Active subscription" : "Inactive subscription"}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </Pill>

                    <Pill className="bg-gray-100 text-gray-800" title="Primary category">
                        {mainCategoryLabel}
                    </Pill>
                </div>
            </header>

            {/* Period */}
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Starts at</div>
                    <div className="text-sm font-medium text-gray-900">
                        {formatInCairo(sub.startsAt)}
                    </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                    <div className="text-xs text-gray-500">Expires at</div>
                    <div className="text-sm font-medium text-gray-900">
                        {formatInCairo(sub.expiresAt)}
                    </div>
                </div>
            </div>

            {/* Extra categories (if any) */}
            {extraCategories.length > 0 ? (
                <div className="mb-4">
                    <div className="mb-1 text-sm font-semibold text-gray-900">
                        Allowed categories
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {extraCategories.map((c) => (
                            <Pill key={c} className="bg-gray-100 text-gray-800">
                                {(categoryLabels && categoryLabels[c]) ?? c}
                            </Pill>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Cars */}
            <div className="mb-4">
                <div className="mb-2 text-sm font-semibold text-gray-900">
                    Cars ({sub.cars.length})
                </div>
                {sub.cars.length ? (
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {sub.cars.map((c, i) => (
                            <li
                                key={`${c.plate}-${i}`}
                                className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{c.plate}</div>
                                        <div className="mt-0.5 text-xs text-gray-600 truncate">
                                            {[c.brand, c.model].filter(Boolean).join(" • ") || "—"}
                                        </div>
                                        {c.color ? (
                                            <div className="mt-1 text-xs text-gray-500">Color: {c.color}</div>
                                        ) : null}
                                    </div>
                                    <CarFront title={`${c.color} Car`} color={c.color ?? "white"} width={100} />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
                        No cars registered.
                    </div>
                )}
            </div>

            {/* Current check-ins */}
            <div>
                <div className="mb-2 text-sm font-semibold text-gray-900">
                    Current check-ins ({sub.currentCheckins.length})
                </div>
                {sub.currentCheckins.length ? (
                    <div className="overflow-hidden rounded-lg border">
                        <div className="grid grid-cols-3 gap-2 border-b bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">
                            <div>Ticket</div>
                            <div>Zone</div>
                            <div className="text-right">Check-in</div>
                        </div>
                        {sub.currentCheckins.map((c) => (
                            <div
                                key={c.ticketId}
                                className="grid grid-cols-3 gap-2 px-3 py-2 text-sm"
                            >
                                <div className="truncate text-black">{c.ticketId}</div>
                                <div className="truncate text-black">{c.zoneId}</div>
                                <div className="text-right text-black">{formatInCairo(c.checkinAt)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
                        No active check-ins.
                    </div>
                )}
            </div>
        </section>
    );
}
