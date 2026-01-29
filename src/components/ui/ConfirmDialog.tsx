"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import { ReactNode } from "react";

interface ConfirmDialogProps {
    trigger: ReactNode;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
}

export function ConfirmDialog({
    trigger,
    title,
    description,
    confirmText = "Let's Go",
    cancelText = "Stay",
    onConfirm,
    variant = "default"
}: ConfirmDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_-12px_rgba(140,45,226,0.5)] overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <AlertDialogHeader className="relative z-10">
                    <AlertDialogTitle className="text-2xl font-bold text-white tracking-tight">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60 text-base font-light leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="relative z-10 mt-6 gap-3">
                    <AlertDialogCancel className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white px-6">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            onConfirm();
                        }}
                        className={`rounded-full px-8 transition-transform hover:scale-105 ${variant === "destructive"
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                : "bg-[var(--spotify-green)] text-black font-bold hover:bg-[#1ed760]"
                            }`}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
