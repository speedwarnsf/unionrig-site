import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import FadeIn from "@/components/FadeIn";

const section: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "64px 24px",
};

const body: React.CSSProperties = {
  color: "var(--fg-dim)",
  fontSize: 15,
  lineHeight: 1.8,
};

export default function Contact() {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: 56 }}>
        <section style={section}>
          <FadeIn>
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 300,
                marginBottom: 16,
              }}
            >
              Get in touch.
            </h1>
            <p style={{ ...body, marginBottom: 48 }}>
              Union Rig ships in 2027. Leave your email to get notified when it
              is ready. No spam. No marketing. Just the one email that matters.
            </p>
          </FadeIn>

          <FadeIn>
            <WaitlistForm />
          </FadeIn>

          <FadeIn>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                marginTop: 64,
                paddingTop: 48,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 16,
                }}
              >
                General inquiries
              </p>
              <a
                href="mailto:hello@unionrig.com"
                style={{
                  color: "var(--accent)",
                  textDecoration: "none",
                  fontSize: 18,
                  fontWeight: 300,
                }}
              >
                hello@unionrig.com
              </a>
            </div>
          </FadeIn>
        </section>
      </div>
      <Footer />
    </>
  );
}
