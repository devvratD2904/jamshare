"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginInput) {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error("Invalid email or password");
            }

            router.push("/dashboard");
            router.refresh();

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
                    Log in to JamShare
                </h2>
                <p className="mt-2 text-sm text-[var(--spotify-light-gray)]">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-[var(--spotify-green)] hover:text-[var(--spotify-green-light)] hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 rounded-md shadow-sm">
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
                    Log in
                </Button>
            </form>
        </div>
    );
}
