import { formatInCairo } from "@/utils/datetime";

export type BreakdownItem = {
    from: string;
    to: string;
    hours: number;
    rateMode: "normal" | "special";
    rate: number;
    amount: number;
};

type Props = {
    segments: BreakdownItem[];
    total: number;
    durationHours: number;
};

export default function BreakdownTable({ segments, total, durationHours }: Props) {
    return (
        <div className="rounded-lg border ">
            <div className="grid grid-cols-5 gap-2 border-b bg-gray-50 px-3 py-2 text-xs font-semibold">
                <div className="text-black">From</div>
                <div className="text-black">To</div>
                <div className="text-right text-black">Hours</div>
                <div className="text-right text-black">Rate</div>
                <div className="text-right text-black">Amount</div>
            </div>
            {segments.map((s, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 px-3 py-2 text-xs">
                    <div className="text-black">{formatInCairo(s.from)}</div>
                    <div className="text-black">{formatInCairo(s.to)}</div>
                    <div className="text-right text-black">{s.hours.toFixed(2)}</div>
                    <div className="text-right text-black">${s.rate.toFixed(2)}</div>
                    <div className="text-right text-black">${s.amount.toFixed(2)}</div>
                </div>
            ))}
            <div className="flex items-center justify-between border-t px-3 py-2 text-sm">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold text-black">{durationHours.toFixed(2)} h</span>
            </div>
            <div className="flex items-center justify-between border-t px-3 py-2 text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold text-black">${total.toFixed(2)}</span>
            </div>
        </div>
    );
}
