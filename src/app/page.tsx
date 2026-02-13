import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

const section: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "80px 24px",
};

const dimText: React.CSSProperties = {
  color: "var(--fg-dim)",
  fontSize: 15,
  lineHeight: 1.7,
  maxWidth: 560,
};

export default function Home() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/union-rig-hero.jpg"
          alt="Union Rig"
          fill
          priority
          style={{ objectFit: "cover", opacity: 0.4 }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(40px, 8vw, 80px)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Union Rig
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 2.5vw, 22px)",
              color: "var(--fg-dim)",
              fontWeight: 300,
              maxWidth: 500,
              margin: "0 auto 48px",
            }}
          >
            Trust what works.
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--fg-dim)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            $849 -- Coming 2026
          </p>
        </div>
      </section>

      {/* What it is */}
      <section style={section}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 64,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 400,
                marginBottom: 24,
                color: "var(--accent)",
              }}
            >
              One instrument. Everything you need for the set.
            </h2>
            <p style={dimText}>
              Union Rig is a mono-in, stereo-out guitar instrument. Fixed signal
              chain. Six knobs. Four footswitches. Twelve sounds with two scenes
              each. A looper. Nothing else.
            </p>
          </div>
          <div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 400,
                marginBottom: 24,
                color: "var(--accent)",
              }}
            >
              Machines are useless if you can&apos;t trust them.
            </h2>
            <p style={dimText}>
              No dropouts. No surprise behavior. No reset feeling between songs.
              Your sounds are there when you step on stage and they stay there
              until you decide to change them.
            </p>
          </div>
        </div>
      </section>

      {/* Signal Chain */}
      <section
        style={{
          ...section,
          borderTop: "1px solid var(--border)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            marginBottom: 32,
          }}
        >
          Signal Chain
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 4px",
            alignItems: "center",
            fontSize: "clamp(16px, 2.5vw, 22px)",
            fontWeight: 300,
            color: "var(--fg)",
          }}
        >
          {[
            "Dynamics",
            "Drive",
            "Character / Motion",
            "Stereo Width",
            "Space",
            "Output Shaping",
          ].map((block, i, arr) => (
            <span key={block} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span>{block}</span>
              {i < arr.length - 1 && (
                <span style={{ color: "var(--fg-dim)", margin: "0 4px" }}>
                  &rarr;
                </span>
              )}
            </span>
          ))}
        </div>
      </section>

      {/* Controls */}
      <section
        style={{
          ...section,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 64,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 24,
              }}
            >
              Tone / Feel
            </p>
            {["Touch", "Heat", "Body"].map((k) => (
              <p
                key={k}
                style={{
                  fontSize: 24,
                  fontWeight: 300,
                  marginBottom: 8,
                }}
              >
                {k}
              </p>
            ))}
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 24,
              }}
            >
              Space / Time
            </p>
            {["Depth", "Motion", "Tempo"].map((k) => (
              <p
                key={k}
                style={{
                  fontSize: 24,
                  fontWeight: 300,
                  marginBottom: 8,
                }}
              >
                {k}
              </p>
            ))}
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 24,
              }}
            >
              Footswitches
            </p>
            {["Looper", "Scene A/B", "Next Sound", "Previous Sound"].map(
              (k) => (
                <p
                  key={k}
                  style={{
                    fontSize: 24,
                    fontWeight: 300,
                    marginBottom: 8,
                  }}
                >
                  {k}
                </p>
              )
            )}
          </div>
        </div>
      </section>

      {/* Working Set */}
      <section
        style={{
          ...section,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 400,
              marginBottom: 24,
              color: "var(--accent)",
            }}
          >
            12 sounds. 2 scenes each. No banks.
          </h2>
          <p style={dimText}>
            Your working set is always loaded. Step through sounds with your
            feet. Switch scenes within a song. Hold the scene switch to morph
            between A and B, release to come back. Twenty-four playable states,
            zero menu diving.
          </p>
        </div>
      </section>

      {/* Looper */}
      <section
        style={{
          ...section,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 400,
              marginBottom: 24,
              color: "var(--accent)",
            }}
          >
            Looper that stays out of your way.
          </h2>
          <p style={dimText}>
            Single loop. Sound-on-sound. Recorded post-dynamics, pre-space, so
            your loop lives inside the instrument. Change sounds, change scenes --
            the loop persists. Clear it when you are done.
          </p>
        </div>
      </section>

      {/* E-ink */}
      <section
        style={{
          ...section,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 400,
              marginBottom: 24,
              color: "var(--accent)",
            }}
          >
            The screen shows orientation, not permission.
          </h2>
          <p style={dimText}>
            A 4.2-inch e-ink display. No meters. No animations. It tells you
            where you are -- which sound, which scene, what just changed. You play
            first, listen second, and look only when you need to.
          </p>
        </div>
      </section>

      {/* Waitlist */}
      <section
        style={{
          ...section,
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 400,
            marginBottom: 12,
          }}
        >
          Get notified.
        </h2>
        <p
          style={{
            ...dimText,
            marginBottom: 32,
            maxWidth: 400,
          }}
        >
          Union Rig ships in 2026. Leave your email and we will let you know
          when it is ready.
        </p>
        <WaitlistForm />
      </section>

      <Footer />
    </>
  );
}
