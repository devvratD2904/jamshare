import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json(tags);
    } catch (error) {
        console.error("[TAGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
