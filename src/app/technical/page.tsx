import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const section: React.CSSProperties = {
  maxWidth: 800,
  margin: "0 auto",
  padding: "64px 24px",
};

const label: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--fg-dim)",
  marginBottom: 24,
};

const body: React.CSSProperties = {
  color: "var(--fg-dim)",
  fontSize: 15,
  lineHeight: 1.7,
};

export default function Technical() {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: 56 }}>
        {/* Header */}
        <section style={{ ...section, paddingBottom: 32 }}>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 300,
              marginBottom: 16,
            }}
          >
            Technical
          </h1>
          <p style={{ ...body, maxWidth: 560 }}>
            Union Rig is a mono-in, stereo-out guitar instrument with a fixed
            signal structure, a 12-sound working set, two scenes per sound, and a
            performance looper.
          </p>
        </section>

        {/* Signal Chain */}
        <section
          style={{
            ...section,
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={label}>Fixed Signal Structure</p>
          <div style={{ marginBottom: 32 }}>
            {[
              {
                name: "Dynamics",
                desc: "Input compression and gating. Responds to your pick attack.",
              },
              {
                name: "Drive",
                desc: "Gain staging and saturation. From clean push to full breakup.",
              },
              {
                name: "Character / Motion",
                desc: "Tonal shaping and modulation. The voice of the sound.",
              },
              {
                name: "Stereo Width",
                desc: "Mono signal splits to stereo field here.",
              },
              {
                name: "Space",
                desc: "Delay and reverb in true stereo.",
              },
              {
                name: "Output Shaping",
                desc: "Final EQ and level. What leaves the box.",
              },
            ].map((block, i) => (
              <div
                key={block.name}
                style={{
                  padding: "20px 0",
                  borderBottom:
                    i < 5 ? "1px solid var(--border)" : "none",
                }}
              >
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 400,
                    marginBottom: 4,
                  }}
                >
                  {block.name}
                </p>
                <p style={{ ...body, fontSize: 14 }}>{block.desc}</p>
              </div>
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
          <p style={label}>Controls</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 48,
              marginBottom: 48,
            }}
          >
            <div>
              <p style={{ ...label, marginBottom: 16 }}>
                Left Cluster -- Tone / Feel
              </p>
              <p style={body}>
                <strong style={{ color: "var(--fg)" }}>Touch</strong> --
                dynamics sensitivity. How much your pick matters.
              </p>
              <p style={{ ...body, marginTop: 12 }}>
                <strong style={{ color: "var(--fg)" }}>Heat</strong> -- drive
                amount. Clean to saturated.
              </p>
              <p style={{ ...body, marginTop: 12 }}>
                <strong style={{ color: "var(--fg)" }}>Body</strong> -- tonal
                character. Thin to thick.
              </p>
            </div>
            <div>
              <p style={{ ...label, marginBottom: 16 }}>
                Right Cluster -- Space / Time
              </p>
              <p style={body}>
                <strong style={{ color: "var(--fg)" }}>Depth</strong> -- how
                much space surrounds the signal.
              </p>
              <p style={{ ...body, marginTop: 12 }}>
                <strong style={{ color: "var(--fg)" }}>Motion</strong> --
                modulation intensity.
              </p>
              <p style={{ ...body, marginTop: 12 }}>
                <strong style={{ color: "var(--fg)" }}>Tempo</strong> -- time
                division for delays and modulation.
              </p>
            </div>
          </div>

          <p style={{ ...label, marginBottom: 16 }}>Footswitches (left to right)</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                name: "Looper",
                desc: "Single loop, sound-on-sound. Post-dynamics, pre-space. Persists across sound and scene changes.",
              },
              {
                name: "Scene",
                desc: "Tap to toggle A/B. Hold to morph toward opposite scene; release returns smoothly.",
              },
              {
                name: "Next Sound",
                desc: "Advance through your 12-sound working set. Wraps around.",
              },
              {
                name: "Previous Sound",
                desc: "Step back through the working set. Wraps around.",
              },
            ].map((sw) => (
              <div key={sw.name}>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  {sw.name}
                </p>
                <p style={{ ...body, fontSize: 13 }}>{sw.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Working Set */}
        <section
          style={{
            ...section,
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={label}>Working Set</p>
          <p style={{ ...body, maxWidth: 560 }}>
            12 sounds loaded at a time. No banks, no scrolling. Each sound has
            Scene A and Scene B -- musically related variations for within-song
            movement. Linear navigation by foot. 24 playable states total.
          </p>
        </section>

        {/* Preference Memory */}
        <section
          style={{
            ...section,
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={label}>Preference Memory</p>
          <p style={{ ...body, maxWidth: 560, marginBottom: 16 }}>
            Union Rig maintains a local Preference Vector -- a small set of
            macro-level biases stored on-device. It learns how you tend to adjust
            sound, but only from explicit commits. Save a sound and the bias
            nudges slightly toward your choices.
          </p>
          <p style={{ ...body, maxWidth: 560 }}>
            No identity tracking. No cloud. No background listening. It never
            remembers who you are. It remembers how you adjust sound. Reset it
            anytime.
          </p>
        </section>

        {/* Display */}
        <section
          style={{
            ...section,
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={label}>Display</p>
          <p style={{ ...body, maxWidth: 560 }}>
            4.2-inch portrait e-ink. Shows the current sound name, active scene,
            and what just changed. No meters, no animations. You play first,
            listen second, and look only when you need orientation -- not
            permission.
          </p>
        </section>

        {/* Hardware */}
        <section
          style={{
            ...section,
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={label}>Hardware</p>
          <div style={{ ...body, maxWidth: 560 }}>
            <p style={{ marginBottom: 12 }}>
              CNC aluminum enclosure.
            </p>
            <p style={{ marginBottom: 12 }}>
              IEC C14 inlet with internal universal AC-DC power supply. No wall
              wart. Earth bonded to chassis.
            </p>
            <p style={{ marginBottom: 12 }}>
              Mono input. Stereo output (L/R).
            </p>
            <p>
              Deterministic DSP audio engine. LLM assistant is optional and
              operates on the control plane only -- never in the audio path.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
