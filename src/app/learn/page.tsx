import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn",
  description: "Guitar tone education: signal chain basics, tone recipes, famous rig breakdowns, and a glossary of essential guitar terms.",
};

/* ═══════ DATA ═══════ */

const SIGNAL_CHAIN = [
  {
    name: "Compression",
    aka: "Dynamics",
    what: "A compressor reduces the difference between your loudest and quietest notes. It squeezes the dynamic range so everything sits more evenly in the mix.",
    why: "Gives clean tones a polished, studio feel. Adds sustain by bringing up the tail of each note. Essential for funk, country, and any style where note-to-note consistency matters.",
    controls: [
      { name: "Threshold", desc: "The volume level above which compression kicks in. Lower threshold = more compression." },
      { name: "Ratio", desc: "How aggressively the signal is reduced once it crosses the threshold. 2:1 is gentle; 8:1 is heavy limiting." },
      { name: "Attack", desc: "How fast the compressor reacts. Slow attack lets the pick transient through (more percussive). Fast attack clamps down immediately (smoother)." },
      { name: "Release", desc: "How quickly compression lets go after the signal drops below threshold." },
      { name: "Makeup Gain", desc: "Boosts the overall level back up after compression reduces it." },
      { name: "Mix / Blend", desc: "Parallel compression -- blends compressed signal with your dry signal for a more natural feel." },
    ],
  },
  {
    name: "Overdrive / Distortion",
    aka: "Drive",
    what: "Drive effects clip your guitar signal, adding harmonic content that ranges from warm grit to full saturation. The difference between overdrive and distortion is degree: overdrive is soft clipping (like a tube amp pushed hard), distortion is hard clipping (more aggressive, more sustain).",
    why: "The foundation of rock, blues, and metal tone. Even a little drive adds warmth and presence to clean tones.",
    controls: [
      { name: "Gain / Drive", desc: "How much clipping is applied. Low = edge of breakup. High = full saturation." },
      { name: "Tone / EQ", desc: "Shapes the frequency content of the distorted signal. Rolling off highs darkens the sound; boosting adds bite." },
      { name: "Level / Volume", desc: "Output volume after distortion. Use this to match your bypassed volume or push the next stage." },
      { name: "Clipping Type", desc: "Soft clip (tube-like warmth), hard clip (tighter, more compressed), fuzz (extreme, gated)." },
    ],
  },
  {
    name: "Chorus / Modulation",
    aka: "Character",
    what: "Chorus duplicates your signal, slightly detunes and delays the copy, then mixes it back. The result is a shimmering, widened sound. Related effects include flanger (shorter delay, feedback) and vibrato (pitch modulation only, no dry signal).",
    why: "Adds dimension and movement. A subtle chorus makes clean tones feel alive. Heavy chorus is the sound of 80s guitar. Flanging adds a jet-plane sweep.",
    controls: [
      { name: "Rate", desc: "How fast the modulation oscillates. Slow = gentle movement. Fast = wobble or Leslie-like rotation." },
      { name: "Depth", desc: "How far the pitch/delay is modulated. More depth = more obvious effect." },
      { name: "Mix", desc: "Balance between dry and modulated signal." },
      { name: "Tone", desc: "Brightens or darkens the modulated signal relative to the dry." },
    ],
  },
  {
    name: "Delay",
    aka: "Time",
    what: "Delay records your signal and plays it back after a set time. Single repeats create a slapback echo. Multiple repeats with feedback create rhythmic patterns or ambient washes.",
    why: "Adds depth and space without the diffusion of reverb. Rhythmic delays (dotted eighth notes) are a defining element of post-punk and ambient guitar. Slapback delay is essential to rockabilly and early rock and roll.",
    controls: [
      { name: "Time", desc: "The interval between repeats, usually in milliseconds or synced to tempo." },
      { name: "Feedback", desc: "How many times the echo repeats. Low = one or two repeats. High = cascading trails." },
      { name: "Mix / Level", desc: "Volume of the delayed signal relative to dry." },
      { name: "Modulation", desc: "Adds slight pitch variation to repeats, simulating tape or analog degradation." },
    ],
  },
  {
    name: "Reverb",
    aka: "Space",
    what: "Reverb simulates the reflections of sound in a physical space -- a room, a hall, a cathedral, a metal plate. It adds a tail of ambience after each note.",
    why: "Without reverb, guitar sounds unnaturally dry. Even a small room reverb adds life. Larger reverbs create atmosphere. Spring reverb is the classic surf/country/blues sound.",
    controls: [
      { name: "Decay / Time", desc: "How long the reverb tail lasts. Short = small room. Long = cathedral." },
      { name: "Damping", desc: "How quickly high frequencies die out in the reverb tail. High damping = warmer, darker tail." },
      { name: "Wet / Dry", desc: "Balance between the reverbed and original signal." },
      { name: "Pre-delay", desc: "A short gap before reverb kicks in. Separates the dry attack from the reverb wash for clarity." },
    ],
  },
  {
    name: "Cabinet Simulation",
    aka: "Cab",
    what: "A cabinet sim models the frequency response of a guitar speaker cabinet and microphone placement. Guitar speakers are intentionally limited in range -- they roll off harsh highs and shape the low end, which is a huge part of what makes electric guitar sound like electric guitar.",
    why: "Direct guitar signal sounds thin and fizzy. Cabinet simulation is what makes amp modelers and direct recording sound real. It is the most underrated part of the signal chain.",
    controls: [
      { name: "Low Resonance", desc: "The low-frequency bump of the speaker. Higher values add thump; lower values tighten the bass." },
      { name: "High Roll-off", desc: "Where the speaker starts cutting high frequencies. Lower values = darker, smoother tone." },
      { name: "Air / Presence", desc: "A high-shelf boost that simulates the brightness of close-miking or room reflections." },
    ],
  },
];

