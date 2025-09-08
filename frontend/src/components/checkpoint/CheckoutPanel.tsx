"use client";

import { useEffect, useMemo, useState } from "react";
import { useTicket, useCheckout } from "@/services/queries/tickets";
import { useSubscription } from "@/services/queries/subscriptions";
import { useQueryClient } from "@tanstack/react-query";
import type { Zone, Ticket } from "@/types/api";
import { toast } from "@/lib/toast";
import { useApp } from "@/store/app";

import FetchTicketForm from "@/components/checkpoint/FetchTicketForm";
import TicketInfo from "@/components/checkpoint/TicketInfo";
import SubscriberSection from "@/components/checkpoint/SubscriberSection";
import BreakdownTable from "@/components/checkpoint/BreakdownTable";
import Button from "../Button";

export default function CheckoutPanel() {
    const qc = useQueryClient();
    const setTicketModal = useApp((s) => s.setTicketModal);

    // Ticket input
    const [input, setInput] = useState<string>("");
    const ticketId = useMemo(() => input.trim() || undefined, [input]);

    const { data: ticket, isFetching: isFetchingTicket, refetch } = useTicket(ticketId);

    // Subscription input/verify
    const [subIdInput, setSubIdInput] = useState<string>("");
    const [verifiedSubId, setVerifiedSubId] = useState<string>("");

    const [pendingVerifyId, setPendingVerifyId] = useState<string>("");

    const { data: sub, isFetching: subLoading, isError: subError } = useSubscription(verifiedSubId);

    const checkout = useCheckout();
    const [forceConvertToVisitor, setForce] = useState<boolean>(false);

    async function doFetchTicket() {
        if (!ticketId) return;
        const res = await refetch();
        if (res.error) {
            const msg = res.error instanceof Error ? res.error.message : "Failed to fetch ticket";
            toast(msg, "error");
            return;
        }
        if (res.data) {
            toast(`Ticket ${res.data.id} loaded.`, "success");
        }
    }


    useEffect(() => {
        if (!pendingVerifyId) return;             
        if (subLoading) return;                   
        if (verifiedSubId !== pendingVerifyId) return; 

        if (subError) {
            toast("Subscription not found.", "error");
            setPendingVerifyId("");
            return;
        }
        if (sub) {
            toast(
                sub.active
                    ? `Subscription ${sub.id} is Active.`
                    : `Subscription ${sub.id} is Inactive.`,
                sub.active ? "success" : "info"
            );
            setPendingVerifyId("");
        }
    }, [pendingVerifyId, verifiedSubId, subLoading, subError, sub]);

    function onCheckout() {
        if (!ticketId) return;
        checkout.mutate(
            { ticketId, forceConvertToVisitor: forceConvertToVisitor || undefined },
            {
                onSuccess: (res) => {
                    // update zones cache
                    const zonesKeyGate = ticket?.gateId ?? "";
                    qc.setQueryData<Zone[]>(["zones", zonesKeyGate], (prev) =>
                        prev?.map((z) => (z.id === res.zoneState.id ? res.zoneState : z)) ?? prev
                    );

                    // show summary modal
                    const checkInAt =
                        (ticket as unknown as { checkinAt?: string })?.checkinAt ??
                        (ticket as unknown as { createdAt?: string })?.createdAt ??
                        new Date().toISOString();

                    setTicketModal({
                        ticket: {
                            id: ticketId as string,
                            type: (ticket?.type ?? "visitor") as Ticket["type"],
                            zoneId: res.zoneState.id,
                            gateId: zonesKeyGate,
                            checkinAt: checkInAt,
                        },
                        zoneState: res.zoneState,
                    });

                    toast("Checked out successfully.", "success");
                },
                onError: (e: Error) => {
                    toast(e.message || "Checkout failed", "error");
                },
            }
        );
    }

    const isSubscriberTicket = ticket?.type === "subscriber";

    // derive checkInAt robustly (API variations)
    const checkInAt =
        (ticket as unknown as { checkinAt?: string })?.checkinAt ??
        (ticket as unknown as { createdAt?: string })?.createdAt ??
        "";

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
            <div className="space-y-6 rounded-xl border bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-black">Check-out</h2>

                <FetchTicketForm
                    value={input}
                    onChange={setInput}
                    loading={isFetchingTicket}
                    disabled={!ticketId}
                    onFetch={doFetchTicket}
                />

                {ticket ? (
                    <TicketInfo type={ticket.type} gateId={ticket.gateId} zoneId={ticket.zoneId} checkInAt={checkInAt} />
                ) : null}

                <SubscriberSection
                    visible={isSubscriberTicket}
                    subIdInput={subIdInput}
                    onChangeSubId={setSubIdInput}
                    onVerify={() => setVerifiedSubId(subIdInput.trim())}
                    onClearVerified={() => setVerifiedSubId("")} // NEW
                    verifiedSubId={verifiedSubId}
                    sub={sub}
                    subLoading={subLoading}
                    subError={subError}
                    forceConvertToVisitor={forceConvertToVisitor}
                    onToggleConvert={setForce}
                />

                <div className="mt-4 flex justify-end">
                    <Button disabled={!ticketId || checkout.isPending} onClick={onCheckout}>
                        {checkout.isPending ? "Checking out…" : "Checkout"}
                    </Button>
                </div>

                {checkout.data ? (
                    <div className="mt-6">
                        <BreakdownTable
                            segments={checkout.data.breakdown}
                            total={checkout.data.amount}
                            durationHours={checkout.data.durationHours}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
