import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0b0e12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://unionrig-site.vercel.app"),
  title: "UNION RIG | Modular Camera Rig System",
  description:
    "UNION RIG is a modular camera rig system built for fast reconfiguration, balanced handheld work, and clean on-set builds. 15mm LWS, NATO rails, ARRI compatible.",
  keywords: [
    "modular camera rig",
    "camera rig system",
    "cinema rig",
    "15mm LWS",
    "ARRI",
    "NATO rail",
    "on set camera support",
    "camera cage",
    "shoulder rig",
    "handheld rig",
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
    locale: "en_US",
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
    googleBot: {
      index: true,
      follow: true,
    },
  },
  authors: [{ name: "Union Rig" }],
  creator: "Union Rig",
  publisher: "Union Rig",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UNION RIG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${archivo.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
