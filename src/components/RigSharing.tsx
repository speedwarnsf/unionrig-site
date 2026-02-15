"use client";

import { useState, useCallback, useEffect } from "react";

// Encodes rig settings into a compact URL-safe string
function encodeRig(settings: Record<string, number | string>): string {
  const json = JSON.stringify(settings);
  // Base64 encode
  if (typeof window !== "undefined") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return "";
}

function decodeRig(encoded: string): Record<string, number | string> | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function RigSharing() {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadedRig, setLoadedRig] = useState<Record<string, number | string> | null>(null);

  // Check URL on mount for shared rig
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const rigData = params.get("rig");
    if (rigData) {
      const decoded = decodeRig(rigData);
      if (decoded) setLoadedRig(decoded);
    }
  }, []);

  const generateShareUrl = useCallback(() => {
    // Capture current "rig" state - simulated example settings
    const settings: Record<string, number | string> = {
      sound: "Velvet Static",
      scene: "A",
      touch: 0.5,
      heat: 0,
      body: 0.5,
      motion: 0.3,
      depth: 0.3,
      amp: "crunch",
      gain: 0.5,
      bass: 0.5,
      mid: 0.6,
      treble: 0.5,
    };

    const encoded = encodeRig(settings);
    const url = `${window.location.origin}${window.location.pathname}?rig=${encoded}`;
    setShareUrl(url);
    setCopied(false);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  return (
    <div style={{
      border: "1px solid #2a2725",
      padding: "20px 24px",
      maxWidth: 480,
      margin: "0 auto",
      background: "var(--surface, #141210)",
    }}>
      <div style={{
        fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "#5a5650", marginBottom: 16, fontWeight: 600,
      }}>SHARE YOUR RIG</div>

      {/* Loaded rig notification */}
      {loadedRig && (
        <div style={{
          background: "rgba(201,185,154,0.08)",
          border: "1px solid rgba(201,185,154,0.2)",
          padding: "12px 16px",
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, color: "#c9b99a", fontWeight: 600, marginBottom: 4 }}>
            Shared rig loaded
          </div>
          <div style={{ fontSize: 10, color: "#8a8278" }}>
            Sound: {loadedRig.sound as string} | Scene {loadedRig.scene as string}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={generateShareUrl}
          style={{
            background: "none",
            border: "1px solid var(--accent, #c9b99a)",
            color: "var(--accent, #c9b99a)",
            padding: "8px 20px",
            fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: 600, borderRadius: 0,
            whiteSpace: "nowrap",
          }}
        >Generate Link</button>

        {shareUrl && (
          <button
            onClick={copyToClipboard}
            style={{
              background: copied ? "var(--accent, #c9b99a)" : "none",
              border: "1px solid var(--accent, #c9b99a)",
              color: copied ? "#0a0a0a" : "var(--accent, #c9b99a)",
              padding: "8px 20px",
              fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: "pointer", fontWeight: 600, borderRadius: 0,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >{copied ? "Copied" : "Copy URL"}</button>
        )}
      </div>

      {shareUrl && (
        <div style={{
          marginTop: 12,
          background: "#0a0908",
          border: "1px solid #2a2725",
          padding: "8px 12px",
          fontSize: 10,
          color: "#5a5650",
          wordBreak: "break-all",
          fontFamily: "monospace",
        }}>{shareUrl}</div>
      )}
    </div>
  );
}
