import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const createJamSchema = z.object({
    title: z.string().min(5),
    description: z.string().optional(),
    spotifyJamUrl: z.string().url(),
    tags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, description, spotifyJamUrl, tags } = createJamSchema.parse(body);

        // Check if user already has an active jam
        const existingActiveJam = await prisma.jam.findFirst({
            where: {
                sharedById: session.user.id,
                isActive: true
            }
        });

        if (existingActiveJam) {
            return new NextResponse("You already have an active Jam. Close it first.", { status: 409 });
        }

        const jam = await prisma.jam.create({
            data: {
                title,
                description,
                spotifyJamUrl,
                sharedById: session.user.id,
                tags: tags && tags.length > 0 ? {
                    create: tags.map(tagId => ({
                        tag: { connect: { id: tagId } }
                    }))
                } : undefined
            },
        });

        return NextResponse.json(jam);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid data", { status: 422 });
        }
        console.error("[JAMS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
