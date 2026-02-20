import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
  description: "You're on the Union Rig waitlist. Share your referral link to move up the list.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
