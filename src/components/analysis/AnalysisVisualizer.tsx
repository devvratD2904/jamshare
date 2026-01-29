'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface AnalysisVisualizerProps {
    audioUrl: string | null;
    className?: string;
    isKaraokeMode?: boolean;
    onFrequencyUpdate?: (data: Uint8Array) => void;
}

export function AnalysisVisualizer({ audioUrl, className, isKaraokeMode = false, onFrequencyUpdate }: AnalysisVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<number | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!audioUrl) return;

        // Cleanup previous audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.crossOrigin = "anonymous";
        audio.loop = false; // Or true if loop is desired

        // Setup Web Audio API
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaElementSource(audio);
        sourceRef.current = source;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        audio.addEventListener('play', () => {
            setIsPlaying(true);
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            draw();
        });

        audio.addEventListener('pause', () => setIsPlaying(false));
        audio.addEventListener('ended', () => setIsPlaying(false));

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            audio.pause();
            audio.src = '';
            audioContextRef.current?.close();
        };
    }, [audioUrl]);

    // Handle Play/Pause externally if needed or via ref, but for now we expose controls in UI
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            analyserRef.current!.getByteFrequencyData(dataArray);

            // Notify parent for karaoke comparison
            if (onFrequencyUpdate) {
                onFrequencyUpdate(dataArray);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                // Gradient Logic
                const gradient = ctx.createLinearGradient(0, height, 0, 0);
                if (isKaraokeMode) {
                    gradient.addColorStop(0, '#22c55e'); // Green
                    gradient.addColorStop(0.5, '#3b82f6'); // Blue
                    gradient.addColorStop(1, '#a855f7'); // Purple
                } else {
                    gradient.addColorStop(0, '#1db954'); // Spotify Green
                    gradient.addColorStop(1, '#ffffff'); // White top
                }

                ctx.fillStyle = gradient;

                // Rounded tops for bars
                ctx.beginPath();
                ctx.roundRect(x, height - barHeight, barWidth, barHeight, 4);
                ctx.fill();

                x += barWidth + 2; // Spacing
            }

            if (isPlaying) {
                animationRef.current = requestAnimationFrame(render);
            }
        };
        render();
    };

    return (
        <div className={cn("relative w-full flex flex-col items-center space-y-4", className)}>
            <div className="relative w-full h-64 bg-black/40 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-xl">
                {/* Visualizer Canvas */}
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="w-full h-full object-cover opacity-90"
                />

                {/* Overlay Text when empty or paused */}
                {!isPlaying && audioUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/60 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                            <p className="text-white/80 font-medium">Paused</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            {audioUrl && (
                <button
                    onClick={togglePlay}
                    className={cn(
                        "px-8 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 transform active:scale-95 shadow-lg",
                        isPlaying
                            ? "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20"
                            : "bg-green-500 text-black hover:bg-green-400 hover:shadow-green-500/25"
                    )}
                >
                    {isPlaying ? "PAUSE" : "PLAY TRACK"}
                </button>
            )}
        </div>
    );
}
