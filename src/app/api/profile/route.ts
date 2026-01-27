import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, avatar } = updateProfileSchema.parse(body);

        const user = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                name,
                avatar: avatar || null,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[PROFILE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
