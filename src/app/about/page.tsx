import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

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

export default function About() {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: 56 }}>
        <section style={section}>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 300,
              marginBottom: 32,
            }}
          >
            About
          </h1>

          <p style={{ ...body, marginBottom: 24 }}>
            Most guitar gear asks you to learn it. Union Rig is designed to
            disappear. You should be thinking about the song, not the signal
            chain.
          </p>

          <p style={{ ...body, marginBottom: 24 }}>
            The topology is fixed because decisions make better instruments than
            options do. Six knobs because that is enough to shape any sound in
            real time. Twelve sounds because that is a working set for a working
            musician -- not a catalog for someone who collects presets.
          </p>

          <p style={{ ...body, marginBottom: 24 }}>
            We chose e-ink for the display because screens should not compete
            with your ears. The display updates when you need orientation. The
            rest of the time, it is quiet.
          </p>

          <p style={{ ...body, marginBottom: 24 }}>
            The looper records post-dynamics, pre-space. That means your loop
            lives inside the instrument. Change the space, change the scene --
            the loop responds. It is not a separate device bolted on. It is part
            of the instrument.
          </p>

          <p style={{ ...body, marginBottom: 24 }}>
            The preference memory learns how you adjust sound -- not who you are.
            It nudges future changes toward your tendencies, but only when you
            explicitly save. No background tracking. No cloud. Reset it whenever
            you want.
          </p>

          <p style={{ ...body, marginBottom: 48 }}>
            Union Rig is built for people who play shows. Plug in, step on it,
            trust it. That is the whole idea.
          </p>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 48,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                marginBottom: 12,
              }}
            >
              Stay in the loop.
            </h2>
            <p style={{ ...body, marginBottom: 24 }}>
              We will let you know when Union Rig is ready.
            </p>
            <WaitlistForm />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
