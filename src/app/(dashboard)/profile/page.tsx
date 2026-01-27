import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Fetch fresh data
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

    if (!user) {
        return <div>User not found</div>
    }

    // Adapt to NextAuth User type for component compatibility
    const authUser = {
        ...session.user,
        name: user.name,
        image: user.avatar,
        username: user.username
    };

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-[var(--spotify-dark-gray)]/50 to-[var(--background)] p-8">
            <ProfileHeader user={authUser} isOwnProfile={true} />

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
