"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PresetEntry {
  id: string;
  name: string;
  file: string;
  tags: string[];
  notes: string;
}

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

// Genre mapping for Famous Rigs
const ARTIST_META: Record<string, { genre: string; era: string; icon: string }> = {
  brian_may_treble_booster: { genre: "Classic Rock", era: "1970s", icon: "BM" },
  david_gilmour_big_muff: { genre: "Progressive Rock", era: "1970s", icon: "DG" },
  jack_white_garage_fuzz: { genre: "Garage Rock", era: "2000s", icon: "JW" },
  jimi_hendrix_fuzz_face: { genre: "Psychedelic Rock", era: "1960s", icon: "JH" },
  jimmy_page_marshall_crunch: { genre: "Hard Rock", era: "1970s", icon: "JP" },
  john_frusciante_funk_ds2: { genre: "Funk Rock", era: "1990s", icon: "JF" },
  jonny_greenwood_shredmaster: { genre: "Art Rock", era: "1990s", icon: "JG" },
  kevin_shields_mbv_wash: { genre: "Shoegaze", era: "1990s", icon: "KS" },
  kurt_cobain_ds1_twin: { genre: "Grunge", era: "1990s", icon: "KC" },
  stevie_ray_vaughan_tube_screamer: { genre: "Texas Blues", era: "1980s", icon: "SV" },
  the_edge_u2_delay: { genre: "Post-Punk / Ambient", era: "1980s", icon: "TE" },
  tom_morello_rage_whammy: { genre: "Rap Metal", era: "1990s", icon: "TM" },
};

// Drive type descriptions
const DRIVE_LABELS: Record<number, string> = {
  0: "Clean", 1: "Soft Clip", 2: "Hard Clip", 3: "Tube", 4: "Fold", 5: "Fuzz",
};

function MiniWaveform({ params }: { params: RigJsonScene["params"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Generate a visual representation of the drive curve
    const driveType = params.drv.type as number || 0;
    const preGain = Math.pow(10, ((params.drv.pre_gain_db as number) || 0) / 20);
    const asym = (params.drv.asym as number) || 0;

    ctx.strokeStyle = "#c9b99a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 0; i < w; i++) {
      const x = (i / w) * 2 - 1; // -1 to 1
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
      if (i === 0) ctx.moveTo(i, py);
      else ctx.lineTo(i, py);
    }
    ctx.stroke();

    // Center line
    ctx.strokeStyle = "#2a2725";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  }, [params]);

  return (
    <canvas ref={canvasRef} width={120} height={40} style={{
      width: 120, height: 40, display: "block",
      border: "1px solid #1e1c1a", background: "#0a0a09",
    }} />
  );
}

