"use client";

import Cookies from "js-cookie";
import { useParkingState } from "@/services/queries/admin";
import type { Zone } from "@/types/api";

export default function AdminDashboard() {
    const token = Cookies.get("ps_token");
    const { data, isLoading, isError } = useParkingState(token);

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">Parking State</h1>

            {isLoading ? (
                <div className="text-gray-600">Loading…</div>
            ) : isError ? (
                <div className="text-red-600">Failed to load report.</div>
            ) : !data?.length ? (
                <div className="text-gray-600">No zones.</div>
            ) : (
                <div className="overflow-x-auto rounded-xl  bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-3 py-2">Zone</th>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2 text-right">Occupied</th>
                                <th className="px-3 py-2 text-right">Free</th>
                                <th className="px-3 py-2 text-right">Reserved</th>
                                <th className="px-3 py-2 text-right">Avail. Visitors</th>
                                <th className="px-3 py-2 text-right">Avail. Subscribers</th>
                                <th className="px-3 py-2">Open</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((z: Zone) => (
                                <tr key={z.zoneId} className="border-t">
                                    <td className="px-3 py-2">{z.name}</td>
                                    <td className="px-3 py-2">{z.categoryId}</td>
                                    <td className="px-3 py-2 text-right">{z.occupied}</td>
                                    <td className="px-3 py-2 text-right">{z.free}</td>
                                    <td className="px-3 py-2 text-right">{z.reserved}</td>
                                    <td className="px-3 py-2 text-right">{z.availableForVisitors}</td>
                                    <td className="px-3 py-2 text-right">{z.availableForSubscribers}</td>
                                    <td className="px-3 py-2">{z.open ? "Yes" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
