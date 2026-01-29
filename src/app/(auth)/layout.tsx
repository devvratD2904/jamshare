'use client';

import { ReactNode } from 'react';
import HeroVisualizer from '@/components/landing/HeroVisualizer';
import Link from 'next/link';
import { Music } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background">
            <HeroVisualizer />

            <div className="relative z-10 w-full max-w-md p-8">
                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    {/* Subtle Gradient Glow */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-700" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl group-hover:bg-secondary/30 transition-colors duration-700" />

                    <div className="relative z-10 flex flex-col items-center mb-8">
                        <Link href="/" className="flex items-center gap-2 mb-2 group-hover:scale-105 transition-transform duration-300">
                            <Music className="w-8 h-8 text-primary" />
                            <span className="text-2xl font-bold tracking-tighter text-white">JamShare</span>
                        </Link>
                        <div className="h-1 w-12 bg-white/10 rounded-full mt-4" />
                    </div>

                    {children}
                </div>

                <p className="text-center mt-6 text-white/30 text-xs">
                    &copy; {new Date().getFullYear()} JamShare. Vibe Responsibly.
                </p>
            </div>
        </div>
    );
}
