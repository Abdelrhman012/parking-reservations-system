// src/components/WsClient.tsx
"use client";
import { useEffect } from "react";
import { connectWS, disconnectWS } from "@/services/ws";
import { useApp } from "@/store/app";

export default function WsClient() {
    const setWs = useApp((s) => s.setWs);
    useEffect(() => {
        connectWS({
            open: () => setWs(true),
            close: () => setWs(false),
            error: () => setWs(false),
        });
        return () => disconnectWS();
    }, [setWs]);
    return null;
}
