export function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label className={`inline-flex items-center ${disabled ? "opacity-60" : "cursor-pointer"}`}>
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className="relative h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-emerald-500">
                <span
                    className={`absolute ${checked ? "right-0.5" : "left-0.5"} top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4`}
                />
            </span>
        </label>
    );
}
