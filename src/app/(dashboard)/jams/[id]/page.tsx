import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { WaveformVisualizer } from "@/components/landing/WaveformVisualizer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ArrowLeft, ExternalLink, Music, Users, Radio } from "lucide-react";
import Link from "next/link";
import { JamActions } from "@/components/jams/JamActions"; // New Client Component

export default async function JamRoomPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { id } = await params; // Await params in Next.js 15
    const jam = await prisma.jam.findUnique({
        where: { id },
        include: {
            sharedBy: true,
            _count: { select: { participants: true } },
            tags: { include: { tag: true } }
        }
    });

    if (!jam) notFound();

    const isOwner = session.user.id === jam.sharedById;

    // Check if I joined
    const participation = await prisma.jamParticipation.findFirst({
        where: { jamId: id, userId: session.user.id }
    });
    const isJoined = !!participation;

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col overflow-hidden">

            {/* Background Visualizer */}
            <div className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none opacity-30">
                <WaveformVisualizer
                    barCount={120}
                    height="60vh"
                    opacity={0.5}
                    className="w-full h-full pb-0 items-end gap-1 px-4 text-primary mix-blend-screen"
                    barClassName="flex-1 rounded-t-lg"
                />
            </div>

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/dashboard">
                    <Button variant="ghost" className="rounded-full bg-black/40 text-white hover:bg-white/10 border border-white/5 backdrop-blur-md">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">

                {/* Jam Header Card */}
                <div className="w-full max-w-2xl p-10 rounded-[3rem] bg-[#121212]/50 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)]">

                    {/* Status Badge */}
                    <div className="flex justify-center mb-6">
                        {jam.isActive ? (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium animate-pulse">
                                <Radio className="w-4 h-4" />
                                <span>Live Session</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-medium">
                                <span>Session Ended</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-xl">
                        {jam.title}
                    </h1>

                    {jam.description && (
                        <p className="text-xl text-white/60 font-light mb-8 max-w-lg mx-auto leading-relaxed">
                            {jam.description}
                        </p>
                    )}

                    {/* Host Info */}
                    <div className="flex items-center justify-center gap-4 mb-10">
                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5">
                            <Avatar className="w-8 h-8 border border-white/10">
                                <AvatarImage src={jam.sharedBy.avatar || undefined} />
                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                    {jam.sharedBy.name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Hosted By</p>
                                <p className="text-sm font-bold text-white">{jam.sharedBy.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Vibers</p>
                                <p className="text-sm font-bold text-white">{jam._count.participants} Joined</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions (Client Component) */}
                    <JamActions
                        jam={{
                            id: jam.id,
                            spotifyJamUrl: jam.spotifyJamUrl,
                            isActive: jam.isActive
                        }}
                        isOwner={isOwner}
                        isJoined={isJoined}
                    />

                </div>

            </div>
        </div>
    );
}
