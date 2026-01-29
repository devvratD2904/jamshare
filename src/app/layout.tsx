import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MotionWrapper from "@/components/design-system/MotionWrapper";
import AuthProvider from "@/components/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JamShare | The Neon Void",
  description: "Experience music like never before. A motion-first collaborative jam platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#030305]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <MotionWrapper>
            {children}
          </MotionWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
