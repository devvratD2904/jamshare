"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface EditProfileFormProps {
    user: {
        id: string;
        name?: string | null;
        image?: string | null;
        avatar?: string | null;
        bio?: string | null;
        username?: string | null;
    };
}

export function EditProfileForm({ user }: EditProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState(user.name || "");
    const [bio, setBio] = useState(user.bio || "");
    const [avatar, setAvatar] = useState<string | null>(user.avatar || user.image || null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update profile via API
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, bio, avatar }),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            toast.success("Profile updated!");
            router.refresh();
            router.push("/profile");
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/50">Edit Profile</h1>
                <p className="text-white/50">Refine your digital persona.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 p-8 rounded-3xl bg-[#121212]/50 border border-white/5 backdrop-blur-xl shadow-2xl">

                {/* 1. Avatar Dropzone */}
                <div className="space-y-2">
                    <ImageDropzone
                        value={avatar}
                        onChange={setAvatar}
                        label="Profile Visual"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* 2. Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 ml-1">Display Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="How should we call you?"
                            className="h-12 bg-black/40 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                        />
                    </div>

                    {/* 3. Handle/Username (Read Only usually, but let's keep name editable) */}
                    <div className="space-y-2 opacity-60 pointer-events-none">
                        <label className="text-sm font-medium text-white/70 ml-1">Username</label>
                        <Input
                            value={"@" + (user.username || "user")}
                            readOnly
                            className="h-12 bg-black/20 border-white/5 text-white/50 rounded-xl font-mono"
                        />
                    </div>
                </div>

                {/* 4. Bio Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 ml-1">About You</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world your vibe..."
                        className="w-full min-h-[120px] p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex-1 h-12 rounded-full hover:bg-white/5 text-white/60 hover:text-white"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <MagneticButton className="flex-1">
                        <Button
                            type="submit"
                            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-black font-bold text-lg shadow-[0_0_20px_rgba(30,215,96,0.3)] hover:shadow-[0_0_30px_rgba(30,215,96,0.5)] transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </MagneticButton>
                </div>
            </form>
        </div>
    );
}
