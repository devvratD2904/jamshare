"use client";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { LogOut, Play, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface JamActionsProps {
    jam: {
        id: string;
        spotifyJamUrl: string;
        isActive: boolean;
    };
    isOwner: boolean;
    isJoined: boolean;
}

export function JamActions({ jam, isOwner, isJoined }: JamActionsProps) {
    const router = useRouter();

    const handleJoin = async () => {
        try {
            await fetch(`/api/jams/${jam.id}/join`, { method: "POST" });
            router.refresh();
            window.open(jam.spotifyJamUrl, "_blank");
        } catch (error) {
            toast.error("Failed to join");
        }
    };

    const handleLeave = async () => {
        try {
            await fetch(`/api/jams/${jam.id}/leave`, { method: "DELETE" });
            toast.success("Left the jam");
            router.refresh();
        } catch (error) {
            toast.error("Failed to leave");
        }
    };

    const handleClose = async () => {
        try {
            await fetch(`/api/jams/${jam.id}/close`, { method: "POST" });
            toast.success("Jam Closed");
            router.refresh();
            // Maybe redirect to dashboard?
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to close jam");
        }
    };

    if (!jam.isActive) {
        return (
            <Button disabled className="rounded-full bg-white/5 text-white/40">
                This jam has ended
            </Button>
        );
    }

    if (isOwner) {
        return (
            <ConfirmDialog
                title="End the Vibe?"
                description="Closing this jam will remove it from JamShare. The Spotify session will keep running until you end it there."
                confirmText="End Jam"
                variant="destructive"
                onConfirm={handleClose}
                trigger={
                    <Button variant="destructive" className="rounded-full px-8 h-12 text-lg">
                        <LogOut className="w-5 h-5 mr-2" />
                        Close Jam
                    </Button>
                }
            />
        );
    }

    if (isJoined) {
        return (
            <div className="flex gap-4 justify-center">
                <Button
                    className="rounded-full bg-[#1ED760] text-black font-bold h-12 px-8 hover:bg-[#1fdf64] hover:scale-105 transition-all"
                    onClick={() => window.open(jam.spotifyJamUrl, "_blank")}
                >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Open Spotify
                </Button>
                <Button
                    variant="ghost"
                    className="rounded-full text-red-400 hover:bg-red-500/10 h-12 px-6"
                    onClick={handleLeave}
                >
                    Leave
                </Button>
            </div>
        );
    }

    return (
        <MagneticButton>
            <Button
                className="rounded-full bg-[#1ED760] text-black font-bold h-14 px-10 text-xl shadow-[0_0_30px_rgba(30,215,96,0.3)] hover:shadow-[0_0_50px_rgba(30,215,96,0.5)] transition-all hover:scale-105"
                onClick={handleJoin}
            >
                <Radio className="w-6 h-6 mr-3 animate-pulse" />
                Join the Vibe
            </Button>
        </MagneticButton>
    );
}
