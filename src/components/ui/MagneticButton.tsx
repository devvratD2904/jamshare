'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    strength?: number; // How strong the pull is
    variant?: 'primary' | 'secondary';
}

export function MagneticButton({
    children,
    className = "",
    onClick,
    strength = 30,
    variant = 'primary'
}: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const button = buttonRef.current;
        const text = textRef.current;
        if (!button || !text) return;

        const xTo = gsap.quickTo(button, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(button, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        // Text moves slightly more for depth effect
        const xToText = gsap.quickTo(text, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yToText = gsap.quickTo(text, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = button.getBoundingClientRect();

            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const x = clientX - centerX;
            const y = clientY - centerY; // Corrected calculation

            // Only magnetize if close enough (optional, but usually handled by enter/leave)
            // For this implementation, we assume if hover is active, we magnetize.

            xTo(x * (strength / 100));
            yTo(y * (strength / 100));

            xToText(x * (strength / 80)); // Text moves more
            yToText(y * (strength / 80));
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
            xToText(0);
            yToText(0);
        };

        button.addEventListener("mousemove", handleMouseMove);
        button.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength]);

    const baseStyles = "relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold uppercase tracking-wider rounded-full transition-colors duration-300";
    const variantStyles = variant === 'primary'
        ? "text-black bg-primary hover:bg-white"
        : "text-white bg-transparent border border-white/20 hover:bg-white/10 hover:border-white/40";

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            className={`${baseStyles} ${variantStyles} ${className} group`}
        >
            <span ref={textRef} className="relative z-10 flex items-center gap-2 pointer-events-none">
                {children}
            </span>
            {/* Background Glow - Only for primary */}
            {variant === 'primary' && (
                <div className="absolute inset-0 rounded-full bg-primary blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
            )}
        </button>
    );
}
