import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ProgressBar } from "../components/ui/ProgressBar";
import { formatCurrency } from "../utils/format";

const features = [
  {
    icon: "🧠",
    title: "Smart Insights",
    desc: "AI-powered spending analysis that spots your Boss Fights — those budget overage moments before they strike.",
    progress: 78,
  },
  {
    icon: "🏆",
    title: "Achievement Badges",
    desc: "Unlock 200+ badges like Ramen Warrior and Wealth Wizard as you level up your savings game.",
    progress: 92,
  },
  {
    icon: "⚔️",
    title: "Social Challenges",
    desc: "Co-op savings goals and seasonal raids with friends. Compete on the leaderboard and flex your stats.",
    progress: 65,
  },
];

const testimonials = [
  {
    quote: "FinGame turned my boring budget into an actual RPG. I hit Level 42 in two months!",
    name: "Jordan K.",
    level: 42,
    class: "Shadow Assassin Tier",
    stars: 5,
  },
  {
    quote: "The streak system is addictive. 30 days under budget and I unlocked Wealth Wizard!",
    name: "Maya S.",
    level: 28,
    class: "Vault Mage Tier",
    stars: 5,
  },
  {
    quote: "Finally an expense tracker that doesn't feel like homework. My friends and I raid every season.",
    name: "Chris L.",
    level: 35,
    class: "Gold Hoarder Tier",
    stars: 4,
  },
];

const LandingPage: React.FC = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const t = testimonials[testimonialIdx];

  return (
    <div className="min-h-screen bg-background gradient-bg">
      <Navbar isLanding />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-container-margin overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary font-label-caps text-label-caps border border-secondary/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              NEW SEASON LIVE
            </span>
            <h1 className="font-display-lg text-display-lg md:text-[48px] text-on-background leading-tight mb-6">
              Master Your Money.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Level Up Your Life.
              </span>
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg mb-8">
              Turn saving into an RPG quest. Track expenses, earn XP, complete quests, and climb the leaderboard — all in a premium dark-mode experience built for Gen-Z.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-label-caps text-label-caps text-on-primary active:scale-[0.96] transition-all animate-pulse-glow btn-grad"
            >
              Start Your Quest
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          {/* Hero illustration */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="float-anim relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 blur-3xl" />
              <div className="relative glass-card w-full h-full flex flex-col items-center justify-center gap-4 rounded-3xl glow-indigo">
                <span className="material-symbols-outlined text-7xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  savings
                </span>
                <div className="text-center">
                  <p className="font-label-caps text-label-caps text-secondary">Daily Energy</p>
                  <p className="font-display-lg text-3xl text-primary">{formatCurrency(142.5)}</p>
                  <p className="text-xs text-on-surface-variant">REMAINING</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-tertiary/20 text-tertiary text-xs font-bold">🔥 12 streak</span>
                  <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">LVL 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-container-margin">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-3">
            Choose Your Class. Grind Your Goals.
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Three power-ups to transform how you think about money
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-card-padding rounded-2xl hover:glow-teal transition-shadow group">
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{f.icon}</span>
              <h3 className="font-title-md text-title-md text-on-surface mb-2">{f.title}</h3>
              <p className="text-on-surface-variant text-sm mb-6">{f.desc}</p>
              <ProgressBar value={f.progress} />
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard preview */}
      <section id="leaderboard" className="py-20 px-container-margin">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-3">Guild Leaderboard</h2>
          <p className="text-on-surface-variant">Compete with friends and climb the XP ranks</p>
        </div>
        <div className="max-w-md mx-auto glass-card rounded-xl overflow-hidden">
          {[
            { rank: 1, name: "Sarah J.", xp: "20,800", highlight: false },
            { rank: 2, name: "Mike T.", xp: "14,200", highlight: false },
            { rank: 3, name: "Alex M.", xp: "6,750", highlight: true },
          ].map((p) => (
            <div
              key={p.rank}
              className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 ${
                p.highlight ? "sunken-surface bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-bold text-sm ${p.rank === 1 ? "text-tertiary" : "text-on-surface-variant"}`}>#{p.rank}</span>
                <span className="text-sm font-semibold">{p.name}</span>
              </div>
              <span className="text-xs text-secondary">{p.xp} XP</span>
            </div>
          ))}
          <Link
            to="/register"
            className="block w-full py-3 text-center text-[10px] font-bold uppercase text-primary border-t border-white/5 hover:bg-primary/5 transition-colors"
          >
            Join the Guild →
          </Link>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-container-margin bg-surface-container-lowest/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-10">Guild Reviews</h2>
          <div className="glass-card p-8 rounded-2xl text-center relative">
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined ${i < t.stars ? "text-tertiary" : "text-outline-variant"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-lg text-on-surface italic mb-6">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center justify-center gap-3">
              <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-xs font-bold">
                LVL {t.level}
              </span>
              <div>
                <p className="font-semibold text-on-surface">{t.name}</p>
                <p className="text-xs text-secondary">{t.class}</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? "bg-secondary w-6" : "bg-outline-variant"}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-container-margin">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-display-lg text-headline-lg-mobile text-primary">FinGame</span>
            <p className="text-on-surface-variant text-sm mt-1">Master Your Money. Level Up Your Life.</p>
          </div>
          <p className="text-on-surface-variant/50 text-sm">© 2026 FinGame Studios</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
