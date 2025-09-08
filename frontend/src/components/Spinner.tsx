"use client";

export default function Spinner({ size = 16 }: { size?: number }) {
    const px = `${size}px`;
    return (
        <span
            className="inline-block animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"
            style={{ width: px, height: px }}
            aria-label="Loading"
        />
    );
}
