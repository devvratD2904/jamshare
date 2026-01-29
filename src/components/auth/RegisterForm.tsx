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
        <div className="w-full space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    Start Your Global Jam
                </h2>
                <p className="text-sm text-white/50">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-primary hover:text-primary-glow hover:underline transition-colors"
                    >
                        Log in here
                    </Link>
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    <Input
                        id="username"
                        type="text"
                        label="Username"
                        placeholder="johndoe"
                        error={errors.username?.message}
                        {...register("username")}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 backdrop-blur-sm"
                    />
                    <Input
                        id="email"
                        type="email"
                        label="Email address"
                        placeholder="name.surname@gmail.com"
                        error={errors.email?.message}
                        {...register("email")}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 backdrop-blur-sm"
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password")}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 backdrop-blur-sm"
                    />
                </div>

                {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-primary text-black hover:bg-white font-bold tracking-wide py-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,226,120,0.4)]"
                    isLoading={isLoading}
                >
                    Sign Up
                </Button>
            </form>
        </div>
    );
}
