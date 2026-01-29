'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { Mic, MicOff, Activity } from 'lucide-react';

interface KaraokeSessionProps {
    isRecording: boolean;
    onToggleRecording: () => void;
    trackData: Uint8Array | null; // Data from the music track
}

export function KaraokeSession({ isRecording, onToggleRecording, trackData }: KaraokeSessionProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationRef = useRef<number | null>(null);

    // Score state
    const [matchScore, setMatchScore] = useState(0);

    useEffect(() => {
        if (isRecording) {
            startMicrophone();
        } else {
            stopMicrophone();
        }

        return () => {
            stopMicrophone();
        };
    }, [isRecording]);

    const startMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const microphone = audioCtx.createMediaStreamSource(stream);
            microphoneRef.current = microphone;
            microphone.connect(analyser);

            draw();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            // In a real app, handle error UI
        }
    };

    const stopMicrophone = () => {
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
            microphoneRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const calculateMatch = (micData: Uint8Array, trackBuffer: Uint8Array | null) => {
        if (!trackBuffer) return 0;

        let matchCount = 0;
        const len = micData.length;

        // Simple comparison logic: Check if peaks align roughly
        for (let i = 0; i < len; i++) {
            // If both have significant energy in this bin
            if (micData[i] > 50 && trackBuffer[i] > 50) {
                const diff = Math.abs(micData[i] - trackBuffer[i]);
                if (diff < 50) {
                    matchCount++;
                }
            }
        }

        // Normalize somewhat
        const score = Math.min(100, Math.floor((matchCount / (len * 0.3)) * 100));
        return score;
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

            // Calculate Score if track is playing
            if (trackData) {
                const currentScore = calculateMatch(dataArray, trackData);
                // Smooth the score update
                setMatchScore(prev => prev + (currentScore - prev) * 0.1);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / bufferLength) * 2.5;
            let x = 0;

            // Draw Microphone Data
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                // User Voice Color - Bright Pink/Orange to contrast with Green
                ctx.fillStyle = `rgb(255, ${100 + (barHeight / height) * 100}, 50)`;

                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 2;
            }

            // Draw Outline of Track Data (Ghost) behind? 
            // Optional: visualization overlay handled in AnalysisVisualizer mostly.
            // But let's keep this clean for just user input.

            animationRef.current = requestAnimationFrame(render);
        };
        render();
    };

    return (
        <div className="w-full flex flex-col items-center space-y-6">

            {/* Action Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleRecording}
                    className={cn(
                        "relative group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl",
                        isRecording
                            ? "bg-red-500 text-white animate-pulse shadow-red-500/40"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/30"
                    )}
                >
                    {isRecording ? (
                        <>
                            <MicOff className="w-6 h-6" />
                            <span>Stop Singing</span>
                        </>
                    ) : (
                        <>
                            <Mic className="w-6 h-6" />
                            <span>Start Karaoke</span>
                        </>
                    )}
                </button>
            </div>

            {/* Score Display */}
            {isRecording && (
                <div className="flex flex-col items-center space-y-2 animate-in fade-in slide-in-from-bottom-4">
                    <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
                        Vocal Match
                    </span>
                    <div className="relative flex items-center justify-center w-32 h-32">
                        {/* Circle Graph */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="64" cy="64" r="60" fill="none" stroke="#333" strokeWidth="8" />
                            <circle
                                cx="64" cy="64" r="60"
                                fill="none"
                                stroke={matchScore > 70 ? "#22c55e" : matchScore > 40 ? "#eab308" : "#ef4444"}
                                strokeWidth="8"
                                strokeDasharray={377} // 2 * pi * 60
                                strokeDashoffset={377 - (377 * matchScore) / 100}
                                className="transition-all duration-300 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="text-3xl font-bold text-white">
                            {Math.round(matchScore)}%
                        </div>
                    </div>
                </div>
            )}

            {/* Microphone Visualizer (Optional Small Preview) */}
            {isRecording && (
                <div className="w-full h-24 bg-black/20 rounded-xl overflow-hidden border border-white/5">
                    <canvas ref={canvasRef} width={400} height={100} className="w-full h-full opacity-60" />
                </div>
            )}
        </div>
    );
}
