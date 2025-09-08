import type { Ticket } from "@/types/api";
import { formatInCairo } from "@/utils/datetime";

type Props = {
    type: Ticket["type"];
    gateId: string;
    zoneId: string;
    checkInAt: string;
};

export default function TicketInfo({ type, gateId, zoneId, checkInAt }: Props) {
    return (
        <div className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium text-black">{type}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">Gate</span>
                <span className="font-medium text-black">{gateId}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">Zone</span>
                <span className="font-medium text-black">{zoneId}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">Check-in</span>
                <span className="font-medium text-black">{formatInCairo(checkInAt)}</span>
            </div>
        </div>
    );
}
