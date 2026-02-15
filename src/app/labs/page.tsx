"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import SignalChainView from "@/components/SignalChainView";
import SoundBrowser from "@/components/SoundBrowser";
import PresetCompare from "@/components/PresetCompare";
import AmpSimulator from "@/components/AmpSimulator";
import Tuner from "@/components/Tuner";
import RigSharing from "@/components/RigSharing";
import RandomizeRig from "@/components/RandomizeRig";
import PedalboardLayout from "@/components/PedalboardLayout";
import IRLoader from "@/components/IRLoader";
import SignalPathPreview from "@/components/SignalPathPreview";
import UserAccounts from "@/components/UserAccounts";
import PrintRigSheet from "@/components/PrintRigSheet";
import CommunityGallery from "@/components/CommunityGallery";

export default function Labs() {
  return (
    <>
      <Nav />

      {/* ═══════ HEADER ═══════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "120px 24px 40px",
        }}
      >
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Labs
        </p>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 300,
            marginBottom: 16,
            letterSpacing: "-0.02em",
            textWrap: "balance",
          }}
        >
          DSP experiments and prototypes
        </h1>
        <p
          style={{
            color: "var(--fg-dim)",
            fontSize: 15,
            lineHeight: 1.7,
            maxWidth: 560,
            textWrap: "balance",
          }}
        >
          Everything here is experimental. These are working prototypes of signal
          processing ideas, tools, and interfaces we are exploring for Union Rig.
          Nothing is final. Everything is functional.
        </p>
      </section>

      {/* ═══════ SIGNAL CHAIN VIEW ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Interactive Signal Chain
          </p>
          <p
            style={{
              color: "var(--fg-dim)",
              fontSize: 14,
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 32,
              textWrap: "balance",
            }}
          >
            Drag to reorder the signal flow. See how stage ordering affects the output.
          </p>
          <SignalChainView interactive />
        </ScrollReveal>
      </section>

      {/* ═══════ SOUND BROWSER ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Sound Browser
          </p>
          <SoundBrowser />
        </ScrollReveal>
      </section>

      {/* ═══════ PRESET COMPARE ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Preset Compare
          </p>
          <PresetCompare />
        </ScrollReveal>
      </section>

      {/* ═══════ AMP SIMULATOR ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Amp Simulator
          </p>
          <p
            style={{
              color: "var(--fg-dim)",
              fontSize: 14,
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 32,
              textWrap: "balance",
            }}
          >
            Choose your amp model and dial in the EQ. Clean sparkle, British crunch, or full high-gain saturation.
          </p>
          <AmpSimulator />
        </ScrollReveal>
      </section>

      {/* ═══════ CHROMATIC TUNER ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Chromatic Tuner
          </p>
          <p
            style={{
              color: "var(--fg-dim)",
              fontSize: 14,
              lineHeight: 1.7,
              maxWidth: 480,
              marginBottom: 32,
              textWrap: "balance",
            }}
          >
            Built-in tuner using your microphone. No external apps needed.
          </p>
          <Tuner />
        </ScrollReveal>
      </section>

      {/* ═══════ PEDALBOARD LAYOUT ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Pedalboard Layout
          </p>
          <PedalboardLayout />
        </ScrollReveal>
      </section>

      {/* ═══════ IR LOADER ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Cabinet IR Loader
          </p>
          <IRLoader />
        </ScrollReveal>
      </section>

      {/* ═══════ SIGNAL PATH PREVIEW ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Signal Path Preview
          </p>
          <SignalPathPreview />
        </ScrollReveal>
      </section>

      {/* ═══════ RANDOMIZE + SHARE ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Randomize and Share
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
            <RandomizeRig />
            <RigSharing />
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════ USER ACCOUNTS / SAVED RIGS ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Saved Rigs
          </p>
          <UserAccounts />
        </ScrollReveal>
      </section>

      {/* ═══════ PRINT RIG SHEET ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Print Rig Sheet
          </p>
          <PrintRigSheet />
        </ScrollReveal>
      </section>

      {/* ═══════ COMMUNITY GALLERY ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Community Gallery
          </p>
          <CommunityGallery />
        </ScrollReveal>
      </section>

      <Footer />
    </>
  );
}
