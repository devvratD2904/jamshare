'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Settings, Music, Users, Calendar, Edit, LogOut } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { signOut } from "next-auth/react";

interface ProfileHeaderProps {
    user: {
        name?: string | null;
        image?: string | null;
        avatar?: string | null;
        username?: string | null;
        createdAt: Date;
    };
    stats: {
        created: number;
        joined: number;
    };
    isOwnProfile?: boolean;
}

export function ProfileHeader({ user, stats, isOwnProfile }: ProfileHeaderProps) {
    return (
        <div className="relative w-full overflow-hidden rounded-3xl border border-white/5 bg-[#121212]">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-black" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-secondary/20 blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />

            <div className="relative flex flex-col items-center gap-8 p-8 md:flex-row md:items-end md:p-12">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="h-32 w-32 md:h-40 md:w-40 rounded-full p-1 bg-gradient-to-br from-purple-500 to-pink-500">
                        <Avatar className="h-full w-full border-4 border-[#121212]">
                            <AvatarImage src={user.image || user.avatar || undefined} alt={user.name || "User"} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-[#181818] text-white">
                                {user.name?.slice(0, 2).toUpperCase() || "JS"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {/* Online Indicator */}
                    <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-[#121212] flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex flex-col items-center text-center md:items-start md:text-left flex-grow gap-2">
                    <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                        {user.name}
                    </h1>
                    <p className="text-lg text-white/50 font-medium mb-2">
                        Jamming since {format(new Date(user.createdAt), 'MMMM yyyy')}
                    </p>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center gap-6 md:justify-start">
                        <div className="flex items-center gap-2 text-white/80">
                            <Music className="w-4 h-4 text-secondary" />
                            <span className="font-bold">{stats.created}</span>
                            <span className="text-white/40 text-sm">Jams Created</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-bold">{stats.joined}</span>
                            <span className="text-white/40 text-sm">Jams Joined</span>
                        </div>

                        {/* Placeholder for listening time if we had it */}
                        <div className="flex items-center gap-2 text-white/80">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="font-bold">Active</span>
                            <span className="text-white/40 text-sm">Now</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-3">
                    {isOwnProfile && (
                        <>
                            <Link href="/profile/edit">
                                <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white px-6">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </Link>

                            <ConfirmDialog
                                title="Leaving the Vibe?"
                                description="Are you sure you want to log out and disconnect from the amazing music? The silence might be loud."
                                confirmText="Log Out"
                                cancelText="Stay Jamming"
                                variant="destructive"
                                onConfirm={() => signOut({ callbackUrl: "/" })}
                                trigger={
                                    <Button variant="ghost" className="rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4">
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
