"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";

interface JamCardProps {
    jam: {
        id: string;
        title: string;
        description: string | null;
        spotifyJamUrl: string;
        createdAt: Date;
        isActive: boolean;
        sharedById: string;
        sharedBy: {
            name: string | null;
            avatar: string | null;
            username: string | null;
        };
        _count: {
            participants: number;
        }
    };
    currentUserId: string;
    isJoined: boolean;
}

export function JamCard({ jam, currentUserId, isJoined }: JamCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [localParticipantCount, setLocalParticipantCount] = useState(jam._count.participants);
    const [localIsJoined, setLocalIsJoined] = useState(isJoined);
    const [localIsActive, setLocalIsActive] = useState(jam.isActive);

    const isOwner = currentUserId === jam.sharedById;

    const handleJoin = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/jams/${jam.id}/join`, { method: "POST" });
            if (!response.ok) throw new Error("Failed to join");
            const data = await response.json();

            setLocalParticipantCount(prev => prev + 1);
            setLocalIsJoined(true);
            router.refresh();
            window.open(data.url, "_blank");
            toast.success("Opening Spotify...");
        } catch (error) {
            console.error(error);
            toast.error("Failed to join");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/jams/${jam.id}/leave`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to leave");

            setLocalParticipantCount(prev => Math.max(0, prev - 1));
            setLocalIsJoined(false);
            router.refresh();
            toast.success("You left the jam.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to leave");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/jams/${jam.id}/close`, { method: "POST" });
            if (!response.ok) throw new Error("Failed to close");

            setLocalIsActive(false);
            router.refresh();
            toast.success("Jam closed.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to close");
        } finally {
            setIsLoading(false);
        }
    };

    if (!localIsActive && !isOwner) return null; // Hide closed jams for non-owners immediately if valid

    return (
        <Card className={`bg-[var(--spotify-dark-gray)] border-transparent transition-all hover:bg-[var(--spotify-gray)]/30 group h-full flex flex-col ${!localIsActive ? 'opacity-70 grayscale' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 overflow-hidden">
                        <CardTitle className="line-clamp-1 text-xl truncate pr-2">{jam.title}</CardTitle>
                        <Link href={`/user/${jam.sharedBy.username}`} className="flex items-center gap-2 hover:underline group-hover:opacity-80 transition">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={jam.sharedBy.avatar || ""} />
                                <AvatarFallback className="text-[10px]">{jam.sharedBy.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-[var(--spotify-light-gray)] truncate">{jam.sharedBy.name}</span>
                            <span className="text-xs text-[var(--spotify-light-gray)] whitespace-nowrap">• {formatDistanceToNow(new Date(jam.createdAt), { addSuffix: true })}</span>
                        </Link>
                    </div>
                    {/* Tag/Badge placeholder */}
                    <div className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${localIsActive ? 'text-[var(--spotify-green)] bg-black/40' : 'text-red-400 bg-black/40'}`}>
                        {localIsActive ? (
                            <>
                                <div className="h-2 w-2 rounded-full bg-[var(--spotify-green)] animate-pulse" />
                                <span>LIVE</span>
                            </>
                        ) : (
                            <span>CLOSED</span>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3 flex-1">
                <p className="text-sm text-[var(--spotify-light-gray)] line-clamp-3">
                    {jam.description || "No description provided."}
                </p>
            </CardContent>

            <CardFooter className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center text-xs text-[var(--spotify-light-gray)]">
                    <Users className="mr-1 h-3 w-3" />
                    {localParticipantCount} joined
                </div>

                {isOwner && localIsActive ? (
                    <ConfirmDialog
                        title="Close Jam?"
                        description="Are you sure you want to close this Jam? Users won't be able to join anymore."
                        confirmText="Close Jam"
                        variant="destructive"
                        onConfirm={handleClose}
                        trigger={
                            <Button
                                size="sm"
                                className="rounded-full px-6 font-bold bg-red-600 hover:bg-red-700 text-white"
                                isLoading={isLoading}
                            >
                                Close Jam
                            </Button>
                        }
                    />
                ) : localIsActive ? (
                    localIsJoined ? (
                        <Button
                            size="sm"
                            className="rounded-full px-6 font-bold bg-transparent border border-white/20 hover:bg-white/10"
                            onClick={handleLeave}
                            isLoading={isLoading}
                        >
                            Leave Jam
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="rounded-full px-6 font-bold"
                            variant="primary"
                            onClick={handleJoin}
                            isLoading={isLoading}
                        >
                            Join Jam <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                    )
                ) : (
                    <Button size="sm" disabled className="rounded-full px-6 opacity-50">
                        Closed
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
