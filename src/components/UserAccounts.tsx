"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface SavedRig {
  id: string;
  name: string;
  created: number;
  data: Record<string, unknown>;
  tags: string[];
}

const STORAGE_KEY = "unionrig_saved_rigs";

function loadRigs(): SavedRig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRigs(rigs: SavedRig[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rigs));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Default demo rig data
function makeDemoRig(name: string, tags: string[]): SavedRig {
  return {
    id: generateId(),
    name,
    created: Date.now(),
    tags,
    data: {
      touch: 0.5, heat: 0.3, body: 0.5,
      depth: 0.3, motion: 0.2, tempo: 0.5,
      sound: name, scene: "A",
    },
  };
}

export default function UserAccounts() {
  const [rigs, setRigs] = useState<SavedRig[]>([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadRigs();
    if (loaded.length === 0) {
      // Seed with demo rigs
      const demos = [
        makeDemoRig("My Clean Tone", ["clean", "studio"]),
        makeDemoRig("Sunday Ambient", ["ambient", "reverb"]),
        makeDemoRig("Blues Crunch", ["blues", "drive"]),
      ];
      saveRigs(demos);
      setRigs(demos);
    } else {
      setRigs(loaded);
    }
  }, []);

  const addRig = useCallback(() => {
    const name = newName.trim() || `Rig ${rigs.length + 1}`;
    const rig: SavedRig = {
      id: generateId(),
      name,
      created: Date.now(),
      tags: [],
      data: {
        touch: 0.5, heat: 0.3, body: 0.5,
        depth: 0.3, motion: 0.2, tempo: 0.5,
        sound: "Velvet Static", scene: "A",
      },
    };
    const updated = [rig, ...rigs];
    setRigs(updated);
    saveRigs(updated);
    setNewName("");
  }, [newName, rigs]);

  const deleteRig = useCallback((id: string) => {
    const updated = rigs.filter(r => r.id !== id);
    setRigs(updated);
    saveRigs(updated);
  }, [rigs]);

  const renameRig = useCallback((id: string, name: string) => {
    const updated = rigs.map(r => r.id === id ? { ...r, name } : r);
    setRigs(updated);
    saveRigs(updated);
    setEditing(null);
  }, [rigs]);

  const exportRigs = useCallback(() => {
    const json = JSON.stringify(rigs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unionrig-rigs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rigs]);

  const importRigs = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported: SavedRig[] = JSON.parse(reader.result as string);
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        // Merge: skip duplicates by id
        const existingIds = new Set(rigs.map(r => r.id));
        const newRigs = imported.filter(r => !existingIds.has(r.id));
        const updated = [...newRigs, ...rigs];
        setRigs(updated);
        saveRigs(updated);
      } catch {
        alert("Invalid rig file format");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [rigs]);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  return (
    <div style={{ marginTop: 48 }}>
      <p style={{
        fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "var(--accent)", marginBottom: 12, fontWeight: 600,
      }}>Saved Rigs</p>
      <p style={{
        color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7,
        maxWidth: 480, marginBottom: 24,
      }}>
        Save your rig configurations locally. Export to JSON for backup, import to restore.
      </p>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Add new rig */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRig()}
            placeholder="Rig name..."
            style={{
              flex: 1,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              padding: "8px 12px",
              fontSize: 13,
            }}
          />
          <button
            onClick={addRig}
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              border: "none",
              padding: "8px 20px",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >Save</button>
        </div>

        {/* Import / Export */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            onClick={exportRigs}
            disabled={rigs.length === 0}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--fg-dim)",
              padding: "6px 16px",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: rigs.length ? "pointer" : "default",
              fontWeight: 500,
              opacity: rigs.length ? 1 : 0.4,
            }}
          >Export JSON</button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--fg-dim)",
              padding: "6px 16px",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" onChange={importRigs} style={{ display: "none" }} />
          <span style={{
            fontSize: 11, color: "var(--fg-dim)", alignSelf: "center", marginLeft: "auto",
          }}>{rigs.length} rig{rigs.length !== 1 ? "s" : ""} saved</span>
        </div>

        {/* Rig list */}
        <div style={{
          border: "1px solid var(--border)",
          background: "var(--surface)",
          maxHeight: 360,
          overflowY: "auto",
        }}>
          {rigs.length === 0 ? (
            <div style={{
              padding: "32px 16px", textAlign: "center",
              color: "var(--fg-dim)", fontSize: 13, fontStyle: "italic",
            }}>No saved rigs yet</div>
          ) : rigs.map(rig => (
            <div key={rig.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              transition: "background 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,185,154,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Indicator */}
              <div style={{ width: 4, height: 4, background: "var(--accent)", flexShrink: 0 }} />

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editing === rig.id ? (
                  <input
                    autoFocus
                    defaultValue={rig.name}
                    onBlur={(e) => renameRig(rig.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") renameRig(rig.id, (e.target as HTMLInputElement).value);
                      if (e.key === "Escape") setEditing(null);
                    }}
                    style={{
                      background: "none",
                      border: "1px solid var(--accent)",
                      color: "var(--fg)",
                      padding: "2px 6px",
                      fontSize: 13,
                      width: "100%",
                    }}
                  />
                ) : (
                  <span
                    onClick={() => setEditing(rig.id)}
                    style={{
                      fontSize: 13, fontWeight: 500, color: "var(--fg)",
                      cursor: "text", display: "block",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >{rig.name}</span>
                )}
                <span style={{ fontSize: 10, color: "#5a5650" }}>{formatDate(rig.created)}</span>
              </div>

              {/* Tags */}
              {rig.tags.length > 0 && (
                <div style={{ display: "flex", gap: 4 }}>
                  {rig.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 9, color: "#5a5650", border: "1px solid #2a2725",
                      padding: "1px 5px", letterSpacing: "0.05em",
                    }}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteRig(rig.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#5a5650",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: "4px",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                title="Delete rig"
              >x</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
