import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, username } = registerSchema.parse(body);

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            return NextResponse.json({ message: "Email already in use" }, { status: 409 });
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUsername) {
            return NextResponse.json({ message: "Username already taken" }, { status: 409 });
        }

        // Create user
        const passwordHash = await hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                name: username, // Default name to username
            },
        });

        // Remove password hash from response
        const { passwordHash: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
