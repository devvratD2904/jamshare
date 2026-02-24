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
            avatar?: string | null;
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
    const hasConflict = !!activeJoinedJamId && activeJoinedJamId !== jam.id;

    // Premium color palettes
    const themes = [
        { bg: 'from-emerald-500/10 to-emerald-900/20', border: 'hover:border-emerald-500/30', glow: 'group-hover:shadow-emerald-500/10', color: 'text-emerald-400' },
        { bg: 'from-violet-500/10 to-violet-900/20', border: 'hover:border-violet-500/30', glow: 'group-hover:shadow-violet-500/10', color: 'text-violet-400' },
        { bg: 'from-blue-500/10 to-blue-900/20', border: 'hover:border-blue-500/30', glow: 'group-hover:shadow-blue-500/10', color: 'text-blue-400' },
        { bg: 'from-rose-500/10 to-rose-900/20', border: 'hover:border-rose-500/30', glow: 'group-hover:shadow-rose-500/10', color: 'text-rose-400' },
    ];

    const themeIndex = jam.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % themes.length;
    const theme = themes[themeIndex];

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
            const res = await fetch(`/api/jams/${jam.id}/join`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to join jam");
            router.refresh();
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
            if (activeJoinedJamId) {
                await fetch(`/api/jams/${activeJoinedJamId}/leave`, {
                    method: "DELETE",
                });
            }
            await handleJoinJam();
        } catch (error) {
            toast.error("Failed to switch jam");
        }
    };

    return (
        <div className={`group relative w-full min-h-[230px] bg-[#0a0f0a] rounded-2xl overflow-hidden border transition-all duration-500 hover:translate-y-[-8px] ${!jam.isActive ? 'border-white/5 opacity-70' :
            isJoined ? 'border-[#1ED760] shadow-[0_0_30px_rgba(30,215,96,0.3)]' :
                'border-white/10 hover:border-[#1ED760]/50'
            }`}>

            {/* Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1ED760]/30 via-[#064e3b]/40 to-[#0c0c0c] opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Musical Pattern (Subtle SVG) */}
            <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM50 40c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8 c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zM10 40c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8 c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z' fill='%231ED760' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
            />

            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent" />

            {/* Badge Overlay */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-start z-20 pointer-events-none">
                {isJoined ? (
                    <div className="px-3 py-1 bg-[#1ED760] text-black rounded-lg shadow-[0_0_15px_rgba(30,215,96,0.5)] font-black text-[10px] uppercase tracking-widest ring-1 ring-white/20">
                        Live Jamming
                    </div>
                ) : (
                    <div />
                )}

                {jam.isActive ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1ED760] animate-pulse shadow-[0_0_10px_#1ED760]" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{jam._count.participants} In-Room</span>
                    </div>
                ) : (
                    <div className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Archived Vibe</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="relative h-full flex flex-col p-6 z-20">
                {/* Main Link Wrapper */}
                <Link href={`/jams/${jam.id}`} className="absolute inset-0 z-10" aria-label={`View ${jam.title}`} />

                <div className="flex-1 mt-6">
                    <h3 className="text-2xl font-black text-white mb-2.5 line-clamp-1 group-hover:text-[#1ED760] transition-colors duration-300 tracking-tight">
                        {jam.title || `${jam.sharedBy.name}'s Jam`}
                    </h3>

                    {jam.description && (
                        <p className="text-[14px] text-white/70 line-clamp-2 mb-5 font-medium leading-relaxed italic">
                            "{jam.description}"
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-6">
                        {displayTags.map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-[#1ED760]/10 text-[10px] font-black uppercase tracking-tighter border border-[#1ED760]/20 text-[#1ED760]">
                                // {tag.toLowerCase()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom Section: Actions + Host Info */}
                <div className="relative z-30 pointer-events-auto mt-auto flex flex-col gap-4">

                    {/* Action Buttons (Only for active jams) */}
                    {jam.isActive ? (
                        <div>
                            {isOwner ? (
                                <ConfirmDialog
                                    title="Close Jam Session?"
                                    description="This will end the session for everyone on JamShare."
                                    confirmText="Close Jam"
                                    variant="destructive"
                                    onConfirm={handleCloseJam}
                                    trigger={
                                        <Button
                                            variant="ghost"
                                            className="w-full h-12 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-[12px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Terminate Jam
                                        </Button>
                                    }
                                />
                            ) : isJoined ? (
                                <Button
                                    variant="ghost"
                                    className="w-full h-12 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-[12px] font-black uppercase tracking-widest transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLeaveJam();
                                    }}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Leave Session
                                </Button>
                            ) : hasConflict ? (
                                <ConfirmDialog
                                    title="Switch Jam?"
                                    description="You are currently in another jam. Do you want to leave it and join this one?"
                                    confirmText="Switch Jam"
                                    onConfirm={handleSwitchJam}
                                    trigger={
                                        <Button
                                            className="w-full h-12 bg-[#1ED760] text-black font-black hover:bg-[#1fdf64] hover:scale-[1.03] transition-all shadow-[0_0_20px_rgba(30,215,96,0.4)] text-[12px] uppercase tracking-widest"
                                        >
                                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                                            Switch Track
                                        </Button>
                                    }
                                />
                            ) : (
                                <Button
                                    className="w-full h-12 bg-[#1ED760] text-black font-black hover:bg-[#1fdf64] hover:scale-[1.03] transition-all shadow-[0_0_20px_rgba(30,215,96,0.4)] text-[12px] uppercase tracking-widest"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleJoinJam();
                                    }}
                                >
                                    <Play className="w-4 h-4 mr-2 fill-current" />
                                    Join the Vibe
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="w-full py-2.5 px-4 bg-white/5 border border-white/5 rounded-xl text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                                Expired Session
                            </span>
                        </div>
                    )}

                    {/* Host Info - ALWAYS at the bottom */}
                    <div className="flex items-center gap-3.5 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md group-hover:bg-white/10 transition-colors duration-300">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1ED760]/30 bg-zinc-800 flex-shrink-0 shadow-inner">
                            {jam.sharedBy.avatar ? (
                                <img src={jam.sharedBy.avatar} alt={jam.sharedBy.name || ""} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-black text-[#1ED760]">
                                    {(jam.sharedBy.name || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black text-[#1ED760] leading-none truncate tracking-wide">
                                {jam.sharedBy.name?.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-white/50 mt-1 font-bold uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
                                <Music className="w-3 h-3 text-[#1ED760]" />
                                {jam.isActive ? (jam.createdAt ? timeAgo(new Date(jam.createdAt)) : '') : 'SESSION ENDED'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

