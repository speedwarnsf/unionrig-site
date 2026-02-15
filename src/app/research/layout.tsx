import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research",
  description: "Interactive DSP research and signal chain experimentation for Union Rig.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
