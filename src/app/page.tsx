'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#0b0e12] text-slate-100">
      {/* Skip to content */}
      <a
        href="#system"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      {/* Sticky Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'nav-blur py-3' : 'py-5'
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm uppercase tracking-[0.3em] text-slate-400">
          <a href="#" className="font-semibold text-white hover:text-white transition-colors">Union Rig</a>
          <div className="hidden md:flex gap-6">
            <a href="#system" className="nav-link">System</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#specs" className="nav-link">Specs</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
          <a
            href="#contact"
            className="hidden md:inline-flex px-4 py-2 rounded-full border border-slate-600/60 hover:border-slate-300 focus-visible:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-all duration-200"
          >
            Request kit guide
          </a>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors relative z-[60]"
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
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#0b0e12]/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`flex flex-col items-center justify-center h-full gap-6 text-lg uppercase tracking-[0.3em] transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-8'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {['system', 'features', 'specs', 'contact'].map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-6 rounded-xl hover:bg-white/10 transition-all duration-200 text-slate-200 hover:text-white"
              style={{ transitionDelay: mobileMenuOpen ? `${i * 50}ms` : '0ms' }}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
          <a
            href="mailto:hello@unionrig.com"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm tracking-[0.2em]"
          >
            Get in touch
          </a>
        </div>
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden hero-grid">
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-28 md:pb-32">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="animate-fade-in-up">
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400 floating-label">
                Modular Camera Rig
              </p>
              <h1 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] text-gradient">
                UNION RIG
              </h1>
              <p className="mt-6 text-lg sm:text-xl md:text-2xl text-slate-200 max-w-xl leading-relaxed">
                Build a rig that moves with you. Fast swaps, balanced handheld control, and clean on-set builds.
              </p>
              <p className="mt-5 text-base md:text-lg text-slate-400 max-w-xl leading-relaxed">
                A modular system engineered for real production days: 15mm LWS backbone, NATO quick-shifts, and smart balance
                points for long takes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:hello@unionrig.com"
                  className="cta-button inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-6 py-3.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e12]"
                >
                  Email for availability
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </a>
                <a
                  href="#specs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-500/70 px-6 py-3.5 text-sm font-semibold text-slate-100 hover:border-white hover:bg-white/5 transition-all duration-200"
                >
                  View specs
                </a>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Swap-ready", value: "< 60s" },
                  { label: "Balance range", value: "4.5 in" },
                  { label: "Load rating", value: "18 lb" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-panel rounded-2xl px-3 sm:px-4 py-4 text-left hover-lift"
                  >
                    <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400">{stat.label}</p>
                    <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in delay-300">
              <div className="relative product-outline hero-shimmer rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 md:p-10">
                <div className="absolute inset-0 rounded-[24px] sm:rounded-[32px] border border-white/10 pointer-events-none" />
                <div className="relative aspect-[4/3] rounded-2xl bg-[#0f131a] border border-slate-700/60 overflow-hidden">
                  <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
                    <div className="flex items-center justify-between text-[0.6rem] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-500">
                      <span>Rig Layout</span>
                      <span>Series 01</span>
                    </div>
                    <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                      {["Core Spine", "NATO Rail", "Handle Duo", "Top Plate", "Counter Dock", "Cable Bay"].map((item) => (
                        <div
                          key={item}
                          className="spec-chip rounded-lg sm:rounded-xl px-2 sm:px-3 py-3 sm:py-4 text-[0.6rem] sm:text-[0.7rem] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-300 text-center hover:border-slate-500/50 transition-colors duration-200"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 sm:mt-6 flex items-center justify-between text-[0.6rem] sm:text-xs text-slate-500">
                      <span>Modular Fit</span>
                      <span>ARRI / NATO / 15mm</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-4 text-[0.65rem] sm:text-xs text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                  <div>
                    <p className="text-white text-base sm:text-lg font-semibold tracking-normal">4-Point</p>
                    <p>Balance Axis</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-base sm:text-lg font-semibold tracking-normal">Tool-less</p>
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
      <section id="system" className="px-6 py-20 md:py-28 scroll-mt-20">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
          <div className="animate-on-scroll">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Rig System</p>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug">
              The modular camera rig you can build, break, and rebuild between takes.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed">
              UNION RIG locks to the most common set standards while keeping the weight tight to your body. Each module is
              color-coded by function so your build reads at a glance.
            </p>
            <div className="mt-8 space-y-4 text-slate-300" role="list">
              {[
                "15mm LWS backbone with ARRI locating pins.",
                "NATO quick-shift handles with zero-play clamps.",
                "Counterweight dock for long glass + monitor stacks.",
                "Cable bay to keep power and video tucked clean.",
              ].map((line) => (
                <div key={line} className="flex items-start gap-3" role="listitem">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#58d1d6] shrink-0" aria-hidden="true" />
                  <p className="text-sm sm:text-base">{line}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[28px] p-6 sm:p-8 md:p-10 animate-on-scroll">
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
              ].map((item, i) => (
                <div key={item.title} className="flex items-center justify-between border-b border-slate-700/60 pb-4 group">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-200 transition-colors duration-200">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                  </div>
                  <span className="text-xs text-slate-500 tabular-nums">0{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 md:py-28 bg-[#0f141b] scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-on-scroll">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Performance Features</p>
              <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug">Designed for fast builds and long days.</h2>
            </div>
            <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
              Every module is tuned for balance, grip, and signal path. No loose clamps, no rattles, no surprise shifts.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Quick-shift handles",
                desc: "Set three grip positions and snap between them without rebalancing.",
                icon: "⚡",
              },
              {
                title: "Cable discipline",
                desc: "Integrated routing bay keeps power + video aligned and protected.",
                icon: "🔌",
              },
              {
                title: "Micro-adjusted balance",
                desc: "Sliding spine delivers 4.5 inches of fore/aft trim.",
                icon: "⚖️",
              },
              {
                title: "Low-profile top plate",
                desc: "Keep monitors tight to the camera axis for steadier framing.",
                icon: "📐",
              },
              {
                title: "Silent locks",
                desc: "Clamps stay quiet on live sets and fast resets.",
                icon: "🔇",
              },
              {
                title: "Modular weight dock",
                desc: "Stack counterweights or battery plates without re-rigging.",
                icon: "🧱",
              },
            ].map((feature) => (
              <div key={feature.title} className="feature-glow animate-on-scroll">
                <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 h-full">
                  <div className="flex items-center gap-3">
                    <span className="text-lg" aria-hidden="true">{feature.icon}</span>
                    <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.4em] text-slate-500">Feature</p>
                  </div>
                  <h3 className="mt-4 text-lg sm:text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-6 py-20 md:py-28 scroll-mt-20">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="animate-on-scroll">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Built For</p>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug">
              One rig, three modes: handheld, shoulder, and gimbal hand-off.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed">
              Shift between commercial, doc, and run-and-gun setups without losing your balance marks.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Documentary", desc: "Balanced for all-day handheld." },
                { title: "Commercial", desc: "Clean cable runs and fast lens swaps." },
                { title: "Narrative", desc: "Repeatable builds with memory marks." },
              ].map((use) => (
                <div key={use.title} className="glass-panel rounded-2xl p-4 hover-lift">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{use.title}</p>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">{use.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[28px] p-6 sm:p-7 md:p-9 animate-on-scroll">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Workflow</p>
            <ol className="mt-6 space-y-6">
              {[
                { step: "01", title: "Mount core spine", detail: "Drop in camera body and lock the ARRI pins." },
                { step: "02", title: "Snap handles", detail: "Select grip memory points and tighten the clamp." },
                { step: "03", title: "Route power", detail: "Slide battery plate into the rear dock." },
                { step: "04", title: "Trim balance", detail: "Dial in fore/aft balance in seconds." },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-4 group">
                  <div className="h-10 w-10 rounded-full border border-slate-600 flex items-center justify-center text-xs text-slate-400 shrink-0 group-hover:border-[#58d1d6]/50 group-hover:text-[#58d1d6] transition-colors duration-300">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="px-6 py-20 md:py-28 bg-[#0f141b] scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-on-scroll">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Specifications</p>
              <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug">Built on film-set standards.</h2>
            </div>
            <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
              Compatibility across ARRI, NATO, and 15mm LWS ensures the rig integrates with your existing kit.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
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
              <div key={spec.label} className="spec-chip rounded-2xl p-5 hover:border-slate-500/40 transition-colors duration-200 animate-on-scroll">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{spec.label}</p>
                <p className="mt-3 text-sm sm:text-base text-slate-200">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-6 py-24 md:py-32 scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center glass-panel rounded-[24px] sm:rounded-[32px] py-14 sm:py-16 px-6 md:px-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#58d1d6]/5 via-transparent to-[#ff7a59]/5 pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Availability</p>
            <h2 className="mt-5 text-2xl sm:text-3xl md:text-4xl font-semibold">
              Ready for your next build?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              UNION RIG is entering limited production. Share your camera package and we&apos;ll spec the right kit.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:hello@unionrig.com"
                className="cta-button inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-900 px-7 py-3.5 text-sm font-semibold"
              >
                Request availability
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </a>
              <a
                href="#system"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-500/70 px-7 py-3.5 text-sm font-semibold text-slate-100 hover:border-white hover:bg-white/5 transition-all duration-200"
              >
                View system overview
              </a>
            </div>
          </div>
        </div>
        <footer className="mt-10 text-center" role="contentinfo">
          <p className="text-xs text-slate-600 uppercase tracking-[0.4em]">
            &copy; 2026 UNION RIG. All rights reserved.
          </p>
        </footer>
      </section>
    </div>
  );
}
