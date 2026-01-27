import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ jamId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const resolvedParams = await params;
        const { jamId } = resolvedParams;

        // Verify ownership
        const jam = await prisma.jam.findUnique({
            where: { id: jamId }
        });

        if (!jam) return new NextResponse("Jam not found", { status: 404 });

        if (jam.sharedById !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Deactivate jam
        await prisma.jam.update({
            where: { id: jamId },
            data: { isActive: false }
        });

        return NextResponse.json({ message: "Jam closed" });

    } catch (error) {
        console.error("[JAM_CLOSE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
