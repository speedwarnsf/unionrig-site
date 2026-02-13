export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "48px 24px",
        textAlign: "center",
        color: "var(--fg-dim)",
        fontSize: 13,
      }}
    >
      <p style={{ marginBottom: 8 }}>
        Union Rig — Trust what works.
      </p>
      <p>
        <a
          href="mailto:hello@unionrig.com"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          hello@unionrig.com
        </a>
      </p>
    </footer>
  );
}
