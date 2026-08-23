import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/header/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "実験室で使えるちょっと便利な計算ツール",
  description: "実験計画法の計算もできます",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <header>
            <Header />
          </header>
          <div className="flex min-h-screen bg-zinc-50">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <main className="flex min-h-screen w-full flex-col items-center py-16 px-8 bg-white sm:items-start">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