const TONE_RECIPES = [
  {
    name: "Hendrix Clean",
    artist: "Jimi Hendrix",
    genre: "Psychedelic Blues",
    description: "Warm, round clean tone with a hint of natural amp breakup. Think \"Little Wing\" intro or the clean passages in \"Bold as Love.\" The Strat's neck pickup into a slightly pushed amp gives that vocal, singing quality.",
    settings: {
      compression: "Light compression. Threshold around -18dB, ratio 2:1. Slow attack to preserve pick dynamics. Mix at 40%.",
      drive: "Barely there. Soft clip, gain at 3-5dB. Just enough to warm the signal without obvious distortion. Tone slightly dark.",
      modulation: "Subtle chorus or univibe. Rate very slow (0.3-0.5 Hz), depth at 20-30%. Mix around 25%. This is the secret sauce.",
      reverb: "Medium spring-style reverb. Decay 2-3 seconds. Damping moderate. Wet at 30%.",
      cabinet: "Low resonance at 100-120 Hz. High roll-off around 6-7 kHz. Moderate air.",
    },
    songs: ["Little Wing", "Bold as Love", "The Wind Cries Mary", "Castles Made of Sand"],
  },
  {
    name: "Gilmour Lead",
    artist: "David Gilmour",
    genre: "Progressive Rock",
    description: "Soaring, sustained lead tone with rich harmonics and expansive space. The hallmark of Pink Floyd's emotional guitar work. Big Muff-style fuzz into a clean amp, with delay and reverb creating an enormous soundscape.",
    settings: {
      compression: "Moderate compression. Threshold -20dB, ratio 3:1. Medium attack. Adds sustain without killing dynamics.",
      drive: "Medium-high gain, fuzz-style. Gain 15-22dB. Soft or tube clipping. Tone slightly scooped in the mids but not thin. Mix at 70-80%.",
      modulation: "Optional -- very subtle chorus on some tones. Rate slow, depth minimal. Often bypassed for lead.",
      reverb: "Large hall or plate reverb. Decay 4-6 seconds. Damping low (bright tail). Wet at 35-45%. This is where the Gilmour sound lives.",
      cabinet: "Low resonance at 100 Hz. High roll-off at 5.5-6.5 kHz. Less air for a smoother, darker character.",
    },
    songs: ["Comfortably Numb (solo)", "Time (solo)", "Shine On You Crazy Diamond", "Money (solo)"],
  },
  {
    name: "Frusciante Funk",
    artist: "John Frusciante",
    genre: "Funk Rock",
    description: "Tight, percussive clean tone that snaps and pops on every strum. The Chili Peppers' rhythm tone is all about dynamics and attack. Strat through a clean amp with compression keeping everything punchy and even.",
    settings: {
      compression: "Key ingredient. Threshold -15 to -20dB, ratio 3-4:1. Fast attack to clamp down on peaks. This is what makes the funk chop even and percussive. Mix at 60-70%.",
      drive: "Clean or barely breaking up. If any drive, keep gain under 5dB with high mix of clean blend. The dirt comes from playing hard.",
      modulation: "Usually off for funk rhythm. Occasional chorus on bridge pickup clean tones.",
      reverb: "Minimal. Short room reverb, decay under 1.5 seconds. Wet at 15-20%. Funk is dry and in your face.",
      cabinet: "Tighter bass -- low resonance at 120-140 Hz. High roll-off around 7-8 kHz. More air for that Strat sparkle.",
    },
    songs: ["Can't Stop", "Snow (Hey Oh)", "Under the Bridge (verse)", "Scar Tissue"],
  },
  {
    name: "Edge Delay",
    artist: "The Edge (U2)",
    genre: "Post-Punk / Arena Rock",
    description: "The Edge's sound is defined by rhythmic dotted-eighth-note delay that turns simple picking patterns into complex, shimmering textures. The guitar almost becomes a synthesizer. Clean tone with heavy delay and moderate reverb creates the signature U2 atmosphere.",
    settings: {
      compression: "Moderate. Threshold -18dB, ratio 2.5:1. Keeps the repeated delays at a consistent level.",
      drive: "Clean to light overdrive. Gain 3-6dB. The delay does the heavy lifting -- dirt would muddy the repeats.",
      modulation: "Light chorus to widen the stereo image. Rate slow, depth subtle. Adds shimmer to the delays.",
      reverb: "Medium hall. Decay 3-4 seconds. The reverb sits behind the delay, adding depth without washing out the rhythmic pattern. Wet at 25-35%.",
      cabinet: "Bright and open. Low resonance at 90-100 Hz. High roll-off at 7-8 kHz. Good amount of air.",
    },
    songs: ["Where the Streets Have No Name", "I Still Haven't Found What I'm Looking For", "With or Without You", "The Unforgettable Fire"],
    note: "Union Rig's stereo output is ideal for this style. The micro-delay stereo widening combined with dotted-eighth delay creates a massive sound field.",
  },
  {
    name: "Cobain Grunge",
    artist: "Kurt Cobain",
    genre: "Grunge",
    description: "Raw, aggressive distortion with a mid-heavy voice. The Nirvana sound is a cheap guitar through a Boss DS-1 or similar into a loud amp. It is deliberately unpolished -- the imperfections are the point. Quiet verses with clean tone, then smashing into full distortion for choruses.",
    settings: {
      compression: "Off or very light. Grunge thrives on uneven dynamics. If used, keep ratio low and mix under 30%.",
      drive: "High gain, hard or tube clipping. Gain 20-30dB. Tone tilted slightly bright but not harsh. Mid-forward EQ -- do not scoop the mids. Mix at 85-100%.",
      modulation: "Off. Chorus appears on some Nirvana clean tones (Come as You Are uses chorus on the riff) but the distorted sound is dry.",
      reverb: "Minimal to none on distorted tone. Short room at most. Wet under 15%. The rawness comes from the dryness.",
      cabinet: "Mid-heavy. Low resonance at 100-120 Hz. High roll-off at 5-6 kHz. Low air. This keeps it thick and aggressive without fizz.",
    },
    songs: ["Smells Like Teen Spirit", "In Bloom", "Breed", "Lithium"],
  },
];

