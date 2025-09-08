export function StatusIcon({ active, isError }: { active: boolean; isError: boolean }) {
    // not found (error) > inactive > active
    const state = isError ? "error" : active ? "active" : "inactive" as
        | "active"
        | "inactive"
        | "error";

    const cfg = {
        active: {
            title: "Subscription is Active",
            ring: "ring-emerald-200",
            bg: "bg-emerald-50",
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
        inactive: {
            title: "Subscription is Inactive",
            ring: "ring-amber-200",
            bg: "bg-amber-50",
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-600" aria-hidden="true">
                    <path d="M12 12v6m0-10h.01M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
        error: {
            title: "Subscription not found",
            ring: "ring-red-200",
            bg: "bg-red-50",
            icon: (
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-red-600" aria-hidden="true">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
    }[state];

    return (
        <div
            className={`flex h-9 w-24 items-center justify-center rounded-full ring-1 ${cfg.ring} ${cfg.bg}`}
            title={cfg.title}
            aria-label={cfg.title}
        >
            {cfg.icon}
        </div>
    );
}
