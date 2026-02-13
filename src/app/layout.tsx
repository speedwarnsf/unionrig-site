import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Union Rig -- Trust what works.",
  description:
    "Union Rig is a mono-in, stereo-out guitar instrument. 12 sounds, 2 scenes each, a performance looper, and nothing you don't need.",
  openGraph: {
    title: "Union Rig",
    description: "Trust what works.",
    url: "https://unionrig-site.vercel.app",
    siteName: "Union Rig",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
