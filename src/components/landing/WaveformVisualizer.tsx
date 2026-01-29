'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface WaveformVisualizerProps {
    barCount?: number;
    color?: string;
    className?: string;
    barClassName?: string;
    height?: string | number;
    width?: string | number;
    opacity?: number;
}

export function WaveformVisualizer({
    barCount = 50,
    color = '#2DE278',
    className = '',
    barClassName = 'w-1.5',
    height = '128px',
    width = '100%',
    opacity = 1.0,
}: WaveformVisualizerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const bars = containerRef.current.querySelectorAll('.wave-bar');

        bars.forEach((bar, index) => {
            const delay = 0;
            const duration = 0.5 + Math.random() * 0.5;

            gsap.to(bar, {
                scaleY: () => 0.3 + Math.random() * 0.7,
                duration,
                delay,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });
        });
    }, [barCount]);

    return (
        <div
            ref={containerRef}
            className={`flex justify-center gap-1 ${className}`}
            style={{ height, width }}
        >
            {Array.from({ length: barCount }).map((_, i) => (
                <div
                    key={i}
                    className={`wave-bar h-full rounded-full origin-bottom ${barClassName}`}
                    style={{
                        backgroundColor: color,
                        opacity: (0.6 + Math.random() * 0.4) * opacity,
                        height: '100%',
                        transform: 'scaleY(0.1)' // Initial state
                    }}
                />
            ))}
        </div>
    );
}
