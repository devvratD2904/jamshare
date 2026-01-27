import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label htmlFor={id} className="text-sm font-bold text-white ml-1">
                        {label}
                    </label>
                )}
                <input
                    id={id}
                    ref={ref}
                    className={cn(
                        "flex h-12 w-full rounded-md border border-[var(--spotify-gray)] bg-[var(--spotify-black)] px-3 py-2 text-sm ring-offset-[var(--background)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--spotify-light-gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--spotify-white)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 text-white transition-colors hover:border-[var(--spotify-light-gray)]",
                        error && "border-[var(--error)] focus-visible:ring-[var(--error)]",
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-sm font-medium text-[var(--error)] ml-1">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
