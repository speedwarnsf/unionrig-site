"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p
        style={{
          color: "var(--accent)",
          fontSize: 15,
          fontWeight: 400,
        }}
      >
        We will be in touch.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 0, maxWidth: 420, width: "100%" }}
    >
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "sending"}
        style={{
          flex: 1,
          padding: "12px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--fg)",
          fontSize: 14,
          outline: "none",
          fontFamily: "inherit",
        }}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        style={{
          padding: "12px 24px",
          background: status === "sending" ? "var(--fg-dim)" : "var(--accent)",
          color: "var(--bg)",
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: status === "sending" ? "default" : "pointer",
          fontFamily: "inherit",
          transition: "background 0.2s",
        }}
      >
        {status === "sending" ? "..." : status === "error" ? "Try Again" : "Notify Me"}
      </button>
    </form>
  );
}
