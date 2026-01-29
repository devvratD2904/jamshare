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

        // 1. Check if user is already participating in THIS jam
        const existingParticipation = await prisma.jamParticipation.findFirst({
            where: {
                jamId,
                userId: session.user.id,
                leftAt: null
            },
        });

        if (existingParticipation) {
            // Idempotent success - already joined
            return NextResponse.json({ url: jam.spotifyJamUrl });
        }

        // 2. Check if user is participating in ANY OTHER active jam
        // (Enforce "One Jam At A Time" rule)
        const activeConflict = await prisma.jamParticipation.findFirst({
            where: {
                userId: session.user.id,
                leftAt: null, // Still in it
                jam: {
                    isActive: true, // Jam is still live
                    id: { not: jamId } // Not this one
                }
            },
            include: { jam: true }
        });

        if (activeConflict) {
            // Rejection: User must leave the other jam first
            return new NextResponse(JSON.stringify({
                error: "User is already in an active jam",
                activeJamId: activeConflict.jamId
            }), {
                status: 409, // Conflict
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 3. Record participation
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
