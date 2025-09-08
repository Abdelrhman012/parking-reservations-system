// src/components/CheckoutPanel.tsx
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
import Spinner from "@/components/Spinner";
import CheckoutHeader from "@/components/checkpoint/CheckoutHeader";
import Button from "@/components/Button";
import SubscriberDetails from "@/components/checkpoint/SubscriberDetails";


export default function CheckoutPanel() {
    const qc = useQueryClient();
    const setTicketModal = useApp((s) => s.setTicketModal);

    const [input, setInput] = useState<string>("");

    const [verifiedInput, setVerifiedInput] = useState<string>("");
    const ticketIdForQuery = useMemo(
        () => verifiedInput.trim() || undefined,
        [verifiedInput]
    );

    const {
        data: ticket,
        isFetching: isFetchingTicket,
        isError: isTicketError,
        error: ticketError,
        refetch: refetchTicket,
        isSuccess: isTicketSuccess,
    } = useTicket(ticketIdForQuery);

    // Subscription verify state
    const [subIdInput, setSubIdInput] = useState<string>("");
    const [verifiedSubId, setVerifiedSubId] = useState<string>("");
    const [pendingVerifyId, setPendingVerifyId] = useState<string>("");

    const {
        data: sub,
        isFetching: subLoading,
        isError: subError,
    } = useSubscription(verifiedSubId);

    const checkout = useCheckout();
    const [forceConvertToVisitor, setForce] = useState<boolean>(false);

    // --------------------------------
    // Fetch ticket on demand 
    // --------------------------------
    function doFetchTicket(id: string) {
        const trimmed = id.trim();
        if (!trimmed) return;

        if (ticketIdForQuery === trimmed) {
            refetchTicket();
        } else {
            setVerifiedInput(trimmed); 
        }
    }


    useEffect(() => {
        if (!ticketIdForQuery) return;
        if (isFetchingTicket) return;

        if (isTicketError) {
            const msg =
                ticketError instanceof Error
                    ? ticketError.message
                    : "Failed to fetch ticket";
            toast(msg, "error");
            return;
        }
        if (isTicketSuccess && ticket) {
            toast(`Ticket ${ticket.id} loaded.`, "success");
        }
    }, [
        ticketIdForQuery,
        isFetchingTicket,
        isTicketError,
        isTicketSuccess,
        ticket,
        ticketError,
    ]);

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


    useEffect(() => {
        checkout.reset();
        if (verifiedInput) setVerifiedInput("");
        if (subIdInput || verifiedSubId || pendingVerifyId) {
            setSubIdInput("");
            setVerifiedSubId("");
            setPendingVerifyId("");
        }
    }, [input]);

    function onCheckout() {
        const idForCheckout = input.trim();
        if (!idForCheckout) return;

        checkout.mutate(
            { ticketId: idForCheckout, forceConvertToVisitor: forceConvertToVisitor || undefined },
            {
                onSuccess: (res) => {
                    // update zones cache
                    const zonesKeyGate = ticket?.gateId ?? "";
                    qc.setQueryData<Zone[]>(["zones", zonesKeyGate], (prev) =>
                        prev?.map((z) => (z.id === res.zoneState.id ? res.zoneState : z)) ?? prev
                    );

                    // derive check-in time robustly
                    const checkInAt =
                        (ticket as unknown as { checkinAt?: string })?.checkinAt ??
                        (ticket as unknown as { createdAt?: string })?.createdAt ??
                        new Date().toISOString();

                    setTicketModal({
                        ticket: {
                            id: idForCheckout,
                            type: ticket?.type as Ticket["type"],
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
    const showSubscriberDetails =
        !!verifiedSubId && !subLoading && !subError && !!sub;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
                <CheckoutHeader className="mx-auto w-[90%]" />

                <div className="flex items-center justify-center">
                    <div className="mx-auto w-[90%] p-4">
                        <div className={sub ? "grid gap-6 lg:grid-cols-2" : "mx-auto max-w-[30rem]"}>
                            {/* LEFT: Checkout card */}
                            <div className="space-y-6 rounded-xl border bg-white p-4 shadow-sm">
                                <h2 className="mb-3 text-lg font-semibold text-black">Check-out</h2>

                                <FetchTicketForm
                                    value={input}
                                    onChange={setInput}
                                    loading={isFetchingTicket}
                                    disabled={!input.trim()}
                                    onFetch={doFetchTicket}
                                />

                                {ticket ? (
                                    <TicketInfo
                                        type={ticket.type}
                                        gateId={ticket.gateId}
                                        zoneId={ticket.zoneId}
                                        checkInAt={
                                            (ticket as unknown as { checkinAt?: string })?.checkinAt ??
                                            (ticket as unknown as { createdAt?: string })?.createdAt ??
                                            ""
                                        }
                                    />
                                ) : null}

                                <SubscriberSection
                                    visible={isSubscriberTicket}
                                    subIdInput={subIdInput}
                                    onChangeSubId={setSubIdInput}
                                    onVerify={() => {
                                        const v = subIdInput.trim();
                                        if (!v) return;
                                        setVerifiedSubId(v);
                                        setPendingVerifyId(v);
                                    }}
                                    onClearVerified={() => setVerifiedSubId("")}
                                    verifiedSubId={verifiedSubId}
                                    sub={sub}
                                    subLoading={subLoading}
                                    subError={subError}
                                    forceConvertToVisitor={forceConvertToVisitor}
                                    onToggleConvert={setForce}
                                />

                                <div className="mt-4 flex justify-end">
                                    <Button
                                        disabled={!input.trim() || checkout.isPending}
                                        onClick={onCheckout}
                                    >
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

                            {/* RIGHT: Subscriber details card */}
                            {sub && (
                                <div className="rounded-xl border bg-white p-4 shadow-sm">
                                    <h3 className="mb-3 text-base font-semibold text-gray-900">
                                        Subscriber details
                                    </h3>

                                    {!verifiedSubId ? (
                                        <p className="text-sm text-gray-600">
                                            Verify a subscriber ID from the left panel to see details here.
                                        </p>
                                    ) : subLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Spinner size={16} />
                                            Loading subscriber…
                                        </div>
                                    ) : subError ? (
                                        <p className="text-sm text-red-600">Subscription not found.</p>
                                    ) : showSubscriberDetails && sub ? (
                                        <SubscriberDetails sub={sub} />
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
