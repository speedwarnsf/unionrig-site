"use client";

import { useState, useEffect, useRef } from "react";

interface RigJsonScene {
  label: string;
  params: {
    dyn: Record<string, number | boolean>;
    drv: Record<string, number>;
    chr: Record<string, number>;
    stp: Record<string, number>;
    spc: Record<string, number>;
    cab: Record<string, number>;
    out: Record<string, number>;
  };
}

interface RigJson {
  rig_id: string;
  name: string;
  tags: string[];
  notes: string;
  scenes: { A: RigJsonScene; B: RigJsonScene };
}

interface PresetEntry {
  id: string;
  name: string;
  file: string;
  tags: string[];
  notes: string;
}

const DRIVE_LABELS: Record<number, string> = {
  0: "Clean", 1: "Soft Clip", 2: "Hard Clip", 3: "Tube", 4: "Fold", 5: "Fuzz",
};

function CompareBar({ label, valueA, valueB, max }: {
  label: string; valueA: number; valueB: number; max: number;
}) {
  const pctA = Math.min(100, Math.max(0, (valueA / max) * 100));
  const pctB = Math.min(100, Math.max(0, (valueB / max) * 100));
  const diff = Math.abs(pctA - pctB);
  const isDifferent = diff > 5;

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 9, color: "#5a5650", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        {isDifferent && <span style={{ fontSize: 8, color: "#c9b99a" }}>*</span>}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {/* Rig A */}
        <div style={{ flex: 1, height: 4, background: "#1a1816", position: "relative" }}>
          <div style={{ height: "100%", width: `${pctA}%`, background: "#7a9ec9", transition: "width 0.3s" }} />
        </div>
        {/* Rig B */}
        <div style={{ flex: 1, height: 4, background: "#1a1816", position: "relative" }}>
          <div style={{ height: "100%", width: `${pctB}%`, background: "#c97a7a", transition: "width 0.3s" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, justifyContent: "space-between" }}>
        <span style={{ fontSize: 8, color: "#5a5650", fontFamily: "monospace" }}>{valueA.toFixed(1)}</span>
        <span style={{ fontSize: 8, color: "#5a5650", fontFamily: "monospace" }}>{valueB.toFixed(1)}</span>
      </div>
    </div>
  );
}

function DriveCurveCompare({ paramsA, paramsB }: { paramsA: RigJsonScene["params"]; paramsB: RigJsonScene["params"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Center line
    ctx.strokeStyle = "#1e1c1a";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    function drawCurve(params: RigJsonScene["params"], color: string) {
      const driveType = params.drv.type as number || 0;
      const preGain = Math.pow(10, ((params.drv.pre_gain_db as number) || 0) / 20);
      const asym = (params.drv.asym as number) || 0;

      ctx!.strokeStyle = color;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();

      for (let i = 0; i < w; i++) {
        const x = (i / w) * 2 - 1;
        let y = x * preGain * 0.5;
        y += asym * 0.15 * (y * y * y);
        let s = y;
        switch (driveType) {
          case 0: break;
          case 1: s = Math.tanh(y); break;
          case 2: s = Math.max(-1, Math.min(1, y)); break;
          case 3: s = Math.tanh(y * 1.2); s = Math.max(-1.2, Math.min(1.2, s + 0.1 * y)); break;
          case 4: if (s > 1) s = 2 - s; if (s < -1) s = -2 - s; break;
          case 5: { let f = y * 1.3; if (f > 1) f = 2 - f; if (f < -1) f = -2 - f; s = Math.tanh(f); break; }
        }
        const py = h / 2 - (s * h * 0.4);
        if (i === 0) ctx!.moveTo(i, py);
        else ctx!.lineTo(i, py);
      }
      ctx!.stroke();
    }

    drawCurve(paramsA, "rgba(122,158,201,0.8)");
    drawCurve(paramsB, "rgba(201,122,122,0.8)");
  }, [paramsA, paramsB]);

  return (
    <canvas ref={canvasRef} width={200} height={60} style={{
      width: "100%", height: 60, display: "block",
      border: "1px solid #1e1c1a", background: "#0a0a09",
    }} />
  );
}

