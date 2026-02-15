// Community Rigs Store — localStorage-based, structured for future backend migration
// All reads/writes go through this module so swapping to an API later is trivial.

export interface CommunityRig {
  id: string;
  rigId: string; // matches rig file id
  name: string;
  author: string;
  description: string; // what it sounds like
  tags: string[];
  genre: string;
  era: string;
  createdAt: string; // ISO
  ratings: number[]; // individual star values 1-5
  comments: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = "unionrig_community";

// ── Seed data: the 12 Famous Rigs ──

const SEED_RIGS: CommunityRig[] = [
  {
    id: "seed_brian_may",
    rigId: "brian_may_treble_booster",
    name: "Brian May Treble Booster",
    author: "Union Rig",
    description: "Bright, cutting harmonics that stack into orchestral layers. The treble booster pushes a Vox AC30 into singing sustain -- thick mids with a glassy top end that slices through any mix. Scene B dials the boost harder for soaring lead lines.",
    tags: ["queen", "treble-booster", "vox-ac30", "harmonics"],
    genre: "Classic Rock",
    era: "1970s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 5, 4, 5, 4],
    comments: [
      { id: "c1", author: "RedSpecialFan", text: "Scene B nails the Bohemian Rhapsody solo tone.", createdAt: "2026-01-15T10:00:00Z" },
    ],
  },
  {
    id: "seed_david_gilmour",
    rigId: "david_gilmour_big_muff",
    name: "David Gilmour Big Muff",
    author: "Union Rig",
    description: "Warm, singing sustain with a creamy midrange. The Big Muff adds a thick, woolly fuzz that blooms into long, sustained notes. Spacious reverb and wide stereo create that signature Gilmour atmosphere -- every note floats.",
    tags: ["pink-floyd", "big-muff", "fuzz", "sustain"],
    genre: "Progressive Rock",
    era: "1970s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 5, 5, 4, 5],
    comments: [
      { id: "c2", author: "ComfortablyNumb", text: "The sustain on this is unreal. Best Gilmour rig I have heard.", createdAt: "2026-01-20T14:00:00Z" },
    ],
  },
  {
    id: "seed_jack_white",
    rigId: "jack_white_garage_fuzz",
    name: "Jack White Garage Fuzz",
    author: "Union Rig",
    description: "Raw, splattery fuzz with a lo-fi edge. Aggressive and unpolished -- the kind of tone that sounds like the amp is about to catch fire. Scene A is the controlled chaos, Scene B is full-throttle noise.",
    tags: ["white-stripes", "garage", "fuzz", "raw"],
    genre: "Garage Rock",
    era: "2000s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [4, 5, 4, 4],
    comments: [
      { id: "c3", author: "GarageBand99", text: "Perfectly captures that barely-held-together sound.", createdAt: "2026-01-18T09:00:00Z" },
    ],
  },
  {
    id: "seed_jimi_hendrix",
    rigId: "jimi_hendrix_fuzz_face",
    name: "Jimi Hendrix Fuzz Face",
    author: "Union Rig",
    description: "Thick, syrupy fuzz with vocal-like sustain. Rolls off to warm cleans with guitar volume. The germanium character gives every note a round, singing quality -- aggressive when pushed, sweet when backed off.",
    tags: ["hendrix", "fuzz-face", "germanium", "psychedelic"],
    genre: "Psychedelic Rock",
    era: "1960s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 5, 5, 5, 5],
    comments: [
      { id: "c4", author: "PurpleHaze", text: "The cleanup with volume knob rolloff is spot on.", createdAt: "2026-01-22T11:00:00Z" },
    ],
  },
  {
    id: "seed_jimmy_page",
    rigId: "jimmy_page_marshall_crunch",
    name: "Jimmy Page Marshall Crunch",
    author: "Union Rig",
    description: "Crunchy, harmonically rich overdrive with midrange growl. The Marshall stack character comes through in the grinding upper mids and loose low end. Scene A is rhythm crunch, Scene B is the cranked-up lead tone.",
    tags: ["led-zeppelin", "marshall", "crunch", "classic"],
    genre: "Hard Rock",
    era: "1970s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 4, 5, 5],
    comments: [
      { id: "c5", author: "WholeLotta", text: "Scene A into open chords is pure Zeppelin.", createdAt: "2026-01-25T16:00:00Z" },
    ],
  },
  {
    id: "seed_john_frusciante",
    rigId: "john_frusciante_funk_ds2",
    name: "John Frusciante Funk DS-2",
    author: "Union Rig",
    description: "Tight, percussive distortion with scooped mids for funky rhythm work. The DS-2 character gives a compressed, aggressive bite that cuts through a dense mix. Cleans up for Frusciante's signature chord voicings.",
    tags: ["rhcp", "ds-2", "funk", "distortion"],
    genre: "Funk Rock",
    era: "1990s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [4, 5, 5, 4],
    comments: [
      { id: "c6", author: "CaliforniaFunk", text: "The funk rhythm tones on Scene A are incredible.", createdAt: "2026-01-28T13:00:00Z" },
    ],
  },
  {
    id: "seed_jonny_greenwood",
    rigId: "jonny_greenwood_shredmaster",
    name: "Jonny Greenwood Shredmaster",
    author: "Union Rig",
    description: "Angular, biting distortion with an abrasive upper-mid presence. The Shredmaster gives a raspy, almost broken quality -- not smooth, not pretty, but deeply expressive. Perfect for dissonant chord stabs and textural work.",
    tags: ["radiohead", "shredmaster", "art-rock", "angular"],
    genre: "Art Rock",
    era: "1990s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 4, 4, 5],
    comments: [
      { id: "c7", author: "OKComputer", text: "That abrasive mid character is exactly right.", createdAt: "2026-02-01T10:00:00Z" },
    ],
  },
  {
    id: "seed_kevin_shields",
    rigId: "kevin_shields_mbv_wash",
    name: "Kevin Shields MBV Wash",
    author: "Union Rig",
    description: "A shimmering, disorienting wall of sound. Pitch-bent tremolo arm textures layered with heavy reverb and chorus create an immersive wash where individual notes dissolve into pure atmosphere. Beautiful and overwhelming.",
    tags: ["mbv", "shoegaze", "wash", "tremolo"],
    genre: "Shoegaze",
    era: "1990s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 5, 5, 4, 5],
    comments: [
      { id: "c8", author: "ShoegazeDreams", text: "Best shoegaze preset I have found anywhere.", createdAt: "2026-02-03T15:00:00Z" },
    ],
  },
  {
    id: "seed_kurt_cobain",
    rigId: "kurt_cobain_ds1_twin",
    name: "Kurt Cobain DS-1 Twin",
    author: "Union Rig",
    description: "Buzzy, saturated distortion with a midrange honk. The DS-1 into a Twin Reverb gives a compressed, slightly fizzy aggression -- not heavy metal smooth, but punk-rock rough. Scene A is the quiet verse tone, Scene B is the loud chorus blast.",
    tags: ["nirvana", "ds-1", "grunge", "twin-reverb"],
    genre: "Grunge",
    era: "1990s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 4, 5, 5, 4],
    comments: [
      { id: "c9", author: "SmellsLike", text: "The quiet-loud dynamic between scenes is perfect.", createdAt: "2026-02-05T12:00:00Z" },
    ],
  },
  {
    id: "seed_srv",
    rigId: "stevie_ray_vaughan_tube_screamer",
    name: "Stevie Ray Vaughan Tube Screamer",
    author: "Union Rig",
    description: "Fat, punchy midrange with a tube-like sag. The Tube Screamer pushes the amp into a thick, singing overdrive that responds to every nuance of your picking. Dig in and it roars; back off and it purrs. Pure Texas blues fire.",
    tags: ["srv", "tube-screamer", "blues", "texas"],
    genre: "Texas Blues",
    era: "1980s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 5, 5, 5, 5, 4],
    comments: [
      { id: "c10", author: "TexasFlood", text: "The touch sensitivity on this is phenomenal.", createdAt: "2026-02-07T09:00:00Z" },
    ],
  },
  {
    id: "seed_the_edge",
    rigId: "the_edge_u2_delay",
    name: "The Edge U2 Delay",
    author: "Union Rig",
    description: "Rhythmic dotted-eighth delay that turns simple picking patterns into cascading, atmospheric arpeggios. The delay is the instrument -- clean tone feeds into precise repeats that build shimmering, cathedral-like soundscapes.",
    tags: ["u2", "delay", "dotted-eighth", "ambient"],
    genre: "Post-Punk / Ambient",
    era: "1980s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 4, 5, 5],
    comments: [
      { id: "c11", author: "WhereTheStreets", text: "Set the delay and just play quarter notes. Magic.", createdAt: "2026-02-09T14:00:00Z" },
    ],
  },
  {
    id: "seed_tom_morello",
    rigId: "tom_morello_rage_whammy",
    name: "Tom Morello Rage Whammy",
    author: "Union Rig",
    description: "Tight, aggressive distortion paired with pitch-shifting chaos. The Whammy adds alien, synth-like screams on top of a locked-in, heavily compressed rhythm tone. Scene A is the riff machine, Scene B is the DJ-scratch solo mode.",
    tags: ["ratm", "whammy", "pitch-shift", "aggressive"],
    genre: "Rap Metal",
    era: "1990s",
    createdAt: "2026-01-01T00:00:00Z",
    ratings: [5, 5, 4, 5, 4],
    comments: [
      { id: "c12", author: "BullOnParade", text: "Scene B is like having a turntable on your pedalboard.", createdAt: "2026-02-11T11:00:00Z" },
    ],
  },
];

function getStore(): CommunityRig[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Seed on first access
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RIGS));
    return SEED_RIGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_RIGS;
  }
}

