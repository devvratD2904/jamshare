import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Music, Headphones, Users, Share2, PlayCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-white">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl text-[var(--spotify-green)]">
              JamShare
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-[var(--spotify-light-gray)] sm:text-2xl">
              The ultimate hub to share, discover, and join Spotify Jams.
              Connect with music lovers worldwide.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                <PlayCircle className="mr-2 h-6 w-6" />
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                Browse Jams
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-lg bg-[var(--spotify-dark-gray)] p-6 transition-transform hover:scale-105">
              <div className="rounded-full bg-[var(--spotify-gray)] p-4 text-[var(--spotify-green)]">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Share Links</h3>
              <p className="text-[var(--spotify-light-gray)]">
                Paste your Spotify Jam link and tag it by genre, mood, or artist.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 rounded-lg bg-[var(--spotify-dark-gray)] p-6 transition-transform hover:scale-105">
              <div className="rounded-full bg-[var(--spotify-gray)] p-4 text-[var(--spotify-green)]">
                <Headphones className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Discover Music</h3>
              <p className="text-[var(--spotify-light-gray)]">
                Find active jams that match your vibe. Random or filtered.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 rounded-lg bg-[var(--spotify-dark-gray)] p-6 transition-transform hover:scale-105">
              <div className="rounded-full bg-[var(--spotify-gray)] p-4 text-[var(--spotify-green)]">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Join Community</h3>
              <p className="text-[var(--spotify-light-gray)]">
                Connect with others, track your history, and build your profile.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--spotify-gray)] bg-black py-8">
        <div className="container mx-auto px-4 text-center text-[var(--spotify-light-gray)]">
          <p>© 2024 JamShare. Not affiliated with Spotify.</p>
        </div>
      </footer>
    </div>
  );
}
