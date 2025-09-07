"use client";
import { JSX, useEffect, useRef, useState } from "react";
import { onToast, type ToastItem as ToastData } from "@/lib/toast";

type Status = "success" | "error" | "info";

const STATUS_ICON: Record<Status, JSX.Element> = {
    success: (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path d="M12 12v6m0-10h.01M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

const STATUS_COLOR: Record<Status, string> = {
    success: "text-emerald-600",
    error: "text-red-600",
    info: "text-sky-600",
};
const BAR_COLOR: Record<Status, string> = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-sky-600",
};

type ToastItem = ToastData & { duration?: number };

function ToastCard({
    item,
    onClose,
}: {
    item: ToastItem;
    onClose: (id: number) => void;
}) {
    const status = (item.type ?? "info") as Status;
    const duration = item.duration ?? 3500; // ms

    const [mounted, setMounted] = useState(false);
    const [closing, setClosing] = useState(false);
    const [paused, setPaused] = useState(false);
    const [remaining, setRemaining] = useState(duration); // ms

    // “deadline” for auto close = now + duration (will shift on hover)
    const closeAtRef = useRef<number>(Date.now() + duration);
    const pauseStartRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    // animate in
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 10);
        return () => clearTimeout(t);
    }, []);

    // countdown using a single interval; freeze on hover; extend deadline when leaving
    useEffect(() => {
        const STEP = 50; // ms
        intervalRef.current = window.setInterval(() => {
            if (paused || closing) return;
            const now = Date.now();
            const rem = Math.max(0, closeAtRef.current - now);
            setRemaining(rem);
            if (rem === 0) {
                setClosing(true);
                // small exit animation
                setTimeout(() => onClose(item.id), 150);
            }
        }, STEP);

        return () => {
            if (intervalRef.current != null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [paused, closing, item.id, onClose]);

    const handleMouseEnter = () => {
        if (paused) return;
        setPaused(true);
        pauseStartRef.current = Date.now();
    };

    const handleMouseLeave = () => {
        if (!paused) return;
        setPaused(false);
        const now = Date.now();
        const pausedDelta = pauseStartRef.current ? now - pauseStartRef.current : 0;
        // push the deadline forward by how long we hovered
        closeAtRef.current += pausedDelta;
        pauseStartRef.current = null;
    };

    // progress should DECREASE 100 → 0
    const widthPct = Math.max(0, Math.min(100, (remaining / duration) * 100));

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={[
                "pointer-events-auto w-[320px] overflow-hidden rounded-xl  bg-white text-gray-900 shadow-lg transition-all",
                mounted && !closing ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            ].join(" ")}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center gap-3 p-3">
                <div className={`${STATUS_COLOR[status]} mt-0.5`}>{STATUS_ICON[status]}</div>
                <div className="flex-1 text-sm">{item.message}</div>
                <button
                    aria-label="Close"
                    onClick={() => {
                        setClosing(true);
                        setTimeout(() => onClose(item.id), 150);
                    }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                        <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* progress bar (100 → 0) */}
            <div className="h-1 w-full bg-gray-100">
                <div
                    className={`h-1 ${BAR_COLOR[status]} transition-[width] duration-100`}
                    style={{ width: `${widthPct}%` }}
                />
            </div>
        </div>
    );
}

export default function Toaster() {
    const [items, setItems] = useState<ToastItem[]>([]);

    useEffect(() => {
        // No auto-dismiss setTimeout here; the card controls its own lifecycle.
        return onToast((t) => {
            setItems((prev) => [...prev, { ...t, duration: 5000 }]);
        });
    }, []);

    const close = (id: number) => {
        setItems((prev) => prev.filter((x) => x.id !== id));
    };

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2">
            {items.map((t) => (
                <ToastCard key={t.id} item={t} onClose={close} />
            ))}
        </div>
    );
}