function saveStore(rigs: CommunityRig[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rigs));
}

// ── Public API ──

export function getAllRigs(): CommunityRig[] {
  return getStore();
}

export function getRigById(id: string): CommunityRig | undefined {
  return getStore().find((r) => r.id === id);
}

export function addRig(rig: Omit<CommunityRig, "id" | "createdAt" | "ratings" | "comments">): CommunityRig {
  const newRig: CommunityRig = {
    ...rig,
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ratings: [],
    comments: [],
  };
  const store = getStore();
  store.push(newRig);
  saveStore(store);
  return newRig;
}

export function addRating(rigId: string, stars: number): void {
  const store = getStore();
  const rig = store.find((r) => r.id === rigId);
  if (!rig) return;
  rig.ratings.push(Math.max(1, Math.min(5, Math.round(stars))));
  saveStore(store);
}

export function addComment(rigId: string, author: string, text: string): CommunityComment | null {
  const store = getStore();
  const rig = store.find((r) => r.id === rigId);
  if (!rig) return null;
  const comment: CommunityComment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    author: author.trim() || "Anonymous",
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  rig.comments.push(comment);
  saveStore(store);
  return comment;
}

export function getAverageRating(rig: CommunityRig): number {
  if (rig.ratings.length === 0) return 0;
  return rig.ratings.reduce((a, b) => a + b, 0) / rig.ratings.length;
}

export type SortMode = "popular" | "newest";

export function getSortedRigs(mode: SortMode): CommunityRig[] {
  const rigs = getStore();
  if (mode === "popular") {
    return [...rigs].sort((a, b) => {
      const avgA = getAverageRating(a);
      const avgB = getAverageRating(b);
      if (avgB !== avgA) return avgB - avgA;
      return b.ratings.length - a.ratings.length;
    });
  }
  // newest
  return [...rigs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function resetToSeed(): void {
  saveStore(SEED_RIGS);
}
