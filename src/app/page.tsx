'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroVisualizer from '@/components/landing/HeroVisualizer';
import { WaveformVisualizer } from '@/components/landing/WaveformVisualizer';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Music, Radio, Zap, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Intro Animation
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.from(".wave-visualizer", {
        scaleY: 0,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
      })
        .from(".hero-text-char", {
          y: 200,
          opacity: 0,
          skewY: 10,
          duration: 1.5,
          stagger: 0.05,
        }, "-=0.5")
        .from(".hero-subtitle", {
          y: 30,
          opacity: 0,
          duration: 1,
        }, "-=1")
        .from(".hero-cta-group", {
          scale: 0.9,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        }, "-=0.8");

      // Scroll Triggers for Features
      gsap.utils.toArray('.feature-card').forEach((card: any, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 50,
          opacity: 0,
          duration: 1,
          delay: i * 0.1,
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleAuthNavigation = () => {
    // Phase 1: Direct to login for all auth actions as requested
    router.push('/login');
  };

  return (
    <main ref={containerRef} className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden">
      <HeroVisualizer />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 text-center pt-20">

        {/* Top Visualizer */}
        <div className="wave-visualizer mb-8">
          <WaveformVisualizer barCount={40} height="100px" className="mix-blend-screen" />
        </div>

        <div className="overflow-hidden mb-8 select-none max-w-5xl mx-auto">
          <h1 ref={titleRef} className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[1.1] md:leading-[1] mix-blend-exclusion">
            <span className="hero-text-char block md:inline-block mr-0 md:mr-4">JamShare, </span>
            <br className="hidden md:block" />
            <span className="hero-text-char block md:inline-block text-primary mr-0 md:mr-4">Live</span>
            <span className="hero-text-char block md:inline-block mb-5">Together</span>
          </h1>
        </div>

        <p className="hero-subtitle text-lg md:text-2xl text-white/70 max-w-2xl mb-12 font-light leading-relaxed">
          Create your jam, invite your friends, and vibe to music in real-time.
          Your soundtrack, your crew, your space.
        </p>

        <div className="hero-cta-group flex flex-col sm:flex-row items-center gap-6">
          <MagneticButton onClick={handleAuthNavigation} variant="primary">
            <Play className="w-5 h-5 fill-current" />
            <span className="ml-2">Start a Jam</span>
          </MagneticButton>

          <MagneticButton onClick={handleAuthNavigation} variant="secondary">
            <Radio className="w-5 h-5" />
            <span className="ml-2">Join Live Jams</span>
          </MagneticButton>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce opacity-80">
          <span className="text-xs uppercase tracking-[0.3em] text-white/80">Scroll to Discover</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 w-full py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Music className="w-8 h-8 text-primary" />}
            title="Live Sync"
            description="Low-latency audio streaming for seamless jam sessions across the globe."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-secondary" />}
            title="Instant Flow"
            description="Jump into a room and start playing. No setup, just raw creative output."
          />
          <FeatureCard
            icon={<Radio className="w-8 h-8 text-white" />}
            title="Discovery"
            description="Find your tribe. Browse active jams visually and join with one click."
          />
        </div>
      </section>

      <div className="min-h-[50vh] w-full flex items-center justify-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-black text-white/10 uppercase tracking-widest text-center px-4">
          More Coming Soon
        </h2>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="feature-card group p-8 rounded-3xl bg-surface border border-white/5 hover:border-white/20 transition-all duration-500 hover:bg-surface-hover backdrop-blur-md">
      <div className="mb-6 p-4 rounded-full bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}
