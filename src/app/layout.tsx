import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settingsRaw = await prisma.siteSetting.findMany();
  const settings = Object.fromEntries(settingsRaw.map((s: { key: string; value: string }) => [s.key, s.value]));
  const faviconUrl = settings['site_favicon_url'];
  const siteName = settings['site_name'] || 'NGOTRA';
  return {
    title: `${siteName} - Professional Development Organization`,
    description: 'Professional development services including web development, app development, game development, Minecraft servers, mods, plugins and more.',
    keywords: ['web development', 'app development', 'game development', 'minecraft', 'mods', 'plugins', 'software'],
    authors: [{ name: siteName }],
    icons: faviconUrl ? { icon: faviconUrl, apple: faviconUrl } : undefined,
    openGraph: {
      title: `${siteName} - Professional Development Organization`,
      description: 'Your trusted partner for all development needs',
      type: 'website',
      url: 'https://ngotra.site',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} - Professional Development Organization`,
      description: 'Your trusted partner for all development needs',
    },
  };
}

async function getSiteSettings() {
  const settingsRaw = await prisma.siteSetting.findMany();
  return Object.fromEntries(settingsRaw.map((s: { key: string; value: string }) => [s.key, s.value]));
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [siteSettings, session] = await Promise.all([
    getSiteSettings(),
    getSession(),
  ]);

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#05050a] text-white`}>
        <Suspense fallback={<div className="min-h-screen bg-[#05050a]" />}>
          <Layout user={session?.user || null} siteSettings={siteSettings}>{children}</Layout>
        </Suspense>
      </body>
    </html>
  );
}
