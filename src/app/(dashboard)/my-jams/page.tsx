import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JamCard } from "@/components/jams/JamCard";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default async function MyJamsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Fetch created jams
    const createdJams = await prisma.jam.findMany({
        where: { sharedById: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            sharedBy: { select: { name: true, avatar: true, username: true } },
            _count: { select: { participants: true } }
        }
    });

    // Fetch joined jams
    const joinedParticipations = await prisma.jamParticipation.findMany({
        where: { userId: session.user.id },
        orderBy: { joinedAt: "desc" },
        include: {
            jam: {
                include: {
                    sharedBy: { select: { name: true, avatar: true, username: true } },
                    _count: { select: { participants: true } }
                }
            }
        }
    });

    const joinedJams = joinedParticipations.map(p => p.jam);

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-[var(--spotify-black)] to-[var(--background)] p-8">
            <h1 className="text-3xl font-bold text-white mb-6">My Jams</h1>

            <Tabs defaultValue="created" className="w-full">
                <TabsList className="mb-8 bg-[var(--spotify-dark-gray)]">
                    <TabsTrigger value="created" className="data-[state=active]:bg-[var(--spotify-gray)] text-white">
                        Created ({createdJams.length})
                    </TabsTrigger>
                    <TabsTrigger value="joined" className="data-[state=active]:bg-[var(--spotify-gray)] text-white">
                        Joined ({joinedJams.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="created" className="space-y-4">
                    {createdJams.length === 0 ? (
                        <p className="text-[var(--spotify-light-gray)]">You haven't shared any jams yet.</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {createdJams.map(jam => (
                                <JamCard
                                    key={jam.id}
                                    jam={jam}
                                    currentUserId={session.user.id}
                                    isJoined={true} // As creator/host, implies joined or special status
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="joined" className="space-y-4">
                    {joinedJams.length === 0 ? (
                        <p className="text-[var(--spotify-light-gray)]">You haven't joined any jams yet.</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {joinedJams.map(jam => (
                                <JamCard
                                    key={jam.id}
                                    jam={jam}
                                    currentUserId={session.user.id}
                                    isJoined={true}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
