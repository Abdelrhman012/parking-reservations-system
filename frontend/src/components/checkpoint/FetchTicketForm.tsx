import Button from "@/components/Button";

type Props = {
    value: string;
    onChange: (v: string) => void;
    loading: boolean;
    disabled: boolean;
    onFetch: (id: string ) => void;
};

export default function FetchTicketForm({ value, onChange, loading, disabled, onFetch }: Props) {
    return (
        <div className="flex gap-3">
            <input
                className="w-full rounded-full text-black bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Paste/scan Ticket ID"
                value={value}
                onChange={(e) => onChange(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && !disabled && onFetch(value)}
            />
            <Button className="px-5" onClick={() => onFetch(value)} disabled={disabled || loading}>
                {loading ? "Fetching…" : "Fetch"}
            </Button>
        </div>
    );
}
