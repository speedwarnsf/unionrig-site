import type { Metadata } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unionrig-site.vercel.app"),
  title: "UNION RIG | Modular Camera Rig System",
  description:
    "UNION RIG is a modular camera rig system built for fast reconfiguration, balanced handheld work, and clean on-set builds.",
  keywords: [
    "modular camera rig",
    "camera rig system",
    "cinema rig",
    "15mm LWS",
    "ARRI",
    "NATO rail",
    "on set camera support",
  ],
  alternates: {
    canonical: "https://unionrig-site.vercel.app",
  },
  openGraph: {
    title: "UNION RIG | Modular Camera Rig System",
    description:
      "Build a rig that moves with you. UNION RIG delivers fast swaps, balanced handheld control, and clean cable discipline.",
    url: "https://unionrig-site.vercel.app",
    siteName: "UNION RIG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UNION RIG | Modular Camera Rig System",
    description:
      "A modular camera rig system built for fast reconfiguration, balanced handheld work, and clean builds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${archivo.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
