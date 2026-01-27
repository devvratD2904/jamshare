"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterInput, registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    async function onSubmit(data: RegisterInput) {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Registration failed");
            }

            // Automatically sign in after registration
            await signIn("credentials", {
                email: data.email,
                password: data.password,
                callbackUrl: "/dashboard",
            });

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                    Sign up for JamShare
                </h2>
                <p className="mt-2 text-sm text-[var(--spotify-light-gray)]">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-[var(--spotify-green)] hover:text-[var(--spotify-green-light)] hover:underline"
                    >
                        Log in here
                    </Link>
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 rounded-md shadow-sm">
                    <Input
                        id="username"
                        type="text"
                        label="Username"
                        placeholder="johndoe"
                        error={errors.username?.message}
                        {...register("username")}
                    />
                    <Input
                        id="email"
                        type="email"
                        label="Email address"
                        placeholder="name.surname@gmail.com"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password")}
                    />
                </div>

                {error && (
                    <div className="rounded-md bg-[var(--error)] p-3 text-sm text-white">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Sign up
                </Button>
            </form>
        </div>
    );
}
