"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const position = searchParams.get("pos") || "";
  const [copied, setCopied] = useState(false);

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}?ref=${code}`
      : "";

  const shareText = `I just joined the Union Rig waitlist -- an AI-driven guitar instrument shipping 2027. Join me: ${referralUrl}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      style={{
        minHeight: "80svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 300,
          marginBottom: 16,
          letterSpacing: "-0.02em",
        }}
      >
        You are on the list.
      </h1>

      {position && (
        <p
          style={{
            color: "var(--fg-dim)",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          Position #{position}
        </p>
      )}

      <p
        style={{
          color: "var(--fg-dim)",
          fontSize: 15,
          maxWidth: 480,
          lineHeight: 1.6,
          marginBottom: 48,
        }}
      >
        We will reach out when Union Rig is ready. Share your referral link to
        move up the list and get priority access.
      </p>

      {/* Referral code display */}
      {code && (
        <div style={{ marginBottom: 48, width: "100%", maxWidth: 480 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              marginBottom: 12,
            }}
          >
            Your referral link
          </p>
          <div
            style={{
              display: "flex",
              gap: 0,
              width: "100%",
            }}
          >
            <input
              readOnly
              value={referralUrl}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
                fontSize: 13,
                fontFamily: "monospace",
                outline: "none",
              }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={copyLink}
              style={{
                padding: "12px 20px",
                background: copied ? "#4a6" : "var(--accent)",
                color: "var(--bg)",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Share buttons */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 24px",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            transition: "border-color 0.2s",
          }}
        >
          Share on X
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 24px",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            transition: "border-color 0.2s",
          }}
        >
          Share on Facebook
        </a>
        <a
          href={`mailto:?subject=Check out Union Rig&body=${encodeURIComponent(shareText)}`}
          style={{
            padding: "10px 24px",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            transition: "border-color 0.2s",
          }}
        >
          Send Email
        </a>
      </div>

      {/* Back link */}
      <a
        href="/"
        style={{
          marginTop: 64,
          color: "var(--fg-dim)",
          fontSize: 13,
          textDecoration: "none",
          letterSpacing: "0.04em",
        }}
      >
        Back to Union Rig
      </a>
    </section>
  );
}

export default function ThankYouPage() {
  return (
    <>
      <Nav />
      <Suspense
        fallback={
          <div style={{ minHeight: "80svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--fg-dim)" }}>Loading...</p>
          </div>
        }
      >
        <ThankYouContent />
      </Suspense>
      <Footer />
    </>
  );
}
