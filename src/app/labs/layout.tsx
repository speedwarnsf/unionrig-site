import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "DSP experiments and prototypes for Union Rig. Interactive signal chain, sound browser, amp simulator, tuner, and more.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
