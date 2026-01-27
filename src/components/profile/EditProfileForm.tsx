"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { toast } from "sonner"; // Assuming sonner or just use alert for now if not installed? I'll fetch toast library later or use alert.

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface EditProfileFormProps {
    user: {
        id: string;
        name?: string | null;
        image?: string | null;
        avatar?: string | null;
    };
}

export function EditProfileForm({ user }: EditProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(user.avatar || user.image || "");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name || "",
            avatar: user.avatar || user.image || "",
        },
    });

    const watchedAvatar = watch("avatar");

    // Update preview when input changes
    if (watchedAvatar !== previewImage && watchedAvatar !== undefined) {
        setPreviewImage(watchedAvatar);
    }

    async function onSubmit(data: FormData) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Something went wrong");
            }

            router.refresh();
            router.push("/profile");
            toast.success("Profile updated");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-2xl bg-[var(--spotify-black)] border-[var(--spotify-gray)]">
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                    Update your public profile information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={previewImage} />
                            <AvatarFallback>User</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 w-full">
                            <Input
                                id="avatar"
                                label="Avatar URL"
                                placeholder="https://example.com/image.jpg"
                                {...register("avatar")}
                                error={errors.avatar?.message}
                            />
                            <p className="text-xs text-[var(--spotify-light-gray)] mt-1 ml-1">
                                Paste an image URL (e.g. from Imgur or Spotify).
                            </p>
                        </div>
                    </div>

                    <Input
                        id="name"
                        label="Display Name"
                        {...register("name")}
                        error={errors.name?.message}
                    />

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
