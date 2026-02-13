"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  if (submitted) {
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
        style={{
          padding: "12px 24px",
          background: "var(--accent)",
          color: "var(--bg)",
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Notify Me
      </button>
    </form>
  );
}
