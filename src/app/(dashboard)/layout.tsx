import { ImmersiveNav } from "@/components/layout/ImmersiveNav";
import { Toaster } from "sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <ImmersiveNav />
            <main className="h-full pt-20">
                {children}
                <Toaster theme="dark" position="bottom-right" />
            </main>
        </div>
    );
}
