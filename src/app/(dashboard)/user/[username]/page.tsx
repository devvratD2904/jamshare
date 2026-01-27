import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface UserProfilePageProps {
    params: Promise<{
        username: string;
    }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
    const session = await getServerSession(authOptions);
    const { username } = await params;

    // URL decode username just in case (e.g. spaces)
    const decodedUsername = decodeURIComponent(username);

    const user = await prisma.user.findUnique({
        where: { username: decodedUsername },
        include: {
            _count: {
                select: {
                    sharedJams: true,
                    joinedJams: true
                }
            }
        }
    });

    if (!user) {
        notFound();
    }

    // Determine if viewing own profile
    const isOwnProfile = session?.user?.username === user.username;

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-[var(--spotify-dark-gray)]/50 to-[var(--background)] p-8">
            <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

            <div className="mt-8 border-t border-[var(--spotify-gray)] pt-8">
                <h2 className="text-2xl font-bold text-white mb-4">Activity</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-md bg-[var(--spotify-dark-gray)] p-4">
                        <p className="text-[var(--spotify-light-gray)]">Jams Created</p>
                        <p className="text-2xl font-bold text-[var(--spotify-green)]">{user._count.sharedJams}</p>
                    </div>
                    <div className="rounded-md bg-[var(--spotify-dark-gray)] p-4">
                        <p className="text-[var(--spotify-light-gray)]">Jams Joined</p>
                        <p className="text-2xl font-bold text-[var(--spotify-green)]">{user._count.joinedJams}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
