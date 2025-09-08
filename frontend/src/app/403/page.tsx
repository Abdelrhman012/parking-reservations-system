"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";
import { toast } from "@/lib/toast";

export default function Forbidden() {
    const router = useRouter();

    function handleLoginDifferent() {
        clearSession();
        toast("Logged out successfully.", "success");
        router.replace("/login");
    }

    return (
        <main className="flex h-screen w-screen items-center justify-center bg-gray-900">
            <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center text-black shadow-sm">
                {/* Icon */}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-7 w-7 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M5 19L19 5" />
                    </svg>
                </div>

                <h1 className="mb-2 text-2xl font-semibold">Access Denied</h1>
                <p className="text-gray-600">
                    You don&apos;t have permission to access this page.
                </p>

                <div className="mt-6">
                    <button
                        onClick={handleLoginDifferent}
                        className="cursor-pointer rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                    >
                        Log in with a different account
                    </button>
                </div>
            </div>
        </main>
    );
}
