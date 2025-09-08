import { useApp } from '@/store/app';
import React from 'react'

const WSStatus = () => {
    const wsConnected = useApp((s) => s.wsConnected);

    return (
        <div
            className="relative group inline-flex h-6 w-6 items-center justify-center"
            aria-label="WebSocket status"
        >
            {/* pulsing dot */}
            <span className="relative inline-flex h-3 w-3">
                <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${wsConnected ? "bg-emerald-400" : "bg-red-400"
                        }`}
                />
                <span
                    className={`relative inline-flex h-3 w-3 rounded-full ${wsConnected ? "bg-emerald-600" : "bg-red-600"
                        }`}
                />
            </span>

            {/* tooltip */}
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                {wsConnected ? "WS Connected" : "WS Disconnected"}
            </span>
        </div>
    )
}

export default WSStatus