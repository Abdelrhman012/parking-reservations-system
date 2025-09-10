export function IconButton({
    children,
    title,
    onClick,
    disabled,
    danger,
}: {
    children: React.ReactNode;
    title?: string;
    onClick?: () => void;
    disabled?: boolean;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-full p-2 hover:bg-gray-100 disabled:opacity-50 ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                }`}
        >
            {children}
        </button>
    );
}