const FAMOUS_RIGS = [
  {
    name: "Hendrix Rig",
    artist: "Jimi Hendrix",
    era: "1966-1970",
    gear: "Fender Stratocaster, Marshall Super Lead 100W, Vox Wah, Fuzz Face, Uni-Vibe, Octavia",
    sound: "Warm, vocal, and three-dimensional. Even at high gain, Hendrix's tone retained clarity and note separation. The combination of a Strat's single coils with a cranked Marshall created natural harmonic overtones that sang. His use of the wah as a tone-shaping tool (parked wah) rather than just an effect was revolutionary. The Uni-Vibe added a swirling, underwater quality that no other modulation quite replicates.",
    genre: "Blues rock, psychedelic rock, hard rock. Hendrix essentially invented the vocabulary of electric guitar tone.",
    listen: ["\"Little Wing\" -- the clean intro is a masterclass in dynamic touch and chord voicing", "\"Voodoo Child (Slight Return)\" -- wah-driven rhythm with explosive lead breaks", "\"All Along the Watchtower\" -- layered studio tones with multiple guitar textures"],
  },
  {
    name: "Gilmour Rig",
    artist: "David Gilmour",
    era: "1973-1994",
    gear: "Fender Stratocaster (black), Hiwatt DR103, WEM cabinets, Big Muff Pi, Electro-Harmonix Electric Mistress, Binson Echorec, MXR Dynacomp",
    sound: "Liquid, singing sustain with enormous spatial depth. Gilmour's tone is defined by long, controlled feedback and a reverberant soundscape that makes single notes feel like orchestral events. The Big Muff provides a thick, violin-like sustain without harsh fizz. The Echorec delay adds rhythmic complexity. The Hiwatt's clean headroom lets the pedals do the shaping while maintaining clarity at high volume.",
    genre: "Progressive rock, art rock. Gilmour's style prioritizes emotion and space over technical speed.",
    listen: ["\"Comfortably Numb\" second solo -- often cited as the greatest guitar solo ever recorded", "\"Time\" solo -- aggressive bends with delay and reverb creating a vast soundscape", "\"Shine On You Crazy Diamond\" -- slow, deliberate phrasing with maximum sustain"],
  },
  {
    name: "Frusciante Rig",
    artist: "John Frusciante",
    era: "1999-2006",
    gear: "Fender Stratocaster (62 reissue), Marshall Major, Boss DS-2, Boss CE-1, Electro-Harmonix Holy Grail, Ibanez WH10",
    sound: "Percussive and rhythmic on cleans, with a nasal, cutting distortion for lead work. Frusciante's clean funk tone is tight, compressed, and full of attack -- every string rake and muted strum is intentional. His distorted tone uses the DS-2's Turbo II mode for a mid-pushed, almost vocal quality. The CE-1 Boss Chorus adds warmth to clean passages.",
    genre: "Funk rock, alternative rock, melodic punk influence. The Chili Peppers' sound lives at the intersection of funk precision and punk energy.",
    listen: ["\"Can't Stop\" -- tight funk rhythm with percussive muting", "\"Snow (Hey Oh)\" -- rapid fingerpicking with clean compression", "\"Dani California\" solo -- raw distortion with wah, very Hendrix-influenced"],
  },
  {
    name: "Edge Rig",
    artist: "The Edge",
    era: "1984-present",
    gear: "Gibson Explorer / Fender Stratocaster, Vox AC30, Korg SDD-3000 delay, Electro-Harmonix Memory Man, TC Electronic 2290, various modulation",
    sound: "Rhythmic and architectural. The Edge uses delay as a compositional tool rather than an effect -- the repeats are integral to the musical part. His tone is relatively clean and bright, allowing the delay patterns to remain distinct. The AC30's chime and natural compression provide warmth without muddying the repeats. Stereo delay spread creates an enveloping wall of sound in live performance.",
    genre: "Post-punk, arena rock, ambient. U2's guitar sound redefined what a rock guitar could be -- more texture than riff.",
    listen: ["\"Where the Streets Have No Name\" -- the defining delay guitar part", "\"Bad\" -- layered delays creating rhythmic complexity from simple picking", "\"With or Without You\" -- infinite sustain (EBow) with shimmer delay"],
  },
  {
    name: "Cobain Rig",
    artist: "Kurt Cobain",
    era: "1989-1994",
    gear: "Fender Mustang / Jaguar, Mesa Boogie Studio .22, Boss DS-1 / DS-2, Electro-Harmonix Small Clone, Tech 21 SansAmp",
    sound: "Deliberately raw and abrasive. Cobain's distorted tone is thick, mid-heavy, and intentionally lo-fi. He used cheap pedals and budget guitars not out of necessity but because their imperfections suited the music. The DS-1 into a clean amp creates a buzzy, aggressive distortion that cuts through loud drums and bass. The Small Clone chorus appears on several iconic clean parts. The dynamic contrast between whisper-quiet verses and explosive distorted choruses became grunge's defining structural device.",
    genre: "Grunge, alternative rock, punk. Nirvana proved that tone is about intent, not equipment cost.",
    listen: ["\"Smells Like Teen Spirit\" -- the quiet-loud dynamic in its purest form", "\"Come as You Are\" -- clean chorus tone with a hypnotic riff", "\"In Bloom\" -- heavy distortion with melodic sensibility"],
  },
];

