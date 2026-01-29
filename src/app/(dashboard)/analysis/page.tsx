'use client';

import { useState, useRef, useEffect } from 'react';
import { MusicUploader } from "@/components/analysis/MusicUploader";
import { KaraokeGraph } from "@/components/analysis/KaraokeGraph";
import { Sparkles, ArrowLeft, Mic2, Play, Pause, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { decodeAudio, extractPitchCurve } from "@/lib/audio/pitchUtils";
import { cn } from "@/lib/utils";

export default function AnalysisPage() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Audio State
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [pitchCurve, setPitchCurve] = useState<Float32Array | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Karaoke State
    const [isKaraokeMode, setIsKaraokeMode] = useState(false);
    const [userPitchPoints, setUserPitchPoints] = useState<{ time: number, value: number }[]>([]);

    // Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef<number>(0);
    const rafRef = useRef<number | null>(null);

    // Microphone Refs
    const micStreamRef = useRef<MediaStream | null>(null);
    const micAnalyserRef = useRef<AnalyserNode | null>(null);
    const micRafRef = useRef<number | null>(null);


    const handleFileSelect = async (file: File | null) => {
        if (!file) {
            setAudioFile(null);
            return;
        }

        setAudioFile(file);
        setIsAnalyzing(true);

        try {
            const buffer = await decodeAudio(file);
            setAudioBuffer(buffer);

            const curve = extractPitchCurve(buffer);
            setPitchCurve(curve);

        } catch (err) {
            console.error("Analysis failed", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        pauseAudio();
        stopKaraoke();
        setAudioFile(null);
        setAudioBuffer(null);
        setPitchCurve(null);
        setCurrentTime(0);
        setUserPitchPoints([]);
    };

    // --- Audio Playback Control ---

    const togglePlay = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    };

    const playAudio = () => {
        if (!audioBuffer) return;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(0, currentTime);

        sourceRef.current = source;
        startTimeRef.current = ctx.currentTime - currentTime;

        setIsPlaying(true);

        // Loop for time update
        const update = () => {
            if (audioContextRef.current) {
                const t = audioContextRef.current.currentTime - startTimeRef.current;

                if (t >= audioBuffer.duration) {
                    pauseAudio();
                    setCurrentTime(0);
                    return;
                }

                setCurrentTime(t);
                rafRef.current = requestAnimationFrame(update);
            }
        };
        update();
    };

    const pauseAudio = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        setIsPlaying(false);
    };

    // --- Karaoke Microphone Logic ---

    const toggleKaraoke = () => {
        if (isKaraokeMode) {
            stopKaraoke();
        } else {
            startKaraoke();
        }
    };

    const startKaraoke = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser); // No destination to avoid feedback loop

            micAnalyserRef.current = analyser;
            setIsKaraokeMode(true);

            // Start analyzing mic pitch
            const analyzeMic = () => {
                if (!micAnalyserRef.current) return;

                const bufferLength = micAnalyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                micAnalyserRef.current.getByteTimeDomainData(dataArray);

                // Basic Pitch/Volume extraction for Demo Visuals
                // A real app would use YIN or auto-correlation here.
                // We'll use simple Zero-Crossing + Volume for "visual bounce"

                // reusing logic similar to pitchUtils but simpler for realtime byte array:
                let zeroCrossings = 0;
                let min = 128, max = 128;

                for (let i = 1; i < bufferLength; i++) {
                    const v1 = dataArray[i - 1] - 128;
                    const v2 = dataArray[i] - 128;
                    if ((v1 >= 0 && v2 < 0) || (v1 < 0 && v2 >= 0)) zeroCrossings++;
                    if (dataArray[i] < min) min = dataArray[i];
                    if (dataArray[i] > max) max = dataArray[i];
                }

                // Normalize "pitch" (0-1)
                const volume = (max - min) / 256;
                if (volume > 0.05) { // Threshold
                    const roughFreq = (zeroCrossings / bufferLength) * 5; // Scale for visual
                    const normalizedVal = Math.min(1, Math.max(0.1, roughFreq));

                    // Add point if playing (synced to song time) OR just append if checking mic
                    const t = isPlaying ? currentTime : Date.now() / 1000; // Use song time if playing

                    if (isPlaying) {
                        setUserPitchPoints(prev => [...prev, { time: t, value: normalizedVal }]);
                    }
                }

                micRafRef.current = requestAnimationFrame(analyzeMic);
            };
            analyzeMic();

        } catch (err) {
            console.error("Mic Error", err);
        }
    };

    const stopKaraoke = () => {
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop());
            micStreamRef.current = null;
        }
        if (micRafRef.current) {
            cancelAnimationFrame(micRafRef.current);
            micRafRef.current = null;
        }
        setIsKaraokeMode(false);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            handleReset();
        }
    }, []);


    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black p-8 pb-32">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Sparkles className="text-green-500 w-8 h-8" />
                            Music Analysis
                        </h1>
                        <p className="text-white/60 mt-2">
                            Karaoke Mode: Match the green frequency line!
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative min-h-[500px] w-full bg-white/5 rounded-[2rem] border border-white/5 p-8 backdrop-blur-sm shadow-2xl transition-all duration-500">

                    {!audioFile ? (
                        <div className="max-w-xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8">
                            <MusicUploader onFileSelect={handleFileSelect} />
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                            {/* Top Bar with File Info & Reset */}
                            <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Mic2 className="text-green-400 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg truncate max-w-[200px] md:max-w-md">
                                            {audioFile.name}
                                        </p>
                                        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
                                            {isAnalyzing ? "Analyzing Frequency..." : "Ready to Sing"}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="text-white/50 hover:text-white"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Change Track
                                </Button>
                            </div>

                            {/* Scrolling Graph */}
                            <div className="space-y-4">
                                <KaraokeGraph
                                    pitchCurve={pitchCurve}
                                    userPitchPoints={userPitchPoints}
                                    currentTime={currentTime}
                                    duration={audioBuffer?.duration || 0}
                                    isPlaying={isPlaying}
                                />
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center gap-4 pt-4 border-t border-white/5">
                                <button
                                    onClick={togglePlay}
                                    disabled={!audioBuffer}
                                    className={cn(
                                        "flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl",
                                        isPlaying
                                            ? "bg-white text-black hover:scale-105"
                                            : "bg-green-500 text-black hover:bg-green-400 hover:scale-105"
                                    )}
                                >
                                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                                    {isPlaying ? "PAUSE" : "PLAY TRACK"}
                                </button>

                                <button
                                    onClick={toggleKaraoke}
                                    className={cn(
                                        "flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl border",
                                        isKaraokeMode
                                            ? "bg-purple-500/20 border-purple-500 text-purple-300 animate-pulse"
                                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                    )}
                                >
                                    {isKaraokeMode ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                    {isKaraokeMode ? "STOP SINGING" : "START SINGING"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
