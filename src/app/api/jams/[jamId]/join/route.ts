import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ jamId: string }> } // Params is Promise in Next 15
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { jamId } = await params;

        // Check if jam exists
        const jam = await prisma.jam.findUnique({
            where: { id: jamId },
        });

        if (!jam) {
            return new NextResponse("Jam not found", { status: 404 });
        }

        // Record participation
        // (Optional: Check if already joined to avoid duplicates, but for now we log every 'join' click as a potential new session entry)
        await prisma.jamParticipation.create({
            data: {
                jamId,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ url: jam.spotifyJamUrl });
    } catch (error) {
        console.error("[JAM_JOIN_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
