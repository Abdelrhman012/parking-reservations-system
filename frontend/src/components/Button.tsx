import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
    children,
    disabled = false,
    className,
    type = "button",
    ...rest
}) => {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`w-[50%] mx-auto rounded-full bg-gray-900 py-2 text-sm font-semibold text-white disabled:opacity-50 ${disabled ? "cursor-not-allowed" : "cursor-pointer"
                } ${className ?? ""}`}
            {...rest}
        >
            {children}
        </button>
    );
};

export default Button;
