import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FilterBar } from "./FilterBar";
import { JamCard } from "@/components/jams/JamCard";
import { TagCategory } from "@prisma/client";

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
            // Also search by tag name text if needed, but we have specific tag filter
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
            } // Include tags to show them on card if we want (not implemented in card yet but optional)
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

    // 3. User context for JamCard
    const userId = session?.user?.id || "";
    let joinedJamIds = new Set<string>();
    if (userId) {
        const participations = await prisma.jamParticipation.findMany({
            where: { userId },
            select: { jamId: true }
        });
        joinedJamIds = new Set(participations.map(p => p.jamId));
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[var(--spotify-black)] to-[var(--background)] p-8 overflow-y-auto">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold text-white">Discover</h1>
                <p className="text-[var(--spotify-light-gray)]">
                    Explore new sounds, artists, and vibes.
                </p>
            </div>

            <div className="mb-8">
                <FilterBar groupedTags={groupedTags} />
            </div>

            {jams.length === 0 ? (
                <div className="text-center py-20 text-[var(--spotify-light-gray)]">
                    <p className="text-lg">No jams found matching your filters.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {jams.map(jam => (
                        <JamCard
                            key={jam.id}
                            jam={jam}
                            currentUserId={userId}
                            isJoined={joinedJamIds.has(jam.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
