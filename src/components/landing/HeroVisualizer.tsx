'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroVisualizer() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Create random floating orbs
            const orbs = Array.from({ length: 5 });

            orbs.forEach((_, i) => {
                const orb = document.createElement('div');
                orb.className = `absolute rounded-full blur-[80px] opacity-20`;

                // Random size
                const size = Math.random() * 300 + 100;
                orb.style.width = `${size}px`;
                orb.style.height = `${size}px`;

                // Colors: Alternate between Primary and Secondary
                const color = i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)';
                orb.style.backgroundColor = color;

                // Random initial position
                gsap.set(orb, {
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                });

                containerRef.current?.appendChild(orb);

                // Animate
                gsap.to(orb, {
                    x: `+=${Math.random() * 400 - 200}`,
                    y: `+=${Math.random() * 400 - 200}`,
                    scale: Math.random() * 0.5 + 0.8,
                    duration: Math.random() * 10 + 10,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
        />
    );
}
