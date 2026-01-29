'use client';

import { useState } from 'react';
import { AudioReactiveVisualizer } from '@/components/vibes/AudioReactiveVisualizer';
import { Button } from '@/components/ui/Button';
import { Music, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function VibesPage() {
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startVibing = async () => {
        try {
            const newStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                }
            });

            if (newStream.getAudioTracks().length === 0) {
                toast.error("No audio detected! Please check 'Share Audio' in the pop-up.");
                newStream.getTracks().forEach(t => t.stop());
                return;
            }

            setStream(newStream);

            // Detect if user stops sharing via browser UI
            newStream.getVideoTracks()[0].onended = () => {
                stopVibing(newStream);
            };

        } catch (err) {
            console.error(err);
            toast.error("Failed to start vibing. Selection cancelled?");
        }
    };

    const stopVibing = (activeStream = stream) => {
        if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
    };

    return (
        <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col items-center justify-center">

            {/* Background Vibe Visualizer */}
            {stream && <AudioReactiveVisualizer stream={stream} />}

            {/* Content Overlay */}
            <div className={`relative z-10 transition-all duration-700 ${stream ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>

                {!stream ? (
                    <div className="text-center space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(140,45,226,0.2)] mb-4">
                            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20">
                            VIBE CHECK
                        </h1>

                        <p className="text-xl text-white/50 max-w-lg mx-auto font-light leading-relaxed">
                            To visualize <strong>Spotify Desktop App</strong>, you must share your <br />
                            <span className="text-white font-medium">Entire Screen</span> and check "Share System Audio".
                            <br /><br />
                            <span className="text-sm opacity-70">
                                (Sharing a specific "Window" often blocks audio. <br />
                                For best results, use Spotify Web Player and share that Tab.)
                            </span>
                        </p>

                        <Button
                            onClick={startVibing}
                            className="bg-primary text-black hover:bg-white hover:scale-110 transition-all duration-300 rounded-full px-12 py-8 text-xl font-bold shadow-[0_0_30px_rgba(45,226,120,0.4)]"
                        >
                            <Music className="w-6 h-6 mr-3" />
                            Select Audio Source
                        </Button>

                        <p className="text-xs text-white/30 pt-4">
                            <strong>Note:</strong> Windows/Mac security requires "Entire Screen" for desktop audio.
                        </p>
                    </div>
                ) : (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                        <Button
                            variant="ghost"
                            onClick={() => stopVibing()}
                            className="bg-black/20 backdrop-blur-md border border-white/5 text-white/40 hover:text-white rounded-full px-6"
                        >
                            Stop
                        </Button>
                    </div>
                )}
            </div>

            {/* Decorative Gradient if not vibing */}
            {!stream && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-0 pointer-events-none" />
            )}
        </div>
    );
}
