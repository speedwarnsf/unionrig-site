import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CommunityGallery from "@/components/CommunityGallery";

export const metadata: Metadata = {
  title: "Community Rigs",
  description:
    "Browse, rate, and comment on rigs shared by Union Rig players. Discover new sounds from the community.",
};

export default function CommunityPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 96, paddingBottom: 80, minHeight: "100vh" }}>
        <CommunityGallery />
      </main>
      <Footer />
    </>
  );
}
