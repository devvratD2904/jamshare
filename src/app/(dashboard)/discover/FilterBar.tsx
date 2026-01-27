"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TagCategory } from "@prisma/client";
import { Search, Shuffle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface FilterBarProps {
    groupedTags: Record<string, { id: string; name: string }[]>;
}

export function FilterBar({ groupedTags }: FilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("q") || "");
    const [isLoadingRandom, setIsLoadingRandom] = useState(false);

    const currentTagId = searchParams.get("tag");
    const currentCategory = searchParams.get("category");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (search) params.set("q", search);
        else params.delete("q");
        router.push(`/discover?${params.toString()}`);
    };

    const toggleTag = (tagId: string) => {
        const params = new URLSearchParams(searchParams);
        if (currentTagId === tagId) {
            params.delete("tag");
        } else {
            params.set("tag", tagId);
            params.delete("category"); // specific tag overrides category filter
        }
        router.push(`/discover?${params.toString()}`);
    };

    const handleRandom = async () => {
        setIsLoadingRandom(true);
        try {
            const res = await fetch("/api/jams/random");
            if (!res.ok) throw new Error("No jams found");
            const data = await res.json();
            window.open(data.spotifyJamUrl, "_blank");
            toast.success("Opening Random Jam!");
        } catch (error) {
            toast.error("No active jams to discover.");
        } finally {
            setIsLoadingRandom(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--spotify-light-gray)]" />
                    <Input
                        placeholder="Search jams by title or artist..."
                        className="pl-9 bg-[var(--spotify-dark-gray)] border-transparent rounded-full h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                <Button
                    variant="primary"
                    className="rounded-full font-bold bg-purple-600 hover:bg-purple-700"
                    onClick={handleRandom}
                    isLoading={isLoadingRandom}
                >
                    <Shuffle className="mr-2 h-4 w-4" /> Surprise Me
                </Button>
            </div>

            <div className="space-y-4">
                {Object.entries(groupedTags).map(([category, tags]) => (
                    <div key={category} className="space-y-2">
                        <h3 className="text-xs font-bold text-[var(--spotify-light-gray)] uppercase tracking-wider">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className={`cursor-pointer hover:bg-white/20 transition ${currentTagId === tag.id ? 'bg-[var(--spotify-green)] text-black border-transparent hover:bg-[var(--spotify-green)]/80' : 'bg-[var(--spotify-dark-gray)] border-transparent text-white'}`}
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