const GLOSSARY: { term: string; definition: string }[] = [
  { term: "Headroom", definition: "The amount of volume available before an amp or pedal begins to distort. High headroom means the signal stays clean at louder levels. A Fender Twin has lots of headroom; a Vox AC15 has less. In the context of Union Rig, headroom determines how much level the output stage can handle before the limiter engages." },
  { term: "Breakup", definition: "The point where a clean signal begins to distort. When a tube amp is pushed, it transitions from clean to crunchy -- this transition is breakup. The best amp tones live right at the edge of breakup, where picking softly stays clean and digging in produces grit." },
  { term: "Sag", definition: "A slight compression and slowdown in an amp's response when hit with a hard transient, caused by the power supply momentarily drooping. Sag gives tube amps their characteristic \"spongy\" feel and is why they respond differently to pick dynamics than solid-state amps." },
  { term: "Presence", definition: "A high-frequency control found on most amps, operating in the power amp section. Unlike treble (which shapes the preamp), presence adds brightness and cut after the gain stages. On Union Rig, the cabinet's \"air\" control serves a similar function." },
  { term: "Transient", definition: "The initial attack of a note -- the sharp, percussive spike when the pick hits the string. Transients contain a lot of high-frequency energy and are what give guitar its rhythmic articulation. Compressor attack time controls how much of the transient passes through." },
  { term: "Clipping", definition: "When a signal exceeds the maximum level a circuit can handle, the peaks of the waveform are \"clipped\" off. Soft clipping rounds the peaks (tube-like warmth). Hard clipping chops them flat (more aggressive, tighter distortion)." },
  { term: "Wet / Dry", definition: "Wet refers to the processed (effected) signal; dry is the original, unprocessed signal. A \"wet/dry\" mix control lets you blend the two. 100% wet on reverb = fully ambient. 100% dry = no effect." },
  { term: "Unity Gain", definition: "When a pedal or effect outputs at the same volume as the input signal when bypassed. Setting a pedal to unity gain ensures no volume jump when you engage or bypass it. Important for live performance." },
  { term: "Tone Stack", definition: "The EQ section of an amp, typically consisting of bass, mid, and treble controls. Different amp designs place the tone stack at different points in the circuit, which fundamentally changes how EQ interacts with gain." },
  { term: "Impedance", definition: "Electrical resistance measured in ohms. Guitar pickups are high impedance; most audio gear is low impedance. Impedance mismatches can cause tone loss (typically high-frequency roll-off). Buffer pedals convert high-Z guitar signal to low-Z for long cable runs." },
  { term: "Buffer", definition: "A unity-gain circuit that converts a high-impedance guitar signal to low impedance without changing the tone. Prevents signal degradation over long cable runs or through multiple pedals. Some players prefer true bypass; others prefer buffered bypass." },
  { term: "True Bypass", definition: "When a pedal is off, the signal passes through a direct mechanical switch with no active circuitry. Preserves the raw guitar signal but can cause issues with long signal chains (high-impedance signal degrading over multiple cable runs)." },
  { term: "Parallel Compression", definition: "Blending a compressed signal with the original dry signal. Preserves the natural dynamics and transients of the dry signal while adding the sustain and consistency of compression. Also called New York compression. Union Rig's dynamics section has a mix control for exactly this." },
  { term: "Impulse Response (IR)", definition: "A snapshot of a speaker cabinet's frequency response, captured by playing a test signal through the cab and recording the result. Used in digital modeling to accurately replicate the sound of specific cabinets and microphone placements." },
  { term: "Signal Chain", definition: "The order in which effects are connected from guitar to amp (or output). Order matters: compression before drive behaves differently than drive before compression. The standard chain is: dynamics, drive, modulation, delay, reverb, cabinet." },
  { term: "Gain Staging", definition: "Setting the volume levels at each point in the signal chain so that no stage is overloaded unintentionally and the signal-to-noise ratio stays healthy. Poor gain staging causes unwanted distortion or excessive noise." },
  { term: "Feedback (delay)", definition: "The portion of a delay's output that is fed back into its input, creating additional repeats. Low feedback = one or two echoes. High feedback = many repeats that can build into self-oscillation." },
  { term: "Damping", definition: "In reverb, damping controls how quickly high frequencies decay in the reverb tail. High damping = darker, warmer reverb (like a carpeted room). Low damping = brighter, longer-lasting highs (like a tile bathroom)." },
  { term: "LFO", definition: "Low Frequency Oscillator. A slow-moving wave (typically below 20 Hz) used to modulate parameters like pitch, volume, or filter cutoff. The LFO is what creates the sweep in chorus, tremolo, and phaser effects." },
  { term: "Asymmetric Clipping", definition: "When the positive and negative halves of the waveform are clipped differently. Adds even-order harmonics, which the ear perceives as warmer and more musical. Many classic overdrive circuits use asymmetric clipping." },
  { term: "Stereo Width", definition: "The perceived spaciousness of sound across the left-right field. Achieved through micro-delays, phase differences, or different processing on each channel. Union Rig uses micro-delay stereo widening to create a mono-compatible stereo image." },
];


