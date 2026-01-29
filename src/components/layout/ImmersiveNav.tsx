'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Radio, Plus, User, Sparkles, Activity } from 'lucide-react';

const NAV_ITEMS = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Radio, label: 'Discover', href: '/discover' },
    { icon: Sparkles, label: 'Vibes', href: '/vibes' },
    { icon: Activity, label: 'Analysis', href: '/analysis' },
    { icon: User, label: 'Profile', href: '/profile' },
];

export function ImmersiveNav() {
    const pathname = usePathname();

    return (
        <div className="fixed top-6 left-0 right-0 mx-auto w-fit z-[100] animate-nav-enter">
            <div
                className="flex items-center gap-2 p-2 rounded-full bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl"
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center justify-center p-3 rounded-full transition-all duration-300 hover:bg-white/10 group ${isActive ? 'text-primary' : 'text-white/60'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : 'fill-none'}`} />

                            {isActive && (
                                <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                            )}

                            {/* Tooltip */}
                            <span className="absolute top-12 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap border border-white/10">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Separator */}
                <div className="w-px h-6 bg-white/10 mx-1" />

                {/* Create Button (Special) */}
                <Link
                    href="/create"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-black hover:scale-110 hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(45,226,120,0.3)] hover:shadow-[0_0_25px_rgba(45,226,120,0.5)]"
                >
                    <Plus className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
