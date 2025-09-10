import React from 'react'
import { X } from "lucide-react";

export function Modal({
    title,
    onClose,
    children,
}: {
    title?: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

