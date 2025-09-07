import { useApp } from "@/store/app";

export default function TicketModal() {
    const modal = useApp((s) => s.ticketModal);
    const setModal = useApp((s) => s.setTicketModal);

    if (!modal) return null;

    const { ticket, zoneState } = modal;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Ticket Created</h3>

                <div className="space-y-2 text-sm">
                    <Row k="Ticket ID" v={ticket.id} />
                    <Row k="Type" v={ticket.type} />
                    <Row k="Gate" v={ticket.gateId} />
                    <Row k="Zone" v={ticket.zoneId} />
                    <Row k="Check-in" v={new Date(ticket.checkinAt).toLocaleString()} />
                </div>

                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                    Zone state updated: occupied {zoneState.occupied}, free {zoneState.free}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        className="rounded-lg border px-3 py-2 text-sm"
                        onClick={() => window.print()}
                    >
                        Print
                    </button>
                    <button
                        className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
                        onClick={() => setModal(null)}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({ k, v }: { k: string; v: string | number }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-500">{k}</span>
            <span className="font-medium text-gray-900">{v}</span>
        </div>
    );
}
