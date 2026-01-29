'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WaveformVisualizer } from '@/components/landing/WaveformVisualizer';
import { ArrowLeft, Music, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateJamPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [spotifyJamUrl, setSpotifyJamUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/jams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    spotifyJamUrl
                }),
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || 'Failed to create jam');
            }

            const data = await res.json();
            toast.success('Jam Session Created! 🎵');

            // Redirect to the new Jam Room
            router.push(`/jams/${data.id}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to start the jam');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-6 overflow-hidden">

            {/* Background Layer - Waveform */}
            <div className="absolute inset-x-0 bottom-0 z-0 flex items-end justify-center h-[60vh] pointer-events-none">
                <WaveformVisualizer
                    barCount={140}
                    height="450px"
                    opacity={0.4}
                    className="w-full h-full pb-0 items-end gap-0.5 px-0 text-primary mix-blend-screen"
                    barClassName="flex-1 rounded-t-full"
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full max-w-xl">

                {/* Glass Card Form */}
                <div className="p-8 rounded-3xl bg-[#121212]/60 backdrop-blur-xl border border-white/10 shadow-2xl">

                    {/* Header: Centered Title + Left-Aligned Back Button */}
                    <div className="relative flex items-center justify-center mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="absolute left-0 p-0 hover:bg-transparent text-white/50 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight text-white text-center">Start a Jam</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70 ml-1">Jam Name</label>
                            <div className="relative">
                                <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Chill Lo-Fi Beats"
                                    className="h-14 pl-12 bg-black/40 border-white/10 text-lg rounded-2xl focus:border-primary/50 focus:ring-primary/20"
                                    required
                                    minLength={5}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70 ml-1">Vibe Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What are we listening to? Set the mood..."
                                className="w-full min-h-[120px] p-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                            />
                        </div>

                        {/* Spotify Link Field (Replaces Privacy) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70 ml-1">Spotify Jam Link</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1ED760]" />
                                <Input
                                    value={spotifyJamUrl}
                                    onChange={(e) => setSpotifyJamUrl(e.target.value)}
                                    placeholder="Paste your Spotify Jam link here..."
                                    className="h-14 pl-12 bg-black/40 border-white/10 text-lg rounded-2xl focus:border-[#1ED760]/50 focus:ring-[#1ED760]/20 placeholder:text-white/20"
                                    required
                                    type="url"
                                />
                            </div>
                            <p className="text-xs text-white/40 ml-1">
                                Need a link? Open Spotify {'>'} Start a Jam {'>'} Copy Link
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-black font-bold text-xl shadow-[0_0_20px_rgba(30,215,96,0.3)] hover:shadow-[0_0_30px_rgba(30,215,96,0.5)] transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? "Starting..." : "Start Jamming"}
                            </Button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}
