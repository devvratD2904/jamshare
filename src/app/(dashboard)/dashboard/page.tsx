import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JamCard } from "@/components/jams/JamCard";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // Fetch active jams
    const jams = await prisma.jam.findMany({
        where: { isActive: true },
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
            }
        }
    });

    // Fetch IDs of jams joined by current user
    const participations = await prisma.jamParticipation.findMany({
        where: { userId: session.user.id },
        select: { jamId: true }
    });
    const joinedJamIds = new Set(participations.map(p => p.jamId));

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[var(--spotify-black)] to-[var(--background)] p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Live Jams</h1>
                    <p className="text-[var(--spotify-light-gray)] mt-1">Join a session or start your own.</p>
                </div>
                <Link href="/jams/create">
                    <Button className="rounded-full">
                        <Plus className="mr-2 h-4 w-4" /> Start Jam
                    </Button>
                </Link>
            </div>

            {jams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--spotify-light-gray)]">
                    <p className="mb-4 text-lg">No active jams right now.</p>
                    <Link href="/jams/create">
                        <Button variant="outline">Be the first to share one!</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {jams.map((jam) => (
                        <JamCard
                            key={jam.id}
                            jam={jam}
                            currentUserId={session.user.id}
                            isJoined={joinedJamIds.has(jam.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