export default function PresetCompare() {
  const [presets, setPresets] = useState<PresetEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [rigA, setRigA] = useState<RigJson | null>(null);
  const [rigB, setRigB] = useState<RigJson | null>(null);
  const [scene, setScene] = useState<"A" | "B">("A");

  useEffect(() => {
    Promise.all([
      fetch("/rigs/index.json").then(r => r.json()),
      fetch("/rigs/user1/index.json").then(r => r.json()),
    ]).then(([base, famous]) => {
      setPresets([...base, ...famous]);
    }).catch(() => {});
  }, []);

  const loadRig = async (entry: PresetEntry, slot: "A" | "B") => {
    // Check if it's in base or user1
    const isUser1 = entry.tags?.some(t =>
      ["queen", "pink-floyd", "jack-white", "hendrix", "led-zeppelin", "rhcp", "radiohead", "my-bloody-valentine", "nirvana", "srv", "u2", "rage-against-machine"]
        .some(a => t.includes(a) || entry.id.includes(a.replace(/-/g, "_")))
    );
    const path = isUser1 ? `/rigs/user1/${entry.file}` : `/rigs/${entry.file}`;
    try {
      const resp = await fetch(path);
      // If 404, try the other path
      if (!resp.ok) {
        const altPath = isUser1 ? `/rigs/${entry.file}` : `/rigs/user1/${entry.file}`;
        const altResp = await fetch(altPath);
        if (altResp.ok) {
          const rj = await altResp.json();
          if (slot === "A") setRigA(rj); else setRigB(rj);
          return;
        }
      }
      const rj = await resp.json();
      if (slot === "A") setRigA(rj); else setRigB(rj);
    } catch { /* */ }
  };

  if (presets.length === 0) return null;

  const sceneKey = scene;
  const paramsA = rigA?.scenes[sceneKey]?.params;
  const paramsB = rigB?.scenes[sceneKey]?.params;

  return (
    <div style={{ marginBottom: 32 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none", border: "1px solid #2a2725", color: "#8a8278",
          padding: "10px 20px", fontSize: 11, letterSpacing: "0.12em",
          textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
          width: "100%", maxWidth: 680, display: "block", margin: "0 auto",
          textAlign: "left",
        }}
      >
        {expanded ? "Hide" : "Compare"} Rigs
      </button>

      {expanded && (
        <div style={{
          maxWidth: 680, margin: "0 auto",
          border: "1px solid #2a2725", borderTop: "none",
          background: "#111", padding: "16px",
        }}>
          {/* Scene toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
            {(["A", "B"] as const).map(s => (
              <button key={s} onClick={() => setScene(s)} style={{
                background: scene === s ? "rgba(201,185,154,0.12)" : "none",
                border: `1px solid ${scene === s ? "#c9b99a" : "#2a2725"}`,
                color: scene === s ? "#e8e4dc" : "#5a5650",
                padding: "6px 16px", fontSize: 11, letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
              }}>Scene {s}</button>
            ))}
          </div>

          {/* Rig selectors */}
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: "#7a9ec9", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Rig A</div>
              <select
                value={rigA?.rig_id || ""}
                onChange={(e) => {
                  const entry = presets.find(p => p.id === e.target.value);
                  if (entry) loadRig(entry, "A");
                }}
                style={{
                  width: "100%", background: "#1a1816", border: "1px solid #2a2725",
                  color: "#e8e4dc", padding: "6px 8px", fontSize: 11,
                }}
              >
                <option value="">Select rig...</option>
                {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: "#c97a7a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Rig B</div>
              <select
                value={rigB?.rig_id || ""}
                onChange={(e) => {
                  const entry = presets.find(p => p.id === e.target.value);
                  if (entry) loadRig(entry, "B");
                }}
                style={{
                  width: "100%", background: "#1a1816", border: "1px solid #2a2725",
                  color: "#e8e4dc", padding: "6px 8px", fontSize: 11,
                }}
              >
                <option value="">Select rig...</option>
                {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Comparison */}
          {paramsA && paramsB ? (
            <div>
              {/* Drive curves overlay */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  Drive Curve Overlay
                </div>
                <DriveCurveCompare paramsA={paramsA} paramsB={paramsB} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: "#5a5650" }}>
                    A: {DRIVE_LABELS[paramsA.drv.type as number] || "Clean"}
                  </span>
                  <span style={{ fontSize: 9, color: "#5a5650" }}>
                    B: {DRIVE_LABELS[paramsB.drv.type as number] || "Clean"}
                  </span>
                </div>
              </div>

              {/* Param comparison bars */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#c9b99a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Dynamics</div>
                  <CompareBar label="Threshold" valueA={Math.abs(paramsA.dyn.thresh_db as number)} valueB={Math.abs(paramsB.dyn.thresh_db as number)} max={40} />
                  <CompareBar label="Ratio" valueA={paramsA.dyn.ratio as number} valueB={paramsB.dyn.ratio as number} max={8} />
                  <CompareBar label="Mix" valueA={(paramsA.dyn.mix as number) * 100} valueB={(paramsB.dyn.mix as number) * 100} max={100} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#c9b99a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Drive</div>
                  <CompareBar label="Gain" valueA={paramsA.drv.pre_gain_db as number} valueB={paramsB.drv.pre_gain_db as number} max={36} />
                  <CompareBar label="Mix" valueA={(paramsA.drv.mix as number) * 100} valueB={(paramsB.drv.mix as number) * 100} max={100} />
                  <CompareBar label="Asymmetry" valueA={(paramsA.drv.asym as number) * 100} valueB={(paramsB.drv.asym as number) * 100} max={100} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#c9b99a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Character</div>
                  <CompareBar label="Depth" valueA={(paramsA.chr.depth as number) * 100} valueB={(paramsB.chr.depth as number) * 100} max={100} />
                  <CompareBar label="Rate" valueA={paramsA.chr.rate_hz as number} valueB={paramsB.chr.rate_hz as number} max={8} />
                  <CompareBar label="Mix" valueA={(paramsA.chr.mix as number) * 100} valueB={(paramsB.chr.mix as number) * 100} max={100} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#c9b99a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>Space</div>
                  <CompareBar label="Decay" valueA={paramsA.spc.decay_s as number} valueB={paramsB.spc.decay_s as number} max={12} />
                  <CompareBar label="Wet" valueA={(paramsA.spc.wet as number) * 100} valueB={(paramsB.spc.wet as number) * 100} max={100} />
                  <CompareBar label="Width" valueA={(paramsA.stp.width as number) * 100} valueB={(paramsB.stp.width as number) * 100} max={100} />
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid #2a2725" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 12, height: 4, background: "#7a9ec9" }} />
                  <span style={{ fontSize: 9, color: "#5a5650" }}>{rigA.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 12, height: 4, background: "#c97a7a" }} />
                  <span style={{ fontSize: 9, color: "#5a5650" }}>{rigB.name}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#3a3735", fontSize: 12 }}>
              Select two rigs to compare
            </div>
          )}
        </div>
      )}
    </div>
  );
}
