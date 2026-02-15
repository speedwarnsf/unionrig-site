import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import ScrollReveal from "@/components/ScrollReveal";
import UnionLogo from "@/components/UnionLogo";
import SignalChainGraphic from "@/components/SignalChainGraphic";
import SignalChainView from "@/components/SignalChainView";
import KnobGraphic from "@/components/KnobGraphic";
import FootswitchGraphic from "@/components/FootswitchGraphic";
import EinkDisplayGraphic from "@/components/EinkDisplayGraphic";
import RigSimulator from "@/components/RigSimulator";
import SoundBrowser from "@/components/SoundBrowser";
import PresetCompare from "@/components/PresetCompare";
import AmpSimulator from "@/components/AmpSimulator";
import Tuner from "@/components/Tuner";
import RigSharing from "@/components/RigSharing";
import RandomizeRig from "@/components/RandomizeRig";

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
          justifyContent: "flex-start",
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
            alt="Union Rig — mono-in, stereo-out guitar instrument"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center 30%",
              opacity: 0.6,
            }}
          />
          {/* Top fade for text legibility */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "50%",
              background: "linear-gradient(to bottom, var(--bg) 0%, transparent 70%)",
              opacity: 0.75,
            }}
          />
        </div>

        {/* Hero content — logo + tagline at bottom */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "32svh 24px 0",
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
                fontSize: "clamp(18px, 3.2vw, 29px)",
                color: "var(--fg)",
                fontWeight: 300,
                fontStyle: "italic",
                maxWidth: 600,
                marginTop: 40,
                marginBottom: 0,
                lineHeight: 1.4,
              }}
            >
              Our AI just permanently broke your pedalboard.{" "}
              <span style={{ fontWeight: 700 }}>You&apos;re welcome.</span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ SECOND PARAGRAPH + PRICE ═══════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 0",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: "clamp(16px, 2.5vw, 20px)",
              color: "var(--fg-dim)",
              maxWidth: 580,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            <strong>Union Rig&apos;s</strong> AI-driven effects engine doesn&apos;t care about your feelings. The warm, compressed, <strong>fully analogue</strong> signal chain does.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <div
            style={{
              width: "100%",
              marginBottom: 32,
            }}
          >
            <Image
              src="/union-rig-hero.jpg"
              alt="Union Rig pedal"
              width={1200}
              height={800}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <p
            style={{
              fontSize: 12,
              color: "var(--fg-dim)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            $849 — Shipping 2027
          </p>
        </ScrollReveal>
      </section>

      {/* ═══════ THE PITCH — How it works ═══════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px 80px",
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
                  One cable in. Stereo out.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  Your signal enters a fixed topology — six processing stages, always in the same
                  order. We tried every other arrangement. This is the one where nothing fights
                  anything else. The weight of your pickups, the way you dig in — it all passes
                  through intact.
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
                  Twelve sounds. Built for your hands.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  The engine builds your working set — twelve sounds shaped to how you actually
                  play. Not presets pulled from a library. Each one is a complete signal state:
                  dynamics, saturation character, spatial depth, stereo field, output shaping.
                  All tuned together so they work as a set, not a collection.
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
                  Every knob moves multiple things at once.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  Each macro control maps to several parameters simultaneously through curved
                  relationships. Turn Heat up and the saturation doesn&apos;t just clip — it breathes.
                  Asymmetric harmonics shift the overtone balance while the frequency response
                  reshapes around them. One knob. Many variables. All moving together on purpose.
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
                  Scenes morph. The sound never breaks.
                </h2>
                <p style={{ color: "var(--fg-dim)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                  Hold the scene switch and the engine crossfades every parameter between A and B —
                  smoothly, with no stepping, no zipper noise, no dropout. Release and it comes back.
                  Every transition is shaped so the midpoint sounds as intentional as the endpoints.
                  Twenty-four playable states. Zero interruptions.
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
              color: "var(--fg-dim)",
              marginTop: 32,
              fontWeight: 400,
              maxWidth: 500,
              margin: "32px auto 0",
              lineHeight: 1.6,
            }}
          >
            Machines are useless if you can&apos;t trust them.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={350}>
          <p
            style={{
              fontSize: 15,
              color: "var(--accent)",
              marginTop: 16,
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
              marginBottom: 16,
            }}
          >
            Six stages. Fixed order. Each one exists because we tried removing it and the sound got worse.
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
            Dynamics reshape how your playing enters the chain — not just compression, but
            sensitivity to your touch. Drive stages use nonlinear saturation with asymmetric
            harmonic content that shifts as you push harder. The stereo field is built from
            mono through time-domain processing — real width, no phase tricks. The space
            engine doesn&apos;t simulate a room. It builds one around your signal, sample by
            sample. Cabinet modeling adds dimensional character. The output stage limits
            transparently so nothing clips on the way out.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <SignalChainGraphic />
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <div style={{ marginTop: 32 }}>
            <p style={{
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--fg-dim)", marginBottom: 8,
            }}>Interactive signal flow -- drag to reorder</p>
            <SignalChainView interactive />
          </div>
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
                Touch reshapes how your dynamics hit the chain. It&apos;s not a volume knob —
                it&apos;s a sensitivity curve that changes threshold, ratio, and response time
                together. Heat is multi-stage saturation with asymmetric harmonics that shift
                the overtone balance as you push harder. Body moves the tonal center of gravity —
                low-end resonance, high-frequency rolloff, and air, all on one control.
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
                Depth controls the space engine — algorithmic reverb that responds to
                your signal, not a static impulse. Wet level, decay time, and damping
                all move together. Motion adds character and movement through the
                modulation stage. Tempo sets the time reference for anything rhythmic.
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

      {/* ═══════ TRY THE RIG ═══════ */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <ScrollReveal>
          <p
            style={{
              fontSize: "clamp(20px, 3vw, 32px)",
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--fg)",
              marginBottom: 48,
            }}
          >
            Sound is math with a little bit of chaos.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <SoundBrowser />
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <PresetCompare />
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <RigSimulator />
        </ScrollReveal>

        {/* Amp Simulator */}
        <ScrollReveal delay={250}>
          <div style={{ marginTop: 64 }}>
            <h3 style={{
              fontSize: "clamp(20px, 3.5vw, 32px)", fontWeight: 300,
              letterSpacing: "-0.02em", marginBottom: 12,
            }}>Amp Simulator</h3>
            <p style={{
              color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7,
              maxWidth: 480, marginBottom: 32,
            }}>
              Choose your amp model and dial in the EQ. Clean sparkle, British crunch, or full high-gain saturation.
            </p>
            <AmpSimulator />
          </div>
        </ScrollReveal>

        {/* Tuner */}
        <ScrollReveal delay={300}>
          <div style={{ marginTop: 64 }}>
            <h3 style={{
              fontSize: "clamp(20px, 3.5vw, 32px)", fontWeight: 300,
              letterSpacing: "-0.02em", marginBottom: 12,
            }}>Chromatic Tuner</h3>
            <p style={{
              color: "var(--fg-dim)", fontSize: 14, lineHeight: 1.7,
              maxWidth: 480, marginBottom: 32,
            }}>
              Built-in tuner using your microphone. No external apps needed.
            </p>
            <Tuner />
          </div>
        </ScrollReveal>

        {/* Randomize + Share */}
        <ScrollReveal delay={350}>
          <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
            <RandomizeRig />
            <RigSharing />
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
            $849. Shipping 2027.
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
