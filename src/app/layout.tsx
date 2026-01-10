import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header/header";
import { NaviBar } from "@/components/layout/header/navibar";
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
  title: "ちょっと便利な計算ツール",
  description: "こんな計算できたらいいなっと思うことをサイトにしました",
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
        <header>
          <Header />
        </header>
        <div className="flex min-h-screen bg-zinc-50">
          <div className="w-1/5 mt-5">
            <NaviBar />
          </div>
          <div className="w-3/5">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-8 bg-white sm:items-start">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
