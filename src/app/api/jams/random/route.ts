import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const activeJamsCount = await prisma.jam.count({
            where: { isActive: true }
        });

        if (activeJamsCount === 0) {
            return new NextResponse("No active jams found", { status: 404 });
        }

        const skip = Math.floor(Math.random() * activeJamsCount);
        const randomJam = await prisma.jam.findMany({
            where: { isActive: true },
            take: 1,
            skip: skip,
            select: { spotifyJamUrl: true, id: true } // Just need URL or ID
        });

        if (!randomJam || randomJam.length === 0) {
            return new NextResponse("No active jams found", { status: 404 });
        }

        return NextResponse.json(randomJam[0]);
    } catch (error) {
        console.error("[RANDOM_JAM]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
