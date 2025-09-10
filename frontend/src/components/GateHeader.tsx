"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatGateLabel } from "@/utils/format";
import { useGates } from "@/services/queries";
import Clock from "./Clock";
import WSStatus from "./WSStatus";
import Button from "./Button";

export default function GateHeader({ gateId }: { gateId: string }) {
    const router = useRouter();
    const { data: gates } = useGates();

    const gate = gates?.find((g) => g.id === gateId);
    const gateLocation = gate?.location ?? "—";
    const gateName = gate?.name ?? "—";

    const goLogin = useCallback(() => {
        router.push("/login");
    }, [router]);

    return (
        <header className="flex items-center justify-between gap-4 rounded-xl border bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
                <WSStatus />
                <div>
                    <div className="text-lg font-semibold text-gray-900">{gateName}</div>
                    <div className="text-sm text-gray-400">
                        {formatGateLabel(gateId)} - {gateLocation}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Clock />
                <Button onClick={goLogin} style={{ width: "5rem" }}>
                    Login
                </Button>
            </div>
        </header>
    );
}
