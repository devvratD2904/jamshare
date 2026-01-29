import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FeaturedJamCard } from "@/components/dashboard/FeaturedJamCard";
import { SearchInput } from "@/components/discover/SearchInput";
import { VibeSelector } from "@/components/discover/VibeSelector";
import { TagCategory } from "@prisma/client";
import { ImmersiveNav } from "@/components/layout/ImmersiveNav"; // Ensure nav is clear if parent layout didn't cover it well (it does, but safety)

export const dynamic = "force-dynamic";

export default async function DiscoverPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getServerSession(authOptions);
    const resolvedParams = await searchParams;
    const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
    const tagId = typeof resolvedParams.tag === "string" ? resolvedParams.tag : undefined;

    // 1. Fetch Jams based on filters
    const where: any = { isActive: true };

    if (q) {
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
        ];
    }

    if (tagId) {
        where.tags = {
            some: {
                tagId: tagId
            }
        };
    }

    const jams = await prisma.jam.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            sharedBy: {
                select: {
                    name: true,
                    avatar: true,
                    username: true
                }
            },
            _count: {
                select: {
                    participants: true
                }
            },
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    // 2. Fetch all Tags to display filters
    const tags = await prisma.tag.findMany({
        orderBy: { name: "asc" }
    });

    // Group tags by category
    const groupedTags: Record<string, { id: string; name: string }[]> = {};
    Object.values(TagCategory).forEach(cat => {
        groupedTags[cat] = [];
    });
    tags.forEach(tag => {
        if (groupedTags[tag.category]) {
            groupedTags[tag.category].push({ id: tag.id, name: tag.name });
        }
    });

    return (
        <div className="min-h-screen bg-[var(--background)] p-8 pt-12 max-w-7xl mx-auto overflow-x-hidden">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-12 space-y-4">
                <div className="relative">
                    {/* Glow behind title */}
                    <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-50" />
                    <h1 className="relative text-5xl md:text-7xl font-bold text-white tracking-tighter">
                        Discover Jams
                    </h1>
                </div>
                <p className="text-xl text-white/50 font-light max-w-2xl">
                    Find your next favorite music session.
                </p>
            </div>

            {/* Search Section */}
            <div className="max-w-4xl mx-auto mb-20">
                <SearchInput />
            </div>

            {/* Vibe Selector (Tags) */}
            <div className="max-w-5xl mx-auto mb-20">
                <VibeSelector groupedTags={groupedTags} />
            </div>

            {/* Results Grid */}
            {jams.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-white mb-2">No jams found</p>
                    <p className="text-white/50">Try adjusting your vibe or search query.</p>
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {jams.map(jam => (
                        <FeaturedJamCard
                            key={jam.id}
                            jam={jam}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
