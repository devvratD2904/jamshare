import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="p-8 space-y-8 h-full bg-gradient-to-b from-[var(--spotify-black)] to-[var(--background)]">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-[var(--spotify-gray)]" />
                    <Skeleton className="h-4 w-64 bg-[var(--spotify-gray)]" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full bg-[var(--spotify-gray)]" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-[var(--spotify-dark-gray)] p-4 space-y-4 border border-transparent">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4 bg-[var(--spotify-gray)]" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-full bg-[var(--spotify-gray)]" />
                                <Skeleton className="h-4 w-24 bg-[var(--spotify-gray)]" />
                            </div>
                        </div>
                        <Skeleton className="h-16 w-full bg-[var(--spotify-gray)]" />
                        <div className="pt-4 mt-auto flex justify-between items-center">
                            <Skeleton className="h-4 w-16 bg-[var(--spotify-gray)]" />
                            <Skeleton className="h-8 w-24 rounded-full bg-[var(--spotify-gray)]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
