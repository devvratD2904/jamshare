import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ jamId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const resolvedParams = await params;
        const { jamId } = resolvedParams;

        // Delete participation
        await prisma.jamParticipation.deleteMany({
            where: {
                jamId: jamId,
                userId: session.user.id
            }
        });

        return NextResponse.json({ message: "Left jam" });

    } catch (error) {
        console.error("[JAM_LEAVE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
