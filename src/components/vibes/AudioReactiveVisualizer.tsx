'use client';

import { useEffect, useRef } from 'react';

interface AudioReactiveVisualizerProps {
    stream: MediaStream | null;
}

export function AudioReactiveVisualizer({ stream }: AudioReactiveVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const audioContextRef = useRef<AudioContext>();
    const analyserRef = useRef<AnalyserNode>();
    const sourceRef = useRef<MediaStreamAudioSourceNode>();

    useEffect(() => {
        if (!stream) return;

        const initAudio = () => {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 1024; // High resolution
            analyser.smoothingTimeConstant = 0.85; // Smooth transitions
            analyserRef.current = analyser;

            // Create source from the passed stream
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;

            // Note: We do NOT connect to audioCtx.destination to avoid feedback loops 
            // (since the user is already hearing the system audio).

            draw();
        };

        const draw = () => {
            if (!canvasRef.current || !analyserRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            // Focus on bass/mids (lower frequencies)
            const meaningfulLength = Math.floor(bufferLength * 0.6);
            const barWidth = (width / meaningfulLength) * 0.8;

            const centerX = width / 2;

            // Spotify Green Gradient
            const gradient = ctx.createLinearGradient(0, height / 2 - 200, 0, height / 2 + 200);
            gradient.addColorStop(0, "rgba(30, 215, 96, 0)");
            gradient.addColorStop(0.5, "#1ED760");
            gradient.addColorStop(1, "rgba(30, 215, 96, 0)");

            ctx.fillStyle = gradient;

            for (let i = 0; i < meaningfulLength; i++) {
                const value = dataArray[i];
                const percent = value / 255;
                const barHeight = (height * 0.6) * percent;

                if (barHeight > 2) {
                    const xOffset = i * (barWidth + 2);

                    ctx.beginPath();
                    // Right Side
                    ctx.roundRect(centerX + xOffset, (height - barHeight) / 2, barWidth, barHeight, 50);
                    // Left Side
                    ctx.roundRect(centerX - xOffset - barWidth, (height - barHeight) / 2, barWidth, barHeight, 50);
                    ctx.fill();
                }
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        initAudio();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (sourceRef.current) sourceRef.current.disconnect();
            // We do NOT stop the stream here, the parent controls that.
        };
    }, [stream]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
}
