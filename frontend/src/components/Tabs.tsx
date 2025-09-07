// src/components/Tabs.tsx
type Tab = { key: "visitor" | "subscriber"; label: string };

const TABS: Tab[] = [
    { key: "visitor", label: "Visitor" },
    { key: "subscriber", label: "Subscriber" },
];

export default function Tabs({
    active,
    onChange,
}: {
    active: "visitor" | "subscriber";
    onChange: (k: "visitor" | "subscriber") => void;
}) {
    return (
        <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
            {TABS.map((t) => {
                const isActive = t.key === active;
                return (
                    <button
                        key={t.key}
                        type="button"
                        className={`rounded-md px-4 py-2 text-sm font-medium transition ${isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                        onClick={() => onChange(t.key)}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