function ParamBar({ label, value, max, color }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
      <span style={{ fontSize: 8, color: "#5a5650", width: 50, textAlign: "right", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 3, background: "#1a1816", position: "relative" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: color || "#c9b99a",
          transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
}

interface SoundBrowserProps {
  onSelect?: (rig: RigJson) => void;
  onLoadAll?: (rigs: RigJson[], setName: string) => void;
}

export default function SoundBrowser({ onSelect, onLoadAll }: SoundBrowserProps) {
  const [basePresets, setBasePresets] = useState<PresetEntry[]>([]);
  const [famousPresets, setFamousPresets] = useState<PresetEntry[]>([]);
  const [activeSet, setActiveSet] = useState<"base" | "famous">("famous");
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterEra, setFilterEra] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRig, setSelectedRig] = useState<RigJson | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load indexes
  useEffect(() => {
    fetch("/rigs/index.json").then(r => r.json()).then(setBasePresets).catch(() => {});
    fetch("/rigs/user1/index.json").then(r => r.json()).then(setFamousPresets).catch(() => {});
  }, []);

  const presets = activeSet === "base" ? basePresets : famousPresets;

  // Collect unique genres and eras
  const genres = Array.from(new Set(
    famousPresets.map(p => ARTIST_META[p.id]?.genre).filter(Boolean)
  )).sort();
  const eras = Array.from(new Set(
    famousPresets.map(p => ARTIST_META[p.id]?.era).filter(Boolean)
  )).sort();

  // Filter
  const filtered = presets.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.notes.toLowerCase().includes(q) && !p.tags.some(t => t.includes(q))) return false;
    }
    if (activeSet === "famous") {
      const meta = ARTIST_META[p.id];
      if (filterGenre && meta?.genre !== filterGenre) return false;
      if (filterEra && meta?.era !== filterEra) return false;
    }
    return true;
  });

  const loadPreview = useCallback(async (entry: PresetEntry) => {
    setSelectedId(entry.id);
    const path = activeSet === "base" ? `/rigs/${entry.file}` : `/rigs/user1/${entry.file}`;
    try {
      const resp = await fetch(path);
      const rj: RigJson = await resp.json();
      setSelectedRig(rj);
    } catch { setSelectedRig(null); }
  }, [activeSet]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "rgba(201,185,154,0.12)" : "none",
    border: "none",
    borderBottom: active ? "2px solid #c9b99a" : "2px solid transparent",
    color: active ? "#e8e4dc" : "#5a5650",
    padding: "10px 20px",
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontWeight: active ? 700 : 500,
  });

  if (!basePresets.length && !famousPresets.length) return null;

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
        {expanded ? "Hide" : "Browse"} Sounds
        {selectedRig && !expanded ? ` -- ${selectedRig.name}` : ""}
      </button>

      {expanded && (
        <div style={{
          maxWidth: 680, margin: "0 auto",
          border: "1px solid #2a2725", borderTop: "none",
          background: "#111",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #2a2725" }}>
            <button onClick={() => { setActiveSet("base"); setSelectedId(null); setSelectedRig(null); }} style={tabStyle(activeSet === "base")}>
              My Rigs ({basePresets.length})
            </button>
            <button onClick={() => { setActiveSet("famous"); setSelectedId(null); setSelectedRig(null); }} style={tabStyle(activeSet === "famous")}>
              Famous Rigs ({famousPresets.length})
            </button>
          </div>

          {/* Filters */}
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid #2a2725",
            display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
          }}>
            <input
              type="text" placeholder="Search sounds..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "#1a1816", border: "1px solid #2a2725", color: "#e8e4dc",
                padding: "6px 10px", fontSize: 12, flex: "1 1 140px", minWidth: 120,
              }}
            />
            {activeSet === "famous" && (
              <>
                <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} style={{
                  background: "#1a1816", border: "1px solid #2a2725", color: "#e8e4dc",
                  padding: "6px 8px", fontSize: 11,
                }}>
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={filterEra} onChange={(e) => setFilterEra(e.target.value)} style={{
                  background: "#1a1816", border: "1px solid #2a2725", color: "#e8e4dc",
                  padding: "6px 8px", fontSize: 11,
                }}>
                  <option value="">All Eras</option>
                  {eras.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </>
            )}
            <span style={{ fontSize: 10, color: "#5a5650" }}>{filtered.length} results</span>
          </div>

          {/* Two-panel: list + preview */}
          <div style={{ display: "flex", minHeight: 340 }}>
            {/* List */}
            <div style={{ flex: "1 1 50%", maxHeight: 400, overflowY: "auto", borderRight: "1px solid #2a2725" }}>
              {filtered.map(entry => {
                const meta = ARTIST_META[entry.id];
                const isSelected = selectedId === entry.id;

                return (
                  <button
                    key={entry.id}
                    onClick={() => loadPreview(entry)}
                    onDoubleClick={() => {
                      if (selectedRig && onSelect) { onSelect(selectedRig); setExpanded(false); }
                    }}
                    style={{
                      display: "block", width: "100%",
                      background: isSelected ? "rgba(201,185,154,0.1)" : "none",
                      border: "none", borderBottom: "1px solid #1e1c1a",
                      padding: "12px 16px", textAlign: "left", cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = "rgba(201,185,154,0.04)")}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {/* Artist initials icon */}
                      {meta && (
                        <div style={{
                          width: 32, height: 32, border: "1px solid #2a2725",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "#1a1816", flexShrink: 0,
                          fontSize: 11, fontWeight: 700, color: "#c9b99a",
                          letterSpacing: "0.05em",
                        }}>{meta.icon}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#e8e4dc", marginBottom: 2 }}>
                          {entry.name}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {meta && (
                            <>
                              <span style={{ fontSize: 9, padding: "1px 5px", border: "1px solid #2a2725", color: "#8a8278" }}>{meta.genre}</span>
                              <span style={{ fontSize: 9, padding: "1px 5px", border: "1px solid #2a2725", color: "#5a5650" }}>{meta.era}</span>
                            </>
                          )}
                          {!meta && entry.tags.slice(0, 2).map(t => (
                            <span key={t} style={{ fontSize: 9, padding: "1px 5px", border: "1px solid #2a2725", color: "#5a5650" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview panel */}
            <div style={{ flex: "1 1 50%", padding: "16px", overflowY: "auto" }}>
              {selectedRig ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 500, color: "#e8e4dc", marginBottom: 4 }}>
                      {selectedRig.name}
                    </h3>
                    <p style={{ fontSize: 11, color: "#8a8278", lineHeight: 1.5 }}>{selectedRig.notes}</p>
                  </div>

                  {/* Drive curve visualization */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 9, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase" }}>Drive Curve (Scene A)</span>
                    <MiniWaveform params={selectedRig.scenes.A.params} />
                  </div>

                  {/* Key params */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 9, color: "#5a5650", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Scene A Parameters</span>
                    <ParamBar label="Gain" value={selectedRig.scenes.A.params.drv.pre_gain_db as number} max={36} color="#c97a7a" />
                    <ParamBar label="Drive" value={(selectedRig.scenes.A.params.drv.mix as number) * 100} max={100} color="#c97a7a" />
                    <ParamBar label="Comp" value={(selectedRig.scenes.A.params.dyn.mix as number) * 100} max={100} color="#7a9ec9" />
                    <ParamBar label="Reverb" value={(selectedRig.scenes.A.params.spc.wet as number) * 100} max={100} color="#9a7ac9" />
                    <ParamBar label="Width" value={(selectedRig.scenes.A.params.stp.width as number) * 100} max={100} color="#c9b99a" />
                    <div style={{ fontSize: 9, color: "#5a5650", marginTop: 4 }}>
                      Type: {DRIVE_LABELS[selectedRig.scenes.A.params.drv.type as number] || "Clean"}
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
                    {selectedRig.tags.map(t => (
                      <span key={t} style={{
                        fontSize: 9, padding: "2px 6px", border: "1px solid #2a2725",
                        color: "#8a8278",
                      }}>{t}</span>
                    ))}
                  </div>

                  {/* Load button */}
                  {onSelect && (
                    <button
                      onClick={() => { onSelect(selectedRig); setExpanded(false); }}
                      style={{
                        background: "#c9b99a", color: "#0e0d0c", border: "none",
                        padding: "8px 20px", fontSize: 11, letterSpacing: "0.1em",
                        textTransform: "uppercase", cursor: "pointer", fontWeight: 600,
                        width: "100%",
                      }}
                    >Load This Rig</button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#3a3735", fontSize: 12 }}>
                  Select a sound to preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
