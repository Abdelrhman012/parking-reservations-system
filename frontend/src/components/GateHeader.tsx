import { useEffect, useState } from "react";
import { useApp } from "@/store/app";

export default function GateHeader({ gateId }: { gateId: string }) {
    const wsConnected = useApp((s) => s.wsConnected);
    const [now, setNow] = useState<string>("");

    useEffect(() => {
        const t = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <header className="flex items-center justify-between gap-4 rounded-xl border bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white font-semibold">
                    G
                </span>
                <div>
                    <div className="text-sm text-gray-500">Gate</div>
                    <div className="text-lg font-semibold text-gray-900">#{gateId}</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{now}</span>
                <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${wsConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                >
                    <span
                        className={`h-2 w-2 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"
                            }`}
                    />
                    {wsConnected ? "WS Connected" : "WS Disconnected"}
                </span>
            </div>
        </header>
    );
}
