import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import ScrollReveal from "@/components/ScrollReveal";
import UnionLogo from "@/components/UnionLogo";
import SignalChainGraphic from "@/components/SignalChainGraphic";
import KnobGraphic from "@/components/KnobGraphic";
import FootswitchGraphic from "@/components/FootswitchGraphic";
import EinkDisplayGraphic from "@/components/EinkDisplayGraphic";

export default function Home() {
  return (
    <>
      <Nav />

      {/* ═══════ HERO ═══════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Hero image — full bleed, allowed to breathe */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/images/guitarist-hero.jpg"
            alt="Union Rig — AI-powered guitar instrument"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center 30%",
              opacity: 0.6,
            }}
          />
          {/* Bottom gradient for text legibility */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(to top, var(--bg) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Hero content — logo + tagline at bottom */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "0 24px 64px",
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <ScrollReveal>
            <UnionLogo width={320} />
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p
              style={{
                fontSize: "clamp(18px, 3vw, 26px)",
                color: "var(--fg-dim)",
                fontWeight: 300,
                maxWidth: 520,
                marginTop: 20,
                marginBottom: 32,
                lineHeight: 1.5,
              }}
            >
              AI builds your sound. Analog keeps your soul.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={350}>
            <p
              style={{
                fontSize: 12,
                color: "var(--fg-dim)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              $849 — Shipping 2026
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ THE PITCH — How it works ═══════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "120px 24px 80px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            How it works
          </p>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 0,
          }}
        >
          {/* Step 1 */}
          <ScrollReveal>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "48px 0",
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: 24,
                alignItems: "start",
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 200,
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                01
              </span>
              <div>
                <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, marginBottom: 16, lineHeight: 1.2 }}>
                  Plug in your guitar.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  One cable in, stereo out. Your signal enters Union Rig and stays analog the entire way through.
                  No conversion. No latency. The full weight of your pickups, your fingers, your attack —
                  preserved exactly as your instrument delivers it.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Step 2 */}
          <ScrollReveal>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "48px 0",
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: 24,
                alignItems: "start",
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 200,
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                02
              </span>
              <div>
                <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, marginBottom: 16, lineHeight: 1.2 }}>
                  AI builds 12 custom sounds for you.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  Trained on the collective understanding of all guitar music ever recorded, the AI inside
                  Union Rig knows what makes a great clean shimmer, what makes a lead cut through a mix,
                  and what makes a rhythm part sit perfectly in a band. It builds 12 sounds — your working
                  set — shaped to your playing style and the way you use your instrument.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Step 3 */}
          <ScrollReveal>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "48px 0",
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: 24,
                alignItems: "start",
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 200,
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                03
              </span>
              <div>
                <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, marginBottom: 16, lineHeight: 1.2 }}>
                  The signal stays analog. Always.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  Here is where Union Rig breaks from everything else: the AI shapes the parameters —
                  drive character, spatial depth, tonal weight — but your guitar signal never touches a
                  digital converter. It passes through analog circuitry the entire time. Hi-fidelity.
                  No artifacts. The warmth and power of your pickups, untouched.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Step 4 */}
          <ScrollReveal>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "48px 0",
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: 24,
                alignItems: "start",
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 200,
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                04
              </span>
              <div>
                <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, marginBottom: 16, lineHeight: 1.2 }}>
                  Intelligence meets warmth. That is the point.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  AI that understands tone at the deepest level. Analog signal path that refuses to
                  compromise your sound. Union Rig is the marriage of those two ideas — the precision
                  of machine learning with the soul of real circuitry. Not AI for the sake of AI.
                  AI in service of making you sound like yourself, but better.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ BOLD STATEMENT ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "100px 24px",
          textAlign: "center",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 300,
              lineHeight: 1.2,
              maxWidth: 800,
              margin: "0 auto",
              letterSpacing: "-0.02em",
            }}
          >
            Every sound you have ever loved was made by someone who trusted their gear.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p
            style={{
              fontSize: 15,
              color: "var(--accent)",
              marginTop: 32,
              fontWeight: 400,
            }}
          >
            Trust what works.
          </p>
        </ScrollReveal>
      </section>

      {/* ═══════ SIGNAL CHAIN ═══════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Fixed Signal Chain
          </p>
          <p
            style={{
              color: "var(--fg-dim)",
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 540,
              marginBottom: 40,
            }}
          >
            One topology. No menus. Six stages, always in the same order — because
            decisions make better instruments than options do.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <SignalChainGraphic />
        </ScrollReveal>
      </section>

      {/* ═══════ CONTROLS — Knobs + Footswitches ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 48,
              fontWeight: 600,
            }}
          >
            Six knobs. Four footswitches. Nothing else.
          </p>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 64,
            marginBottom: 64,
          }}
        >
          {/* Tone / Feel */}
          <ScrollReveal direction="left">
            <div>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 32,
                }}
              >
                Tone / Feel
              </p>
              <div style={{ display: "flex", gap: 32, marginBottom: 24 }}>
                <KnobGraphic label="Touch" value={0.35} />
                <KnobGraphic label="Heat" value={0.7} />
                <KnobGraphic label="Body" value={0.55} />
              </div>
              <p style={{ color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7 }}>
                Touch controls how much your pick attack matters. Heat dials in saturation from
                clean push to full breakup. Body shapes the tonal weight — thin and cutting to
                thick and warm.
              </p>
            </div>
          </ScrollReveal>

          {/* Space / Time */}
          <ScrollReveal direction="right">
            <div>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 32,
                }}
              >
                Space / Time
              </p>
              <div style={{ display: "flex", gap: 32, marginBottom: 24 }}>
                <KnobGraphic label="Depth" value={0.45} />
                <KnobGraphic label="Motion" value={0.6} />
                <KnobGraphic label="Tempo" value={0.5} />
              </div>
              <p style={{ color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7 }}>
                Depth sets how much space surrounds the signal — from dry to cathedral. Motion
                adds movement and modulation. Tempo locks time-based effects to your feel.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Footswitches */}
        <ScrollReveal>
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 48,
            }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 32,
              }}
            >
              Footswitches — left to right
            </p>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              <FootswitchGraphic label="Looper" active />
              <FootswitchGraphic label="Scene A/B" />
              <FootswitchGraphic label="Next" />
              <FootswitchGraphic label="Previous" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════ WORKING SET + E-INK ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 64,
            alignItems: "start",
          }}
        >
          {/* Working set */}
          <ScrollReveal>
            <div>
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 24,
                  fontWeight: 600,
                }}
              >
                12 sounds. 2 scenes each. No banks.
              </p>
              <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                Your working set is always loaded. Step through sounds with your feet.
                Switch scenes within a song. Hold the scene switch to morph between A and B,
                release to come back. Twenty-four playable states, zero menu diving.
              </p>
              <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7 }}>
                The AI learns how you adjust sound over time — not who you are. A local
                preference memory nudges future changes toward your tendencies. No cloud.
                No tracking. Reset it whenever you want.
              </p>
            </div>
          </ScrollReveal>

          {/* E-ink display */}
          <ScrollReveal delay={200}>
            <div style={{ textAlign: "center" }}>
              <EinkDisplayGraphic />
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginTop: 24,
                }}
              >
                4.2&quot; e-ink display
              </p>
              <p style={{ color: "var(--fg-dim)", fontSize: 13, lineHeight: 1.6, marginTop: 8, maxWidth: 280, margin: "8px auto 0" }}>
                Shows where you are. Not what to do. No meters. No animations.
                Orientation, not permission.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ LOOPER ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <ScrollReveal>
          <div style={{ maxWidth: 560 }}>
            <p
              style={{
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              Performance Looper
            </p>
            <h2
              style={{
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 400,
                marginBottom: 20,
                lineHeight: 1.2,
              }}
            >
              Your loop lives inside the instrument.
            </h2>
            <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7 }}>
              Single loop, sound-on-sound overdub. Recorded post-dynamics, pre-space —
              so when you change the space or switch scenes, the loop responds. It is not
              a separate device bolted on. It is part of the instrument. Change sounds,
              change scenes — the loop persists. Clear it when you are done.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════ SPECS STRIP ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "64px 24px",
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 40,
            textAlign: "center",
          }}
        >
          {[
            { value: "Mono In", label: "Stereo Out" },
            { value: "6", label: "Macro Knobs" },
            { value: "4", label: "Footswitches" },
            { value: "12", label: "Sounds Loaded" },
            { value: "24", label: "Playable States" },
            { value: "0", label: "Menu Dives" },
          ].map((stat) => (
            <ScrollReveal key={stat.label}>
              <div>
                <p
                  style={{
                    fontSize: "clamp(28px, 4vw, 40px)",
                    fontWeight: 300,
                    color: "var(--fg)",
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--fg-dim)",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════ HARDWARE ═══════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "100px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 24,
              fontWeight: 600,
            }}
          >
            Built to last
          </p>
        </ScrollReveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 48,
          }}
        >
          {[
            {
              title: "CNC Aluminum Enclosure",
              desc: "Machined from solid aluminum. No plastic. Stage-proof and studio-grade.",
            },
            {
              title: "Internal Power Supply",
              desc: "IEC C14 inlet with universal AC-DC conversion. No wall wart. Earth bonded to chassis.",
            },
            {
              title: "Deterministic DSP Engine",
              desc: "Audio processing is isolated and real-time. No OS jitter. No dropouts. Ever.",
            },
            {
              title: "AI on the Control Plane",
              desc: "The AI shapes parameters and builds sounds. It never touches your audio signal. That stays analog.",
            },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 100}>
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    marginBottom: 10,
                    color: "var(--fg)",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════ WAITLIST ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          padding: "120px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ScrollReveal>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 300,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            $849. Shipping 2026.
          </h2>
          <p
            style={{
              color: "var(--fg-dim)",
              fontSize: 15,
              marginBottom: 40,
              maxWidth: 440,
              lineHeight: 1.6,
            }}
          >
            Leave your email and we will let you know the moment Union Rig is ready.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <WaitlistForm />
        </ScrollReveal>
      </section>

      <Footer />
    </>
  );
}
