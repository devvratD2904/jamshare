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
        <div className="w-full space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    Welcome Back
                </h2>
                <p className="text-sm text-white/50">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-primary hover:text-primary-glow hover:underline transition-colors"
                    >
                        Sign up
                    </Link>
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
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
                    Log In
                </Button>
            </form>
        </div>
    );
}
