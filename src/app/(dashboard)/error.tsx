"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Something went wrong!</h2>
            <p className="text-[var(--spotify-light-gray)]">{error.message || "An unexpected error occurred."}</p>
            <Button
                variant="primary"
                onClick={() => reset()}
                className="rounded-full"
            >
                Try again
            </Button>
        </div>
    );
}
