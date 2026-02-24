import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { prisma } from "@/lib/prisma";
import { FeaturedJamCard } from "@/components/dashboard/FeaturedJamCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";


export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // 1. Fetch User Data & Basic Stats
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            _count: {
                select: {
                    sharedJams: true,
                    joinedJams: true
                }
            }
        }
    });

    if (!user) return <div>User not found</div>;

    const authUser = {
        ...session.user,
        name: user.name,
        image: user.avatar,
        username: user.username,
        createdAt: user.createdAt
    };

    // 2. Fetch Jams (Created & Joined) with Tags
    const createdJams = await prisma.jam.findMany({
        where: { sharedById: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            sharedBy: { select: { name: true, avatar: true, username: true } },
            participants: {
                where: { leftAt: null },
                select: { userId: true }
            },
            tags: { include: { tag: true } }
        }
    });

    const formattedCreatedJams = createdJams.map(jam => ({
        ...jam,
        _count: { participants: jam.participants.length }
    }));

    const joinedParticipations = await prisma.jamParticipation.findMany({
        where: { userId: session.user.id },
        orderBy: { joinedAt: "desc" },
        include: {
            jam: {
                include: {
                    sharedBy: { select: { name: true, avatar: true, username: true } },
                    participants: {
                        where: { leftAt: null },
                        select: { userId: true }
                    },
                    tags: { include: { tag: true } }
                }
            }
        }
    });

    // Deduplicate and format joined jams
    const joinedJamsMap = new Map();
    joinedParticipations.forEach(p => {
        if (!joinedJamsMap.has(p.jam.id)) {
            joinedJamsMap.set(p.jam.id, {
                ...p.jam,
                _count: { participants: p.jam.participants.length }
            });
        }
    });
    const joinedJams = Array.from(joinedJamsMap.values());

    // 3. Fetch Recent Jammers (Users in jams I've been in)
    // Find jams I'm part of
    const myJamIds = joinedParticipations.map(p => p.jamId);
    // Also add jams I created (if any aren't duplicates, but I might participate in my own jams? Assume yes or query logic)
    // Simplified: Just use joinedParticipations as "Interaction History" and find CO-PARTICIPANTS in those jams.

    // We want to find distinct users who participated in 'myJamIds'
    const recentInteractions = await prisma.jamParticipation.findMany({
        where: {
            jamId: { in: myJamIds },
            userId: { not: session.user.id } // Exclude myself
        },
        orderBy: { joinedAt: 'desc' },
        take: 20, // Fetch a bit more to unique them
        include: {
            user: {
                select: { id: true, name: true, avatar: true, username: true }
            }
        }
    });

    // Unique by user ID
    const recentJammers = Array.from(new Map(recentInteractions.map(item => [item.userId, item.user])).values()).slice(0, 5);


    // 4. Fetch Active Participation for UI Logic (e.g. "Leave Jam" button)
    const activeParticipation = await prisma.jamParticipation.findFirst({
        where: {
            userId: session.user.id,
            jam: { isActive: true },
            leftAt: null
        },
        select: { jamId: true }
    });

    return (
        <div className="min-h-screen bg-[var(--background)] p-8 pt-12 w-full max-w-[1800px] mx-auto overflow-x-hidden space-y-12">

            {/* Header */}
            <ProfileHeader
                user={authUser}
                stats={{ created: user._count.sharedJams, joined: user._count.joinedJams }}
                isOwnProfile={true}
            />

            {/* Recent Jammers Section */}
            {recentJammers.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Recent Jammers</h2>
                    <div className="flex -space-x-4 overflow-hidden py-2">
                        {recentJammers.map((jammer) => (
                            <div key={jammer.id} className="relative group transition-transform hover:z-10 hover:-translate-y-1">
                                <div className="h-14 w-14 rounded-full border-2 border-black bg-[#181818]">
                                    <Avatar className="h-full w-full">
                                        <AvatarImage src={jammer.avatar || undefined} alt={jammer.name || "User"} />
                                        <AvatarFallback className="bg-purple-900 text-white text-xs">
                                            {jammer.name?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                {/* Simple Tooltip */}
                                <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {jammer.name}
                                </div>
                            </div>
                        ))}
                        {recentJammers.length === 5 && (
                            <div className="flex items-center justify-center h-14 w-14 rounded-full border-2 border-black bg-white/10 text-white text-xs font-medium backdrop-blur-sm z-0">
                                +More
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Jams Tabs */}
            <Tabs defaultValue="created" className="w-full">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Your Collection</h2>

                    <TabsList className="bg-white/5 border border-white/5 rounded-full p-1 h-auto backdrop-blur-md">
                        <TabsTrigger
                            value="created"
                            className="rounded-full px-6 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-black text-white/60 transition-all font-medium"
                        >
                            Created
                        </TabsTrigger>
                        <TabsTrigger
                            value="joined"
                            className="rounded-full px-6 py-2 text-sm data-[state=active]:bg-secondary data-[state=active]:text-white text-white/60 transition-all font-medium"
                        >
                            Joined
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="created" className="min-h-[300px]">
                    {createdJams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-3xl bg-white/5 border-dashed">
                            <p className="text-xl font-bold text-white mb-2">No jams created</p>
                            <p className="text-white/50">Your stage is waiting.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {formattedCreatedJams.map(jam => (
                                <FeaturedJamCard
                                    key={jam.id}
                                    jam={jam as any}
                                    currentUserId={session.user.id}
                                    activeJoinedJamId={activeParticipation?.jamId}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="joined" className="min-h-[300px]">
                    {joinedJams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-3xl bg-white/5 border-dashed">
                            <p className="text-xl font-bold text-white mb-2">No jams joined</p>
                            <p className="text-white/50">Explore the void to see who's jamming.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {joinedJams.map(jam => (
                                <FeaturedJamCard
                                    key={jam.id}
                                    jam={jam as any}
                                    currentUserId={session.user.id}
                                    activeJoinedJamId={activeParticipation?.jamId}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
