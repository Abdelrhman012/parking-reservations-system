import { formatGateLabel } from "@/utils/format";
import { useGates } from "@/services/queries";
import Clock from "./Clock";
import WSStatus from "./WSStatus";

export default function GateHeader({ gateId }: { gateId: string }) {

    const { data: gates } = useGates();
    const gate = gates?.find((g) => g.id === gateId);
    const gateLocation = gate?.location ?? "—";

    return (
        <header className="flex items-center justify-between gap-4 rounded-xl border bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
                <WSStatus />

                <div>
                    <div className="text-lg font-semibold text-gray-900">{formatGateLabel(gateId)}</div>
                    <div className="text-sm  text-gray-400 ">{gateLocation}</div>
                </div>
            </div>
            <Clock />
        </header>
    );
}
