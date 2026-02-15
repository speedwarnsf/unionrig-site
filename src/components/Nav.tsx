"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/technical", label: "Technical" },
  { href: "/labs", label: "Labs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <Image
            src="/images/union-logo.png"
            alt="UNION"
            width={320}
            height={72}
            style={{ width: 80, height: "auto", display: "block" }}
            priority
          />
        </Link>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", gap: 32 }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color: pathname === l.href ? "var(--fg)" : "var(--fg-dim)",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "0.04em",
                transition: "color 0.2s",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--fg)",
            fontSize: 20,
            cursor: "pointer",
            padding: "4px 0",
            fontFamily: "inherit",
          }}
        >
          {open ? "\u00D7" : "\u2261"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="nav-mobile"
          style={{
            background: "rgba(10,10,10,0.98)",
            borderBottom: "1px solid var(--border)",
            padding: "16px 24px 24px",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                color: pathname === l.href ? "var(--fg)" : "var(--fg-dim)",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 400,
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
                letterSpacing: "0.02em",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
