'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e12] text-slate-100">
      {/* Skip to content */}
      <a
        href="#system"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      {/* Hero */}
      <header className="relative overflow-hidden hero-grid">
        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-20 md:pt-14 md:pb-28">
          <nav className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-slate-400" aria-label="Main navigation">
            <span className="font-semibold">Union Rig</span>
            <div className="hidden md:flex gap-6">
              <a href="#system" className="hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:rounded-sm transition-colors">System</a>
              <a href="#features" className="hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:rounded-sm transition-colors">Features</a>
              <a href="#specs" className="hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:rounded-sm transition-colors">Specs</a>
              <a href="#contact" className="hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:rounded-sm transition-colors">Contact</a>
            </div>
            <a
              href="#contact"
              className="hidden md:inline-flex px-4 py-2 rounded-full border border-slate-600/60 hover:border-slate-300 focus-visible:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors"
            >
              Request kit guide
            </a>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 glass-panel rounded-2xl p-4 flex flex-col gap-3 text-sm uppercase tracking-[0.3em]">
              <a href="#system" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors">System</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors">Features</a>
              <a href="#specs" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors">Specs</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors">Contact</a>
            </div>
          )}

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="animate-fade-in-up">
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400 floating-label">
                Modular Camera Rig
              </p>
              <h1 className="mt-5 text-5xl md:text-7xl font-bold leading-tight text-gradient">
                UNION RIG
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-slate-200 max-w-xl">
                Build a rig that moves with you. Fast swaps, balanced handheld control, and clean on-set builds.
              </p>
              <p className="mt-5 text-base md:text-lg text-slate-400 max-w-xl">
                A modular system engineered for real production days: 15mm LWS backbone, NATO quick-shifts, and smart balance
                points for long takes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="mailto:hello@unionrig.com"
                  className="cta-button inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e12]"
                >
                  Email for availability
                </a>
                <a
                  href="#specs"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-500/70 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-white transition-colors"
                >
                  View specs
                </a>
              </div>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Swap-ready", value: "< 60s" },
                  { label: "Balance range", value: "4.5 in" },
                  { label: "Load rating", value: "18 lb" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-panel rounded-2xl px-4 py-4 text-left"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in delay-300">
              <div className="relative product-outline hero-shimmer rounded-[32px] p-6 md:p-10">
                <div className="absolute inset-0 rounded-[32px] border border-white/10 pointer-events-none" />
                <div className="relative aspect-[4/3] rounded-2xl bg-[#0f131a] border border-slate-700/60 overflow-hidden">
                  <div className="absolute inset-0 flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-500">
                      <span>Rig Layout</span>
                      <span>Series 01</span>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {["Core Spine", "NATO Rail", "Handle Duo", "Top Plate", "Counter Dock", "Cable Bay"].map((item) => (
                        <div
                          key={item}
                          className="spec-chip rounded-xl px-3 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-slate-300 text-center"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                      <span>Modular Fit</span>
                      <span>ARRI / NATO / 15mm</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-slate-400 uppercase tracking-[0.3em]">
                  <div>
                    <p className="text-white text-lg font-semibold tracking-normal">4-Point</p>
                    <p>Balance Axis</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-lg font-semibold tracking-normal">Tool-less</p>
                    <p>Reconfiguration</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#1f2a35] blur-2xl opacity-80" aria-hidden="true" />
              <div className="absolute -top-6 -right-8 w-28 h-28 rounded-full bg-[#2c1b16] blur-3xl opacity-70" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      {/* System Overview */}
      <section id="system" className="px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
          <div className="animate-on-scroll">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Rig System</p>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold">
              The modular camera rig you can build, break, and rebuild between takes.
            </h2>
            <p className="mt-5 text-lg text-slate-400">
              UNION RIG locks to the most common set standards while keeping the weight tight to your body. Each module is
              color-coded by function so your build reads at a glance.
            </p>
            <div className="mt-8 space-y-4 text-slate-300">
              {[
                "15mm LWS backbone with ARRI locating pins.",
                "NATO quick-shift handles with zero-play clamps.",
                "Counterweight dock for long glass + monitor stacks.",
                "Cable bay to keep power and video tucked clean.",
              ].map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#58d1d6]" />
                  <p className="text-base">{line}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[28px] p-8 md:p-10 animate-on-scroll">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-500">
              <span>Rig Build Map</span>
              <span>Tool-less</span>
            </div>
            <div className="mt-8 grid gap-4">
              {[
                { title: "Core Spine", desc: "Primary load path for lens, matte box, and baseplate." },
                { title: "Quick-Shift Handles", desc: "Left/right balance with memory marks." },
                { title: "Monitor Bridge", desc: "Two-point anchor for low-vibration viewing." },
                { title: "Power Spine", desc: "Battery plate with cable wrap channel." },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between border-b border-slate-700/60 pb-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                  </div>
                  <span className="text-xs text-slate-500">01</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 md:py-24 bg-[#0f141b]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Performance Features</p>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold">Designed for fast builds and long days.</h2>
            </div>
            <p className="text-slate-400 max-w-xl">
              Every module is tuned for balance, grip, and signal path. No loose clamps, no rattles, no surprise shifts.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Quick-shift handles",
                desc: "Set three grip positions and snap between them without rebalancing.",
              },
              {
                title: "Cable discipline",
                desc: "Integrated routing bay keeps power + video aligned and protected.",
              },
              {
                title: "Micro-adjusted balance",
                desc: "Sliding spine delivers 4.5 inches of fore/aft trim.",
              },
              {
                title: "Low-profile top plate",
                desc: "Keep monitors tight to the camera axis for steadier framing.",
              },
              {
                title: "Silent locks",
                desc: "Clamps stay quiet on live sets and fast resets.",
              },
              {
                title: "Modular weight dock",
                desc: "Stack counterweights or battery plates without re-rigging.",
              },
            ].map((feature) => (
              <div key={feature.title} className="feature-glow">
                <div className="glass-panel rounded-3xl p-6 md:p-7 h-full">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Feature</p>
                  <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm text-slate-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="animate-on-scroll">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Built For</p>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold">
              One rig, three modes: handheld, shoulder, and gimbal hand-off.
            </h2>
            <p className="mt-5 text-lg text-slate-400">
              Shift between commercial, doc, and run-and-gun setups without losing your balance marks.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Documentary", desc: "Balanced for all-day handheld." },
                { title: "Commercial", desc: "Clean cable runs and fast lens swaps." },
                { title: "Narrative", desc: "Repeatable builds with memory marks." },
              ].map((use) => (
                <div key={use.title} className="glass-panel rounded-2xl p-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{use.title}</p>
                  <p className="mt-3 text-sm text-slate-300">{use.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[28px] p-7 md:p-9 animate-on-scroll">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Workflow</p>
            <div className="mt-6 space-y-6">
              {[
                { step: "01", title: "Mount core spine", detail: "Drop in camera body and lock the ARRI pins." },
                { step: "02", title: "Snap handles", detail: "Select grip memory points and tighten the clamp." },
                { step: "03", title: "Route power", detail: "Slide battery plate into the rear dock." },
                { step: "04", title: "Trim balance", detail: "Dial in fore/aft balance in seconds." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full border border-slate-600 flex items-center justify-center text-xs text-slate-400">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="px-6 py-20 md:py-24 bg-[#0f141b]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Specifications</p>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold">Built on film-set standards.</h2>
            </div>
            <p className="text-slate-400 max-w-xl">
              Compatibility across ARRI, NATO, and 15mm LWS ensures the rig integrates with your existing kit.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              { label: "Material", value: "CNC aluminum + anodized steel" },
              { label: "Mounting", value: "ARRI locating pins + NATO rails" },
              { label: "Rod Standard", value: "15mm LWS (60mm spacing)" },
              { label: "Max Payload", value: "18 lb / 8.1 kg" },
              { label: "Balance Travel", value: "4.5 in / 114 mm" },
              { label: "Rig Weight", value: "3.2 lb / 1.45 kg (core)" },
              { label: "Handle Positions", value: "3-point memory dial" },
              { label: "Finish", value: "Low-gloss black, anti-scrape" },
            ].map((spec) => (
              <div key={spec.label} className="spec-chip rounded-2xl p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{spec.label}</p>
                <p className="mt-3 text-base text-slate-200">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-6 py-24">
        <div className="max-w-5xl mx-auto text-center glass-panel rounded-[32px] py-16 px-6 md:px-16">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Availability</p>
          <h2 className="mt-5 text-3xl md:text-4xl font-semibold">
            Ready for your next build?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            UNION RIG is entering limited production. Share your camera package and we will spec the right kit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:hello@unionrig.com"
              className="cta-button inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-7 py-3 text-sm font-semibold"
            >
              Request availability
            </a>
            <a
              href="#system"
              className="inline-flex items-center gap-2 rounded-full border border-slate-500/70 px-7 py-3 text-sm font-semibold text-slate-100 hover:border-white transition-colors"
            >
              View system overview
            </a>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-slate-600 uppercase tracking-[0.4em]">
          (c) 2026 UNION RIG
        </p>
      </section>
    </div>
  );
}
