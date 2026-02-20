import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const siteUrl = "https://unionrig.com";

export const metadata: Metadata = {
  title: {
    default: "Union Rig -- Trust what works.",
    template: "%s -- Union Rig",
  },
  description:
    "Union Rig is a mono-in, stereo-out guitar instrument. 12 sounds, 2 scenes each, a performance looper, and nothing you don't need. $849, shipping 2026.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Union Rig",
    description:
      "Mono-in, stereo-out guitar instrument. 12 sounds, 2 scenes each, a performance looper, and nothing you don't need. Trust what works.",
    url: siteUrl,
    siteName: "Union Rig",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Union Rig -- Trust what works.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Union Rig -- Trust what works.",
    description:
      "Mono-in, stereo-out guitar instrument. 12 sounds, 2 scenes each, a performance looper. $849, shipping 2026.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Union Rig",
  description:
    "Mono-in, stereo-out guitar instrument. 12 sounds, 2 scenes each, a performance looper, and nothing you don't need.",
  brand: { "@type": "Brand", name: "Union Rig" },
  url: siteUrl,
  image: `${siteUrl}/images/union-logo.png`,
  offers: {
    "@type": "Offer",
    price: "849",
    priceCurrency: "USD",
    availability: "https://schema.org/PreOrder",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
