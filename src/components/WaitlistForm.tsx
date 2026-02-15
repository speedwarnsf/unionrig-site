"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function WaitlistFormInner() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [count, setCount] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  const validate = (value: string): string => {
    if (!value.trim()) return "Email is required.";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!re.test(value.trim())) return "Please enter a valid email address.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(email);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStatus("sending");
    try {
      const ref = searchParams.get("ref") || undefined;
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), ref }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push(
          `/thank-you?code=${encodeURIComponent(data.referralCode)}&pos=${data.position || ""}`
        );
      } else {
        setError(data.error || "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 0, width: "100%" }}
      >
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          disabled={status === "sending"}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--surface)",
            border: `1px solid ${error ? "#c45" : "var(--border)"}`,
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
      {error && (
        <p style={{ color: "#c45", fontSize: 12, marginTop: 8, textAlign: "left" }}>
          {error}
        </p>
      )}
      {count !== null && (
        <p
          style={{
            color: "var(--fg-dim)",
            fontSize: 12,
            marginTop: 12,
            letterSpacing: "0.04em",
          }}
        >
          {count.toLocaleString()} people on the waitlist
        </p>
      )}
    </div>
  );
}

export default function WaitlistForm() {
  return (
    <Suspense fallback={<div style={{ height: 48 }} />}>
      <WaitlistFormInner />
    </Suspense>
  );
}
