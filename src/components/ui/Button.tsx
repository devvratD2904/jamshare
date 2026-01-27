import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={isLoading || props.disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95",

                    /* Variants */
                    variant === "primary" && "bg-[var(--spotify-green)] text-black hover:bg-[var(--spotify-green-light)]",
                    variant === "secondary" && "bg-white text-black hover:bg-gray-200",
                    variant === "outline" && "border border-gray-500 text-white hover:border-white bg-transparent",
                    variant === "ghost" && "text-[var(--spotify-light-gray)] hover:text-white bg-transparent hover:bg-[var(--spotify-gray)]",
                    variant === "danger" && "bg-[var(--error)] text-white hover:bg-[var(--error-light)]",

                    /* Sizes */
                    size === "sm" && "h-8 px-4 text-sm",
                    size === "md" && "h-12 px-8 text-base",
                    size === "lg" && "h-14 px-10 text-lg",
                    size === "icon" && "h-10 w-10 p-0",

                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
