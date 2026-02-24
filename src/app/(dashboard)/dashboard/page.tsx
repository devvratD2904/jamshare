import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FeaturedJamCard } from "@/components/dashboard/FeaturedJamCard";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // active jam check
    const activeParticipation = session ? await prisma.jamParticipation.findFirst({
        where: {
            userId: session.user.id,
            jam: { isActive: true },
            leftAt: null
        },
        select: { jamId: true }
    }) : null;

    // Fetch active jams
    const jams = await prisma.jam.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: { // Added select to include spotifyJamUrl
            id: true,
            title: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            spotifyJamUrl: true, // Included spotifyJamUrl
            sharedById: true, // Included sharedById
            sharedBy: {
                select: {
                    id: true, // Needed for ownership check
                    name: true,
                    avatar: true,
                    username: true
                }
            },
            participants: {
                where: { leftAt: null },
                select: { userId: true }
            },
            tags: {
                include: {
                    tag: true
                }
            }
        }
    });

    // Format jams to include accurate participant count
    const formattedJams = jams.map(jam => ({
        ...jam,
        _count: {
            participants: jam.participants.length
        }
    }));

    return (
        <div className="min-h-screen bg-[var(--background)] p-8 pt-12 w-full max-w-[1800px] mx-auto">
            {/* Header Section */}
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                    Featured Jams Right Now
                </h1>
                <p className="text-lg text-white/50 font-light">
                    Jump into these popular jams happening live
                </p>

                {/* Visual Separator */}
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto opacity-50 rounded-full" />
            </div>

            {jams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--spotify-light-gray)] border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
                    <p className="mb-4 text-2xl font-bold text-white">Quiet in here...</p>
                    <p className="mb-8 text-white/50">No one is jamming yet. Be the spark!</p>
                    <Link href="/create">
                        <Button className="rounded-full px-8 py-6 text-lg bg-primary text-black hover:bg-white transition-all">
                            Start the First Jam
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {formattedJams.map((jam) => (
                        <FeaturedJamCard
                            key={jam.id}
                            jam={jam as any}
                            currentUserId={session?.user?.id}
                            activeJoinedJamId={activeParticipation?.jamId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
