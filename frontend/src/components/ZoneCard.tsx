// src/components/ZoneCard.tsx
import { CATEGORY_COLORS, CATEGORY_LABELS, CategoryId } from "@/constants/categories";
import type { Zone as ApiZone } from "@/types/api";

type Zone = ApiZone & { specialActive?: boolean };

type Props = {
    zone: Zone;
    onCheckin?: (zoneId: string) => void;
    disabled?: boolean;
};

export default function ZoneCard({
    zone,
    onCheckin,
    disabled,
}: Props) {
    const isOpen = zone.open;
    const isRush = zone.specialActive === true;
    const total = zone.totalSlots;
    const available = zone.availableForVisitors;
    const price = isRush && zone.rateSpecial ? zone.rateSpecial : zone.rateNormal;

    const pillBg =
        CATEGORY_COLORS[(zone.categoryId as CategoryId)] ?? "bg-gray-900";; 
    const unavailable = disabled || !isOpen || zone.availableForVisitors <= 0;

    return (
        <div className="rounded-[18px]">
            <div className="rounded-[18px] bg-white p-4 shadow-sm">
                {/* top bar */}
                <div className="mb-4 flex items-center justify-between">
                    <div className={`ml-[-16px] flex items-center justify-between w-[80%] rounded-r-full ${pillBg}`}>
                        <div className={`rounded-full px-3 py-1 text-[14px] font-bold text-white`}>
                            {zone.name}
                        </div>
                        <div className={`rounded-r-full px-3 py-1 text-[10px] font-light uppercase tracking-wide text-white`}>
                            {CATEGORY_LABELS[zone.categoryId as CategoryId]}
                        </div>
                    </div>
                    <div className={`text-xs font-semibold uppercase ${isOpen ? "text-emerald-600" : "text-red-500"}`}>
                        {isOpen ? "OPEN" : "CLOSED"}
                    </div>
                </div>

                {/* main row */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <div className="text-xs font-semibold tracking-wide text-gray-500">AVAILABLE</div>
                        <div className="flex items-end gap-1">
                            <span className="text-5xl font-extrabold leading-none text-emerald-600">
                                {available}
                            </span>
                            <span className="pb-1 text-lg font-medium text-gray-400">/{total}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        {isRush ? (
                            <div className="mb-1 flex items-center justify-end gap-1 text-[10px] font-semibold text-amber-600">
                                <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
                                    <path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Rush hours
                            </div>
                        ) : (
                            <div className="h-[14px]" />
                        )}
                        <div className="text-xl font-bold text-gray-900">
                            ${price}
                            <span className="text-sm font-medium text-gray-500"> /h</span>
                        </div>
                    </div>
                </div>

                {/* secondary stats */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                    <Mini label="Occupied" value={zone.occupied} />
                    <Mini label="Reserved" value={zone.reserved} />
                    <Mini label="Avail. Subs" value={zone.availableForSubscribers} />
                </div>

                {/* action */}
                <button
                    className={`w-full rounded-full px-5 py-3 text-sm font-semibold tracking-wide ${unavailable ? "cursor-not-allowed bg-gray-300 text-gray-500" : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                    disabled={unavailable}
                    onClick={() => onCheckin?.(zone.id)}
                >
                    CHECK IN
                </button>
            </div>
        </div>
    );
}

function Mini({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl bg-gray-100 px-3 py-2 text-center">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-lg font-semibold text-gray-900">{value}</div>
        </div>
    );
}
