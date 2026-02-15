"use client";

import { useState, useCallback } from "react";

interface RigSheetData {
  name: string;
  scene: string;
  knobs: { label: string; value: string }[];
  chain: { name: string; active: boolean; params: string }[];
  notes: string;
}

const DEMO_RIG: RigSheetData = {
  name: "Velvet Static",
  scene: "A",
  knobs: [
    { label: "Touch", value: "50%" },
    { label: "Heat", value: "30%" },
    { label: "Body", value: "55%" },
    { label: "Depth", value: "45%" },
    { label: "Motion", value: "25%" },
    { label: "Tempo", value: "50%" },
  ],
  chain: [
    { name: "Dynamics", active: true, params: "Thresh: -22dB | Ratio: 2.5:1 | Attack: 18ms | Release: 220ms | Mix: 55%" },
    { name: "Drive", active: true, params: "Type: Tanh | Gain: 9dB | Asym: 0.25 | Tilt: -0.15 | LP: 8.5kHz | Mix: 65%" },
    { name: "Character", active: true, params: "Rate: 0.45Hz | Depth: 25% | Mix: 30% | Tone: -0.10" },
    { name: "Stereo", active: true, params: "Width: 55% | Micro-delay: 6.5ms" },
    { name: "Space", active: true, params: "Decay: 3.2s | Damp: 45% | Wet: 38% | Dry: 100%" },
    { name: "Cabinet", active: true, params: "Low Res: 110Hz | High Roll: 6.8kHz | Air: 30%" },
  ],
  notes: "",
};

export default function PrintRigSheet() {
  const [rig, setRig] = useState<RigSheetData>(DEMO_RIG);
  const [notes, setNotes] = useState("");

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div style={{ marginTop: 48 }}>
      <p style={{
        fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 12, fontWeight: 600,
      }}>Rig Sheet</p>
      <p style={{
        color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7,
        maxWidth: 480, marginBottom: 16,
      }}>
        Print-friendly view of your current rig settings. Add notes, then print or save as PDF.
      </p>

      <button
        onClick={handlePrint}
        style={{
          background: "none",
          border: "1px solid var(--accent)",
          color: "var(--accent)",
          padding: "8px 24px",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontWeight: 600,
          marginBottom: 24,
        }}
      >Print Rig Sheet</button>

      {/* Print-friendly sheet */}
      <div id="rig-sheet" style={{
        maxWidth: 560,
        margin: "0 auto",
        background: "#fff",
        color: "#111",
        padding: "32px",
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderBottom: "2px solid #111",
          paddingBottom: 16, marginBottom: 20,
        }}>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "#666", fontWeight: 600, marginBottom: 4,
            }}>UNION RIG</div>
            <h2 style={{
              fontSize: 24, fontWeight: 500, color: "#111", margin: 0,
              letterSpacing: "-0.02em",
            }}>{rig.name}</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#666" }}>Scene {rig.scene}</div>
            <div style={{ fontSize: 11, color: "#999" }}>
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Macro Knobs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#999", fontWeight: 600, marginBottom: 8,
          }}>Macro Controls</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}>
            {rig.knobs.map(k => (
              <div key={k.label} style={{
                border: "1px solid #ddd",
                padding: "8px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#333" }}>{k.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111", fontFamily: "monospace" }}>{k.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Chain */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#999", fontWeight: 600, marginBottom: 8,
          }}>Signal Chain</div>
          {rig.chain.map((stage, i) => (
            <div key={stage.name} style={{
              borderBottom: "1px solid #eee",
              padding: "8px 0",
              display: "flex",
              gap: 12,
            }}>
              <span style={{
                fontSize: 10, color: "#bbb", fontFamily: "monospace",
                width: 20, flexShrink: 0,
              }}>{String(i + 1).padStart(2, "0")}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: "#111",
                  }}>{stage.name}</span>
                  {!stage.active && (
                    <span style={{
                      fontSize: 9, color: "#999", border: "1px solid #ddd",
                      padding: "0 4px", letterSpacing: "0.05em",
                    }}>BYPASS</span>
                  )}
                </div>
                <span style={{
                  fontSize: 10, color: "#666", fontFamily: "monospace",
                  lineHeight: 1.5,
                }}>{stage.params}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <div style={{
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#999", fontWeight: 600, marginBottom: 8,
          }}>Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this rig..."
            rows={4}
            style={{
              width: "100%",
              background: "#fafafa",
              border: "1px solid #ddd",
              color: "#333",
              padding: "8px 10px",
              fontSize: 12,
              fontFamily: "'Inter', sans-serif",
              resize: "vertical",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 20, paddingTop: 12,
          borderTop: "1px solid #eee",
          display: "flex", justifyContent: "space-between",
          fontSize: 9, color: "#bbb",
        }}>
          <span>unionrig.com</span>
          <span>Generated {new Date().toISOString().split("T")[0]}</span>
        </div>
      </div>

      <style>{`
        @media print {
          body > *:not(#rig-sheet) { display: none !important; }
          nav, footer, section { display: none !important; }
          #rig-sheet {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            display: block !important;
          }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}
