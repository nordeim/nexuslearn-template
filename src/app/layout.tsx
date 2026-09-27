import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Reference head parity (session 5): the live app ships ONE root description
 * on every route plus OpenGraph/Twitter cards, per-route canonicals, the
 * logo.png favicon, a manifest and the apple web-app metas. The canonical
 * origin comes from NEXT_PUBLIC_SITE_URL (fallback: localhost dev origin).
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const REFERENCE_DESCRIPTION =
  "SkillSphere is a dynamic online learning platform offering a wide range of courses, structured learning paths, and AI-powered study tools to empower students, creators, and instructors in shaping their future.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NexusLearn",
    template: "%s | NexusLearn",
  },
  description: REFERENCE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NexusLearn",
    description: REFERENCE_DESCRIPTION,
    url: siteUrl,
    type: "website",
    siteName: "NexusLearn",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "NexusLearn" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexusLearn",
    description: REFERENCE_DESCRIPTION,
    images: ["/logo.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "NexusLearn",
  },
  icons: {
    icon: "/logo.png",
  },
  manifest: "/manifest.json",
};

// The reference viewport is the plain `width=device-width, initial-scale=1.0`
// (unlimited pinch zoom). The earlier maximum-scale=5 cap was an a11y
// downgrade vs the reference and is deliberately dropped.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
