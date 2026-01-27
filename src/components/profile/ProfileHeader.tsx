import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Settings } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
    user: {
        name?: string | null;
        image?: string | null;
        avatar?: string | null;
        username?: string | null;
    };
    isOwnProfile?: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative h-32 w-32 shrink-0 md:h-48 md:w-48">
                <Avatar className="h-full w-full border-4 border-[var(--background)] shadow-xl">

                    <AvatarImage src={user.image || user.avatar || undefined} alt={user.name || "User avatar"} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-[var(--spotify-dark-gray)] text-white">
                        {user.name?.slice(0, 2).toUpperCase() || "JS"}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium uppercase tracking-widest text-[var(--spotify-light-gray)]">
                    Profile
                </span>
                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
                    {user.name}
                </h1>

                <div className="flex items-center gap-2 text-[var(--spotify-light-gray)]">
                    {isOwnProfile && (
                        <Link href="/profile/edit">
                            <Button variant="ghost" size="sm" className="mt-2 text-white hover:bg-white/10">
                                <Settings className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
