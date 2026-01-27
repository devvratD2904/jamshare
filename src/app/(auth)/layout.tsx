export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tighter text-[var(--spotify-green)]">
                    JamShare
                </h1>
            </div>
            {children}
        </div>
    );
}
