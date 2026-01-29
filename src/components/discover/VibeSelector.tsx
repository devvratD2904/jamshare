'use client';

import { useRouter, useSearchParams } from "next/navigation";

interface VibeSelectorProps {
    groupedTags: Record<string, { id: string; name: string }[]>;
}

export function VibeSelector({ groupedTags }: VibeSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTagId = searchParams.get("tag");

    const toggleTag = (tagId: string) => {
        const params = new URLSearchParams(searchParams);
        if (currentTagId === tagId) {
            params.delete("tag");
        } else {
            params.set("tag", tagId);
            params.delete("category");
        }
        router.push(`/discover?${params.toString()}`);
    };

    // Flatten tags for a simpler "Vibe" cloud
    const allTags = Object.values(groupedTags).flat();

    return (
        <div className="w-full text-center space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">What's your vibe?</h2>
                <p className="text-white/50">Choose a genre to find your perfect jam</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {allTags.map((tag) => {
                    const isActive = currentTagId === tag.id;
                    return (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${isActive
                                    ? "bg-white text-black border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/30"
                                }`}
                        >
                            {tag.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
