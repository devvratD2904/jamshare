"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { LogOut, Play, Music, ArrowRightLeft } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface FeaturedJamCardProps {
    jam: {
        id: string;
        title: string;
        description: string | null;
        isActive: boolean;
        spotifyJamUrl: string;
        sharedById: string;
        sharedBy: {
            name: string | null;
        };
        _count: {
            participants: number;
        };
        tags?: {
            tag: {
                name: string;
            }
        }[];
        createdAt: Date;
    };
    currentUserId?: string;
    activeJoinedJamId?: string;
}

export function FeaturedJamCard({ jam, currentUserId, activeJoinedJamId }: FeaturedJamCardProps) {
    const router = useRouter();
    const isOwner = currentUserId === jam.sharedById;
    const isJoined = jam.id === activeJoinedJamId;
    // Conflict exists if I am in a jam (activeJoinedJamId is set) AND it is NOT this jam
    const hasConflict = !!activeJoinedJamId && activeJoinedJamId !== jam.id;

    // Vibrant gradients to mimic album art
    const gradients = [
        'from-pink-500/20 to-purple-900/40',
        'from-blue-500/20 to-indigo-900/40',
        'from-green-500/20 to-teal-900/40',
        'from-orange-500/20 to-red-900/40',
    ];
    // Use jam.id to pick a consistent gradient instead of random
    const gradientIndex = jam.id.charCodeAt(0) % gradients.length;
    const gradient = gradients[gradientIndex];

    const displayTags = jam.tags && jam.tags.length > 0
        ? jam.tags.slice(0, 2).map(t => t.tag.name)
        : [];

    const handleCloseJam = async () => {
        try {
            const res = await fetch(`/api/jams/${jam.id}/close`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Failed to close jam");

            toast.success("Jam session closed");
            router.refresh();
        } catch (error) {
            toast.error("Failed to close jam");
        }
    };

    const handleLeaveJam = async () => {
        try {
            const res = await fetch(`/api/jams/${jam.id}/leave`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to leave jam");

            toast.success("Left jam session");
            router.refresh();
        } catch (error) {
            toast.error("Failed to leave jam");
        }
    };

    const handleJoinJam = async () => {
        try {
            // 1. Record participation in DB
            const res = await fetch(`/api/jams/${jam.id}/join`, {
                method: "POST",
            });

            if (!res.ok) throw new Error("Failed to join jam");

            // 2. Refresh UI to show "Joined" state
            router.refresh();

            // 3. Open Spotify Link
            if (jam.spotifyJamUrl) {
                window.open(jam.spotifyJamUrl, "_blank");
            } else {
                toast.error("No Spotify link available");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to join jam");
        }
    };

    const handleSwitchJam = async () => {
        try {
            // 1. Leave the old jam
            if (activeJoinedJamId) {
                await fetch(`/api/jams/${activeJoinedJamId}/leave`, {
                    method: "DELETE",
                });
            }

            // 2. Join the new one
            await handleJoinJam();

        } catch (error) {
            toast.error("Failed to switch jam");
        }
    };

    return (
        <div className={`group relative w-full aspect-[4/5] bg-[#121212] rounded-3xl overflow-hidden border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${!jam.isActive ? 'border-white/5 opacity-80 hover:opacity-100 grayscale-[0.5] hover:grayscale-0' :
            isJoined ? 'border-[#1ED760]/50 shadow-[0_0_20px_rgba(30,215,96,0.2)]' : 'border-white/5 hover:border-white/20'
            }`}>

            {/* Background Aura */}
            <div className={`absolute inset-0 bg-gradient-to-b ${gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

            {/* Live Badge */}
            {jam.isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-20">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-white">{jam._count.participants} live</span>
                </div>
            )}
            {/* Stat Badge for Closed */}
            {!jam.isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-20">
                    <span className="text-xs font-medium text-white/60">Ended</span>
                </div>
            )}


            {/* Joined Badge */}
            {isJoined && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[#1ED760] text-black rounded-full z-20 shadow-lg font-bold text-[10px] uppercase tracking-wider">
                    Joined
                </div>
            )}

            {/* Album Art Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Music className={`w-20 h-20 text-white/10 group-hover:text-white/30 group-hover:scale-110 transition-all duration-500 ease-out ${!jam.isActive ? 'text-white/5' : ''}`} />
            </div>

            {/* MAIN LINK (Covers entire card behind buttons) */}
            <Link href={`/jams/${jam.id}`} className="absolute inset-0 z-10" aria-label={`View ${jam.title}`} />

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 flex flex-col justify-end h-full z-20 pointer-events-none">
                <div className="space-y-1 mb-4">
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {jam.title || `${jam.sharedBy.name}'s Jam`}
                    </h3>
                    {jam.description && (
                        <p className="text-sm text-white/40 line-clamp-1">{jam.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-white/60">
                        <span>by {jam.sharedBy.name}</span>
                        <span className="text-xs opacity-60">{jam.isActive ? (jam.createdAt ? timeAgo(new Date(jam.createdAt)) : '') : 'Ended'}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        {displayTags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 rounded-lg bg-white/10 text-xs font-medium text-white/80 border border-white/5">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Action Buttons (Pointer Events Auto to catch clicks) */}
                    <div className="pt-2 z-30 relative pointer-events-auto">
                        {!jam.isActive ? (
                            <div className="w-full flex items-center justify-center py-2.5 bg-zinc-900/80 text-zinc-400 border border-white/10 font-medium rounded-xl cursor-not-allowed select-none transition-all hover:bg-zinc-900">
                                Session Ended
                            </div>
                        ) : isOwner ? (
                            <ConfirmDialog
                                title="Close Jam Session?"
                                description="This will end the session for everyone on JamShare."
                                confirmText="Close Jam"
                                variant="destructive"
                                onConfirm={handleCloseJam}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Close Jam
                                    </Button>
                                }
                            />
                        ) : isJoined ? (
                            <Button
                                variant="ghost"
                                className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
                                onClick={(e) => {
                                    handleLeaveJam();
                                }}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Leave Jam
                            </Button>
                        ) : hasConflict ? (
                            <ConfirmDialog
                                title="Switch Jam?"
                                description="You are currently in another jam. Do you want to leave it and join this one?"
                                confirmText="Switch Jam"
                                onConfirm={handleSwitchJam}
                                trigger={
                                    <Button
                                        className="w-full bg-[#1ED760] text-black font-bold hover:bg-[#1fdf64] hover:scale-105 transition-all shadow-lg shadow-green-900/20"
                                    >
                                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                                        Switch Jam
                                    </Button>
                                }
                            />
                        ) : (
                            <Button
                                className="w-full bg-[#1ED760] text-black font-bold hover:bg-[#1fdf64] hover:scale-105 transition-all shadow-lg shadow-green-900/20"
                                onClick={(e) => {
                                    handleJoinJam();
                                }}
                            >
                                <Play className="w-4 h-4 mr-2 fill-current" />
                                Join on Spotify
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
