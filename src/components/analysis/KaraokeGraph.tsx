'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface KaraokeGraphProps {
    pitchCurve: Float32Array | null; // The green line (song)
    userPitchPoints: { time: number; value: number }[]; // The purple line (user)
    currentTime: number; // Current playback time
    duration: number; // Total duration
    isPlaying: boolean;
    className?: string;
}

export function KaraokeGraph({
    pitchCurve,
    userPitchPoints,
    currentTime,
    duration,
    isPlaying,
    className
}: KaraokeGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    // Constants for rendering
    const PIXELS_PER_SECOND = 100; // Speed of scrolling
    const SAMPLES_PER_SECOND = 20; // Must match extractPitchCurve

    useEffect(() => {
        draw();
    }, [pitchCurve, userPitchPoints, currentTime, duration]);

    const draw = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container || !pitchCurve) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to handle long song width
        const totalWidth = duration * PIXELS_PER_SECOND;
        const visibleWidth = container.clientWidth;
        const height = container.clientHeight;

        if (canvas.width !== totalWidth) {
            canvas.width = totalWidth;
            canvas.height = height;
        }

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Grid / Background
        ctx.strokeStyle = '#ffffff10';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let t = 0; t < duration; t += 1) { // Every second
            const x = t * PIXELS_PER_SECOND;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        ctx.stroke();

        // 2. Draw Target Pitch Curve (GREEN)
        ctx.strokeStyle = '#22c55e'; // Green-500
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.beginPath();

        const stepX = PIXELS_PER_SECOND / SAMPLES_PER_SECOND;

        for (let i = 0; i < pitchCurve.length; i++) {
            const x = i * stepX;
            // Invert Y (1.0 is top, 0.0 is bottom)
            // But we want 0 (silence) to be bottom?? Actually 0.5 center.
            // Let's map 0-1 to height-0.

            // Only draw if not silence (0)
            if (pitchCurve[i] > 0.01) {
                const y = height - (pitchCurve[i] * height * 0.8) - (height * 0.1); // Padding
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            } else {
                ctx.moveTo(x, height); // Drop to bottom on silence
            }
        }
        ctx.stroke();

        // 3. Draw User Pitch (PURPLE)
        if (userPitchPoints.length > 0) {
            ctx.strokeStyle = '#a855f7'; // Purple-500
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();

            // Only draw recent points to avoid performance hit? 
            // Or draw all since canvas is wide.
            // Draw all for now.
            for (let i = 0; i < userPitchPoints.length; i++) {
                const point = userPitchPoints[i];
                const x = point.time * PIXELS_PER_SECOND;
                const val = point.value; // expected 0-1
                const y = height - (val * height * 0.8) - (height * 0.1);

                if (i === 0) ctx.moveTo(x, y);
                else {
                    // Check if jump is too big (silence gap), break line
                    const prevX = userPitchPoints[i - 1].time * PIXELS_PER_SECOND;
                    if (x - prevX > PIXELS_PER_SECOND * 0.5) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            }
            ctx.stroke();
        }
    };

    // Handle Scrolling via CSS transform on the canvas container or scrolling logic
    // We will translate the container wrapper
    const transformStyle = {
        transform: `translateX(${-currentTime * PIXELS_PER_SECOND + (containerRef.current?.clientWidth || 0) / 2}px)`,
        transition: isPlaying ? 'none' : 'transform 0.2s ease-out'
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-64 bg-black/40 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-sm shadow-xl", className)}
        >
            {/* Moving Canvas Container */}
            <div
                className="absolute top-0 left-0 h-full will-change-transform"
                style={transformStyle}
            >
                <canvas ref={canvasRef} />
            </div>

            {/* Center Playhead Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white shadow-[0_0_10px_white] z-10 opacity-70" />

            {/* Loading State */}
            {!pitchCurve && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-white/50">Analyzing Track...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
