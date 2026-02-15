"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CommunityRig,
  getAllRigs,
  getSortedRigs,
  getAverageRating,
  addRating,
  addComment,
  SortMode,
} from "@/lib/communityStore";

// ── Star Rating Display ──
function Stars({ rating, interactive, onRate }: { rating: number; interactive?: boolean; onRate?: (n: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <span
      style={{ display: "inline-flex", gap: 2, cursor: interactive ? "pointer" : "default" }}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = interactive ? (hover >= n || (!hover && rating >= n)) : rating >= n - 0.5;
        return (
          <span
            key={n}
            onMouseEnter={() => interactive && setHover(n)}
            onClick={() => interactive && onRate?.(n)}
            style={{
              color: filled ? "var(--accent)" : "#2a2725",
              fontSize: 16,
              lineHeight: 1,
              transition: "color 0.1s",
              userSelect: "none",
            }}
          >
            &#9733;
          </span>
        );
      })}
    </span>
  );
}

// ── Single Rig Card ──
function RigCard({ rig, onUpdate }: { rig: CommunityRig; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [rated, setRated] = useState(false);

  const avg = getAverageRating(rig);
  const count = rig.ratings.length;

  const handleRate = useCallback((stars: number) => {
    if (rated) return;
    addRating(rig.id, stars);
    setRated(true);
    onUpdate();
  }, [rig.id, rated, onUpdate]);

  const handleComment = useCallback(() => {
    if (!commentText.trim()) return;
    addComment(rig.id, commentAuthor, commentText);
    setCommentText("");
    setCommentAuthor("");
    onUpdate();
  }, [rig.id, commentAuthor, commentText, onUpdate]);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--fg-dim)", marginBottom: 6, fontWeight: 600,
            }}>
              {rig.genre} / {rig.era}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 500, color: "var(--fg)", margin: 0, lineHeight: 1.3 }}>
              {rig.name}
            </h3>
            <div style={{ fontSize: 11, color: "var(--fg-dim)", marginTop: 4 }}>
              by {rig.author}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <Stars rating={Math.round(avg)} />
            <div style={{ fontSize: 10, color: "var(--fg-dim)", marginTop: 2 }}>
              {avg > 0 ? avg.toFixed(1) : "--"} ({count})
            </div>
          </div>
        </div>

        <p style={{
          fontSize: 12, color: "var(--fg-dim)", lineHeight: 1.6,
          marginTop: 12, marginBottom: 0,
        }}>
          {rig.description}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {rig.tags.slice(0, 4).map((tag) => (
            <span key={tag} style={{
              fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--accent)", border: "1px solid rgba(201,185,154,0.2)",
              padding: "2px 8px", fontWeight: 500,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none", border: "none", borderTop: "1px solid var(--border)",
          color: "var(--accent)", fontSize: 10, letterSpacing: "0.15em",
          textTransform: "uppercase", padding: "10px 24px", cursor: "pointer",
          fontWeight: 600, textAlign: "left", fontFamily: "inherit",
        }}
      >
        {expanded ? "Hide" : "Rate + Comment"} ({rig.comments.length})
      </button>

      {/* Expanded section */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px 20px" }}>
          {/* Rate */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--fg-dim)", marginBottom: 8, fontWeight: 600,
            }}>
              {rated ? "RATED" : "RATE THIS RIG"}
            </div>
            <Stars rating={0} interactive={!rated} onRate={handleRate} />
            {rated && <span style={{ fontSize: 10, color: "var(--fg-dim)", marginLeft: 8 }}>Thanks</span>}
          </div>

          {/* Comments list */}
          {rig.comments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {rig.comments.map((c) => (
                <div key={c.id} style={{
                  borderBottom: "1px solid var(--border)", padding: "8px 0",
                }}>
                  <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>
                    {c.author}
                    <span style={{ color: "var(--fg-dim)", fontWeight: 400, marginLeft: 8 }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 4, lineHeight: 1.5 }}>
                    {c.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add comment */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              maxLength={30}
              style={{
                background: "#0a0908", border: "1px solid var(--border)",
                color: "var(--fg)", padding: "8px 12px", fontSize: 12,
                fontFamily: "inherit", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={200}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                style={{
                  flex: 1, background: "#0a0908", border: "1px solid var(--border)",
                  color: "var(--fg)", padding: "8px 12px", fontSize: 12,
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <button
                onClick={handleComment}
                style={{
                  background: "none", border: "1px solid var(--accent)",
                  color: "var(--accent)", padding: "8px 16px", fontSize: 10,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: "pointer", fontWeight: 600, fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Gallery ──
export default function CommunityGallery() {
  const [rigs, setRigs] = useState<CommunityRig[]>([]);
  const [sort, setSort] = useState<SortMode>("popular");
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setRigs(getSortedRigs(sort));
  }, [sort]);

  useEffect(() => {
    setMounted(true);
    // Force initialization
    getAllRigs();
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (mounted) refresh();
  }, [sort, mounted, refresh]);

  if (!mounted) return null;

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 12, fontWeight: 600,
        }}>
          COMMUNITY RIGS
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 500, color: "var(--fg)", margin: 0, lineHeight: 1.2 }}>
          Shared by players, for players
        </h2>
        <p style={{ fontSize: 14, color: "var(--fg-dim)", marginTop: 8, maxWidth: 600 }}>
          Browse rigs shared by the community. Rate your favorites, leave feedback, and discover new sounds.
        </p>
      </div>

      {/* Sort controls */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 32,
        border: "1px solid var(--border)", width: "fit-content",
      }}>
        {(["popular", "newest"] as SortMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSort(mode)}
            style={{
              background: sort === mode ? "var(--accent)" : "none",
              color: sort === mode ? "var(--bg)" : "var(--fg-dim)",
              border: "none",
              borderRight: mode === "popular" ? "1px solid var(--border)" : "none",
              padding: "8px 24px",
              fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer", fontWeight: 600, fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {mode === "popular" ? "Most Popular" : "Newest"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 16,
      }}
        className="community-grid"
      >
        {rigs.map((rig) => (
          <RigCard key={rig.id} rig={rig} onUpdate={refresh} />
        ))}
      </div>

      {rigs.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--fg-dim)", fontSize: 14 }}>
          No community rigs yet. Be the first to share one.
        </div>
      )}
    </section>
  );
}
