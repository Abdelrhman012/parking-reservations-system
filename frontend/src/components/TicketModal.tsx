"use client";
import { useCallback } from "react";
import { useApp } from "@/store/app";
import { formatInCairo } from "@/utils/datetime";
import QRCode from "react-qr-code";

export default function TicketModal() {
    const modal = useApp((s) => s.ticketModal);
    const setModal = useApp((s) => s.setTicketModal);

    const ticket = modal?.ticket;
    const subscriptionId = modal?.subscriptionId;
    const zoneState = modal?.zoneState;
    const handleDownloadPdf = useCallback(async () => {
        if (!modal) return;
        const { ticket } = modal;

        const { jsPDF } = await import("jspdf");

        const svg = document.querySelector<HTMLDivElement>("#ticket-print svg");
        let qrPngDataUrl: string | undefined;

        if (svg) {
            const svgStr = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = (e) => reject(e);
                img.src = url;
            });

            const canvas = document.createElement("canvas");
            canvas.width = img.width || 256;
            canvas.height = img.height || 256;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            qrPngDataUrl = canvas.toDataURL("image/png");
        }

        const pdf = new jsPDF({ unit: "mm", format: "a6", orientation: "portrait" });
        const pageW = pdf.internal.pageSize.getWidth();

        // Header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("Parking Ticket", pageW / 2, 10, { align: "center" });

        // QR 
        if (qrPngDataUrl) {
            const qrSize = 40; // mm
            const qrX = (pageW - qrSize) / 2;
            const qrY = 25;
            pdf.addImage(qrPngDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
        }

        // Details
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        let y = 80;
        const lines: Array<[string, string]> = [
            ["Ticket Id", ticket.id],
            ["User Type", ticket.type],
            ["Gate", ticket.gateId],
            ["Zone", ticket.zoneId],
            ["Check In At", formatInCairo(ticket.checkinAt)],

        ];

        lines.forEach(([k, v]) => {
            pdf.text(`${k}: ${v}`, 10, y);
            y += 6;
        });

        pdf.text("Thank you", pageW / 2, y + 30, { align: "center" });

        pdf.save(`ticket_${ticket.id}.pdf`);
    }, [modal]);


    if (!modal) return null; // early return AFTER hooks

    const qrPayload = {
        "Ticket Id": ticket!.id,
        "User Type": ticket!.type,
        ...(ticket!.type === "subscriber" && subscriptionId
            ? { "Subscription Id": subscriptionId }
            : {}),
        Gate: ticket!.gateId,
        Zone: ticket!.zoneId,
        "Check In At": formatInCairo(ticket!.checkinAt),
    };

    const qrValue = JSON.stringify(qrPayload);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                id="ticket-print"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
                <h3 className="mb-4 text-lg font-semibold text-gray-900 text-center">Ticket Created</h3>

                <div className="rounded-xl bg-white mb-5">
                    <div className="flex items-center justify-center">
                        <div className="rounded-lg bg-white p-2">
                            <QRCode
                                value={qrValue}
                                size={164}
                                style={{ height: "auto", width: "164px" }}
                                aria-label="Ticket QR"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <Row k="Ticket ID" v={ticket?.id || ""} />
                    <Row k="Type" v={ticket?.type || ""} />
                    {ticket?.type === "subscriber" && <Row k="Subscriber Id" v={subscriptionId || ""} />}
                    <Row k="Gate" v={ticket?.gateId || ""} />
                    <Row k="Zone" v={ticket?.zoneId || ""} />
                    <Row k="Check-in" v={formatInCairo(ticket?.checkinAt || "")} />
                </div>

                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                    Zone state updated: occupied {zoneState?.occupied}, free {zoneState?.free}
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                        className="cursor-pointer rounded-full border px-5 py-2 text-sm text-gray-900 hover:text-gray-800"
                        onClick={handleDownloadPdf}
                    >
                        Print
                    </button>
                    <button
                        className="w-full cursor-pointer rounded-full bg-gray-900 px-5 py-2 text-sm text-white hover:bg-gray-800"
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