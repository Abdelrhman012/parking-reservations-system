export default function ZoneCardSkeleton() {
    return (
        <div className="rounded-[22px] bg-gray-100 p-2">
            <div className="rounded-[18px] bg-white p-4 shadow-sm animate-pulse">
                {/* top bar */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-20 rounded-r-full bg-gray-200" />
                        <div className="h-6 w-24 rounded-full bg-gray-200" />
                    </div>
                    <div className="h-4 w-16 rounded bg-gray-200" />
                </div>

                {/* main row */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <div className="mb-1 h-3 w-20 rounded bg-gray-200" />
                        <div className="flex items-end gap-1">
                            <div className="h-12 w-14 rounded bg-gray-200" />
                            <div className="h-5 w-10 rounded bg-gray-200" />
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="mb-2 h-3 w-16 rounded bg-gray-200" />
                        <div className="ml-auto h-6 w-20 rounded bg-gray-200" />
                    </div>
                </div>

                {/* mini stats */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="h-12 rounded-xl bg-gray-100" />
                    <div className="h-12 rounded-xl bg-gray-100" />
                    <div className="h-12 rounded-xl bg-gray-100" />
                </div>

                {/* button */}
                <div className="h-10 w-full rounded-full bg-gray-200" />
            </div>
        </div>
    );
}
