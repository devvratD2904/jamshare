"use client";

import { useEffect, useState } from "react";
import { Tag as TagIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag, TagCategory } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TagSelectorProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchTags() {
            try {
                const res = await fetch("/api/tags");
                if (res.ok) {
                    const data = await res.json();
                    setTags(data);
                }
            } catch (error) {
                console.error("Failed to fetch tags", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTags();
    }, []);

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onChange(selectedTags.filter((id) => id !== tagId));
        } else {
            if (selectedTags.length >= 3) return; // Limit to 3 tags
            onChange([...selectedTags, tagId]);
        }
    };

    // Group tags by category
    const groupedTags = tags.reduce((acc, tag) => {
        if (!acc[tag.category]) acc[tag.category] = [];
        acc[tag.category].push(tag);
        return acc;
    }, {} as Record<TagCategory, Tag[]>);

    if (isLoading) return <div className="text-sm text-[var(--spotify-light-gray)]">Loading tags...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white ml-1">
                <TagIcon className="h-4 w-4" />
                <span>Tags (Max 3)</span>
            </div>

            <div className="space-y-4">
                {Object.entries(groupedTags).map(([category, categoryTags]) => (
                    <div key={category}>
                        <h4 className="text-xs font-semibold text-[var(--spotify-light-gray)] uppercase mb-2 ml-1">
                            {category}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categoryTags.map((tag) => {
                                const isSelected = selectedTags.includes(tag.id);
                                return (
                                    <div
                                        key={tag.id}
                                        onClick={() => toggleTag(tag.id)}
                                        className={cn(
                                            "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all select-none flex items-center gap-1",
                                            isSelected
                                                ? "bg-[var(--spotify-green)] text-black border-[var(--spotify-green)]"
                                                : "bg-transparent text-white border-[var(--spotify-gray)] hover:border-white"
                                        )}
                                    >
                                        {tag.name}
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
