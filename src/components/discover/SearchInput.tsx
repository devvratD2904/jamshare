'use client';

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("q") || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (search) params.set("q", search);
        else params.delete("q");
        router.push(`/discover?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full group">
            <div className="relative flex items-center w-full">
                <Search className="absolute left-6 w-6 h-6 text-white/40 group-focus-within:text-primary transition-colors" />

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for jams, artists, genres..."
                    className="w-full h-16 pl-16 pr-32 bg-white/5 border border-white/10 rounded-full text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md"
                />

                <button
                    type="button" // Filter logic would go here
                    className="absolute right-2 h-12 px-6 bg-secondary hover:bg-secondary/80 text-white rounded-full flex items-center gap-2 transition-all font-medium text-sm shadow-lg shadow-purple-900/20"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters</span>
                </button>
            </div>

            {/* Search Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500 -z-10" />
        </form>
    );
}
