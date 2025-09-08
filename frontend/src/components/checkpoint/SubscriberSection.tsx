"use client";

import { useEffect, useRef } from "react";
import type { Subscription } from "@/types/api";
import { StatusIcon } from "../StatusIcon";
import Spinner from "../Spinner";

const MIN_LEN = 7;
const DEBOUNCE_MS = 300;

type Props = {
    visible: boolean;
    subIdInput: string;
    onChangeSubId: (v: string) => void;
    onVerify: () => void;            
    onClearVerified: () => void;     
    verifiedSubId: string;
    sub?: Subscription;
    subLoading: boolean;
    subError: boolean;
    forceConvertToVisitor: boolean;
    onToggleConvert: (v: boolean) => void;
};

export default function SubscriberSection({
    visible,
    subIdInput,
    onChangeSubId,
    onVerify,
    onClearVerified,        
    verifiedSubId,
    sub,
    subLoading,
    subError,
    forceConvertToVisitor,
    onToggleConvert,
}: Props) {
    const lastVerifiedRef = useRef<string>("");

    // Auto-verify when input reaches MIN_LEN (debounced)
    useEffect(() => {
        const v = subIdInput.trim();

        if (v.length < MIN_LEN) {
            // clear verified state so the Verify button shows again
            if (verifiedSubId) onClearVerified();
            lastVerifiedRef.current = "";
            return;
        }
        if (v === lastVerifiedRef.current) return;

        const t = window.setTimeout(() => {
            lastVerifiedRef.current = v;
            onVerify(); // parent should read subIdInput and set verifiedSubId
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(t);
    }, [subIdInput, verifiedSubId, onVerify, onClearVerified]);

    if (!visible) return null;

    const action =
        subLoading ? (
            <div className="flex h-9 w-24 items-center justify-center rounded-lg border bg-white">
                <Spinner size={16} />
            </div>
        ) : verifiedSubId ? (
            <StatusIcon active={!!sub?.active && !subError} isError={!!subError} />
        ) : (
            <button
                type="button"
                className="h-9 w-24 rounded-full bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={!subIdInput.trim()}
                onClick={onVerify}
            >
                Verify
            </button>
        );

    return (
        <div className="mt-4 space-y-3 rounded-lg border bg-gray-50 p-3">
            <div className="flex items-end gap-3">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Subscription ID
                    </label>
                    <input
                        value={subIdInput}
                        onChange={(e) => onChangeSubId(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === "Enter" && onVerify()}
                        placeholder="e.g., Sub-001"
                        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-primary-500"
                    />
                </div>

                {action}
            </div>

      

            <div className="mt-1 flex items-center gap-2">
                <input
                    id="convert"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={forceConvertToVisitor}
                    onChange={(e) => onToggleConvert(e.currentTarget.checked)}
                />
                <label htmlFor="convert" className="text-sm text-black">
                    Convert to Visitor (if plate mismatch)
                </label>
            </div>
        </div>
    );
}
