import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { getSession } from "@/lib/session";
import { Suspense } from "react";
import type { Session } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NGOTRA - Professional Development Organization",
  description: "Professional development services including web development, app development, game development, Minecraft servers, mods, plugins and more.",
  keywords: ["web development", "app development", "game development", "minecraft", "mods", "plugins", "software"],
  authors: [{ name: "Ngotra" }],
  openGraph: {
    title: "NGOTRA - Professional Development Organization",
    description: "Your trusted partner for all development needs",
    type: "website",
    url: "https://ngotra.site",
  },
  twitter: {
    card: "summary_large_image",
    title: "NGOTRA - Professional Development Organization",
    description: "Your trusted partner for all development needs",
  },
};

interface Props {
  children: React.ReactNode;
}

async function getSiteSettings() {
  'use cache';
  const settingsRaw = await prisma.siteSetting.findMany();
  return Object.fromEntries(settingsRaw.map(s => [s.key, s.value]));
}

async function AuthShell({ sessionPromise, children }: { sessionPromise: Promise<Session | null>; children: React.ReactNode }) {
  const session = await sessionPromise;
  const siteSettings = await getSiteSettings();
  return <Layout user={session?.user || null} siteSettings={siteSettings}>{children}</Layout>;
}

export default async function RootLayout({ children }: Props) {
  const sessionPromise = getSession();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#05050a] text-white`}>
        <Suspense fallback={<div className="min-h-screen bg-[#05050a]" />}>
          <AuthShell sessionPromise={sessionPromise} children={children} />
        </Suspense>
      </body>
    </html>
  );
}
