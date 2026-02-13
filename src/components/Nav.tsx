"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Union Rig" },
  { href: "/technical", label: "Technical" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

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
            color: "var(--accent)",
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Union
        </Link>
        <div style={{ display: "flex", gap: 32 }}>
          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color:
                  pathname === l.href ? "var(--fg)" : "var(--fg-dim)",
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
      </div>
    </nav>
  );
}