/* ═══════ COMPONENT ═══════ */

export default function LearnPage() {
  return (
    <>
      <Nav />

      {/* Header */}
      <section style={{
        paddingTop: 96,
        paddingBottom: 48,
        paddingLeft: 24,
        paddingRight: 24,
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            marginBottom: 12,
          }}>
            Union Rig / Learn
          </p>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--fg)",
            marginBottom: 16,
          }}>
            Guitar Tone, Explained
          </h1>
          <p style={{
            fontSize: 16,
            color: "var(--fg-dim)",
            maxWidth: 640,
            lineHeight: 1.7,
          }}>
            Understanding your signal chain is the difference between dialing in a sound
            and stumbling into one. This guide covers what each effect does, how to
            recreate famous tones, and the vocabulary you need to talk about sound.
          </p>
        </div>
      </section>

      {/* TABLE OF CONTENTS */}
      <section style={{
        padding: "32px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            marginBottom: 16,
          }}>Contents</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 32px" }}>
            {[
              { href: "#signal-chain", label: "Signal Chain Basics" },
              { href: "#tone-recipes", label: "Tone Recipes" },
              { href: "#famous-rigs", label: "Famous Rigs" },
              { href: "#glossary", label: "Glossary" },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontSize: 13,
                letterSpacing: "0.02em",
                padding: "4px 0",
                borderBottom: "1px solid transparent",
              }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SIGNAL CHAIN BASICS ═══════ */}
      <section id="signal-chain" style={{ padding: "64px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 8,
          }}>01</h2>
          <h2 style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: 12,
          }}>
            Signal Chain Basics
          </h2>
          <p style={{
            fontSize: 14,
            color: "var(--fg-dim)",
            marginBottom: 48,
            maxWidth: 640,
            lineHeight: 1.7,
          }}>
            Your guitar signal flows through a chain of processing stages, each shaping
            the sound in a specific way. The order matters. Here is what each stage does
            and why it is where it is.
          </p>

          {/* Chain order diagram */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0,
            marginBottom: 48,
            borderTop: "1px solid var(--border)",
            borderLeft: "1px solid var(--border)",
          }}>
            {SIGNAL_CHAIN.map((block, i) => (
              <div key={block.name} style={{
                flex: "1 1 150px",
                padding: "16px 12px",
                borderRight: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: "var(--fg-dim)",
                  marginBottom: 4,
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--accent)",
                  letterSpacing: "0.05em",
                }}>
                  {block.name.split(" / ")[0]}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed breakdowns */}
          {SIGNAL_CHAIN.map((block) => (
            <div key={block.name} style={{
              marginBottom: 48,
              paddingBottom: 48,
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: "var(--fg)",
                  marginBottom: 4,
                }}>
                  {block.name}
                </h3>
                <p style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "var(--fg-dim)",
                  textTransform: "uppercase",
                }}>
                  Union Rig block: {block.aka}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}>What it does</h4>
                <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.7 }}>
                  {block.what}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}>Why it matters</h4>
                <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.7 }}>
                  {block.why}
                </p>
              </div>

              <div>
                <h4 style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 12,
                }}>Controls</h4>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 8,
                }}>
                  {block.controls.map((ctrl) => (
                    <div key={ctrl.name} style={{
                      padding: "12px 16px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--fg)",
                        marginBottom: 4,
                      }}>{ctrl.name}</div>
                      <p style={{
                        fontSize: 12,
                        color: "var(--fg-dim)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}>{ctrl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TONE RECIPES ═══════ */}
      <section id="tone-recipes" style={{
        padding: "64px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 8,
          }}>02</h2>
          <h2 style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: 12,
          }}>
            Tone Recipes
          </h2>
          <p style={{
            fontSize: 14,
            color: "var(--fg-dim)",
            marginBottom: 48,
            maxWidth: 640,
            lineHeight: 1.7,
          }}>
            How to dial in specific sounds on Union Rig. These are starting points --
            adjust to taste based on your guitar, pickups, and playing style.
          </p>

          {TONE_RECIPES.map((recipe) => (
            <div key={recipe.name} style={{
              marginBottom: 40,
              paddingBottom: 40,
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: "var(--fg)",
                  marginBottom: 4,
                }}>
                  {recipe.name}
                </h3>
                <p style={{
                  fontSize: 12,
                  color: "var(--fg-dim)",
                  letterSpacing: "0.05em",
                }}>
                  {recipe.artist} -- {recipe.genre}
                </p>
              </div>

              <p style={{
                fontSize: 14,
                color: "var(--fg)",
                lineHeight: 1.7,
                marginBottom: 24,
              }}>
                {recipe.description}
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 8,
                marginBottom: 20,
              }}>
                {Object.entries(recipe.settings).map(([key, val]) => (
                  <div key={key} style={{
                    padding: "14px 16px",
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                  }}>
                    <div style={{
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      marginBottom: 6,
                    }}>{key}</div>
                    <p style={{
                      fontSize: 12,
                      color: "var(--fg)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}>{val}</p>
                  </div>
                ))}
              </div>

              <div>
                <p style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 8,
                }}>Reference Songs</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {recipe.songs.map((song) => (
                    <span key={song} style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      border: "1px solid var(--border)",
                      color: "var(--fg-dim)",
                    }}>
                      {song}
                    </span>
                  ))}
                </div>
              </div>

              {recipe.note && (
                <p style={{
                  fontSize: 12,
                  color: "var(--accent)",
                  marginTop: 16,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}>
                  {recipe.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FAMOUS RIGS ═══════ */}
      <section id="famous-rigs" style={{ padding: "64px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 8,
          }}>03</h2>
          <h2 style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: 12,
          }}>
            Famous Rigs
          </h2>
          <p style={{
            fontSize: 14,
            color: "var(--fg-dim)",
            marginBottom: 48,
            maxWidth: 640,
            lineHeight: 1.7,
          }}>
            What these guitarists actually sounded like, what gear they used, and
            specific songs to listen to for reference. Use these as A/B benchmarks
            when dialing in your own tones.
          </p>

          {FAMOUS_RIGS.map((rig) => (
            <div key={rig.name} style={{
              marginBottom: 48,
              paddingBottom: 48,
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: "var(--fg)",
                  marginBottom: 4,
                }}>
                  {rig.name}
                </h3>
                <p style={{
                  fontSize: 12,
                  color: "var(--fg-dim)",
                }}>
                  {rig.artist} -- {rig.era}
                </p>
              </div>

              <div style={{
                padding: "14px 16px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                marginBottom: 20,
              }}>
                <p style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 6,
                }}>Gear</p>
                <p style={{
                  fontSize: 13,
                  color: "var(--fg)",
                  lineHeight: 1.6,
                  margin: 0,
                }}>{rig.gear}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}>The Sound</h4>
                <p style={{
                  fontSize: 14,
                  color: "var(--fg)",
                  lineHeight: 1.7,
                }}>{rig.sound}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}>Genre Context</h4>
                <p style={{
                  fontSize: 14,
                  color: "var(--fg)",
                  lineHeight: 1.7,
                }}>{rig.genre}</p>
              </div>

              <div>
                <h4 style={{
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: 12,
                }}>Listen To</h4>
                {rig.listen.map((item) => (
                  <p key={item} style={{
                    fontSize: 13,
                    color: "var(--fg)",
                    lineHeight: 1.6,
                    marginBottom: 8,
                    paddingLeft: 16,
                    borderLeft: "2px solid var(--border)",
                  }}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ GLOSSARY ═══════ */}
      <section id="glossary" style={{
        padding: "64px 24px",
        background: "var(--surface)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: 8,
          }}>04</h2>
          <h2 style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: 12,
          }}>
            Glossary
          </h2>
          <p style={{
            fontSize: 14,
            color: "var(--fg-dim)",
            marginBottom: 48,
            maxWidth: 640,
            lineHeight: 1.7,
          }}>
            The language of guitar tone. These terms come up in gear reviews, forum
            discussions, and studio sessions. Knowing them helps you communicate
            what you hear and what you want.
          </p>

          <div>
            {GLOSSARY.map((entry) => (
              <div key={entry.term} style={{
                padding: "20px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--fg)",
                  marginBottom: 6,
                }}>
                  {entry.term}
                </h3>
                <p style={{
                  fontSize: 13,
                  color: "var(--fg-dim)",
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {entry.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
