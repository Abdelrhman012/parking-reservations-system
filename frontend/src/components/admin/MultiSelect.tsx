"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {  Check, X } from "lucide-react";

export type MultiOption = { value: string; label: string; desc?: string };

export function MultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select…",
    disabled,
    searchable = true,
    maxChips = 2,
    className = "",
}: {
    options: MultiOption[];
    value: string[];
    onChange: (vals: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    searchable?: boolean;
    maxChips?: number;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const selected = useMemo(
        () => options.filter((o) => value.includes(o.value)),
        [options, value]
    );

    const filtered = useMemo(() => {
        if (!q.trim()) return options;
        const s = q.toLowerCase();
        return options.filter(
            (o) => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s)
        );
    }, [options, q]);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    function toggle(v: string) {
        if (value.includes(v)) onChange(value.filter((x) => x !== v));
        else onChange([...value, v]);
    }

    function clearAll() {
        onChange([]);
    }

    const chips = selected.slice(0, maxChips);
    const more = selected.length - chips.length;

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((s) => !s)}
                className={`w-full rounded-full bg-gray-100 px-3 py-2 text-left text-sm outline-none ring-0 transition
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-200"} `}
            >
                {selected.length === 0 ? (
                    <span className="text-gray-500">{placeholder}</span>
                ) : (
                    <span className="flex flex-wrap items-center gap-1.5">
                        {chips.map((c) => (
                            <span
                                key={c.value}
                                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-gray-800 shadow-sm"
                            >
                                {c.label}
                                <X
                                    className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggle(c.value);
                                    }}
                                />
                            </span>
                        ))}
                        {more > 0 && (
                            <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs text-gray-700 shadow-sm">
                                +{more}
                            </span>
                        )}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute z-50 mt-2 w-[min(28rem,90vw)] rounded-xl border bg-white p-2 shadow-xl"
                    role="listbox"
                >
                    {searchable && (
                        <div className="mb-2">
                            <input
                                autoFocus
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search…"
                                className="w-full rounded-full bg-gray-100 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    )}

                    <div className="max-h-72 overflow-auto">
                        {filtered.length === 0 ? (
                            <div className="px-2 py-6 text-center text-sm text-gray-500">No options</div>
                        ) : (
                            <ul className="space-y-1">
                                {filtered.map((opt) => {
                                    const checked = value.includes(opt.value);
                                    return (
                                        <li key={opt.value}>
                                            <button
                                                type="button"
                                                onClick={() => toggle(opt.value)}
                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 ${checked ? "bg-gray-50" : ""
                                                    }`}
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">{opt.label}</div>
                                                    {opt.desc ? (
                                                        <div className="text-xs text-gray-500">{opt.desc}</div>
                                                    ) : null}
                                                </div>
                                                {checked ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={clearAll}
                            className="rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
