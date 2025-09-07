import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { formatGateLabel } from "@/utils/format";

export default function GateHeader({ gateId }: { gateId: string }) {
    const wsConnected = useApp((s) => s.wsConnected);
    const [now, setNow] = useState<string>("");

    useEffect(() => {
        const t = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <header className="flex items-center justify-between gap-4 rounded-xl border bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
            <div
                className="relative group inline-flex h-6 w-6 items-center justify-center"
                aria-label="WebSocket status"
            >
                {/* pulsing dot */}
                <span className="relative inline-flex h-3 w-3">
                    <span
                        className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${wsConnected ? "bg-emerald-400" : "bg-red-400"
                            }`}
                    />
                    <span
                        className={`relative inline-flex h-3 w-3 rounded-full ${wsConnected ? "bg-emerald-600" : "bg-red-600"
                            }`}
                    />
                </span>

                {/* tooltip */}
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                    {wsConnected ? "WS Connected" : "WS Disconnected"}
                </span>
            </div>
            <div className="flex items-center gap-3">

                <div>
                    <div className="text-lg font-semibold text-gray-900">{formatGateLabel(gateId)}</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{now}</span>
        

            </div>
        </header>
    );
}
