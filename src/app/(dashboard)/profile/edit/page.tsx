import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { prisma } from "@/lib/prisma";

export default async function EditProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) return null;

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <EditProfileForm user={user} />
        </div>
    );
}
