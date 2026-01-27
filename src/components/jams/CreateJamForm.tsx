"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import { TagSelector } from "./TagSelector";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().optional(),
    spotifyJamUrl: z.string().url("Must be a valid URL").refine((url) => url.includes("spotify.com/jam") || url.includes("spotify.link"), {
        message: "Must be a valid Spotify Jam link (spotify.com/jam or spotify.link)",
    }),
    tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreateJamForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { tags: [] }
    });

    const selectedTags = watch("tags") || [];

    async function onSubmit(data: FormData) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/jams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create jam");
            }

            toast.success("Jam created successfully!");
            router.refresh(); // Refresh server data so dashboard is up to date
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="max-w-xl mx-auto bg-[var(--spotify-black)] border-[var(--spotify-gray)]">
            <CardHeader>
                <CardTitle>Share a Jam</CardTitle>
                <CardDescription>
                    Paste your Spotify Jam link to let others join.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        id="title"
                        label="Title"
                        placeholder="Chill Vibes 🎵"
                        {...register("title")}
                        error={errors.title?.message}
                    />

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-bold text-white ml-1">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            className="flex min-h-[80px] w-full rounded-md border border-[var(--spotify-gray)] bg-[var(--spotify-black)] px-3 py-2 text-sm text-white placeholder:text-[var(--spotify-light-gray)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--spotify-white)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-[var(--spotify-light-gray)]"
                            placeholder="Join us for some relaxing tunes..."
                            {...register("description")}
                        />
                    </div>

                    <Input
                        id="spotifyJamUrl"
                        label="Spotify Jam Link"
                        placeholder="https://spotify.com/jam/..."
                        {...register("spotifyJamUrl")}
                        error={errors.spotifyJamUrl?.message}
                    />

                    <TagSelector
                        selectedTags={selectedTags}
                        onChange={(tags) => setValue("tags", tags)}
                    />

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Post Jam
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
