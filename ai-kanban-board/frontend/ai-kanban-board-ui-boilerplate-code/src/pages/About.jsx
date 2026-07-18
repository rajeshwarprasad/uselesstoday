import { Link } from "react-router-dom";
import { Zap, Target, Users, Sparkles } from "lucide-react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import SEO from "../components/seo/SEO";

const values = [
  {
    icon: Target,
    title: "Ship faster",
    desc: "We believe great software comes from focused teams — not busywork. FlowUpBoard removes the noise so you ship what matters.",
  },
  {
    icon: Users,
    title: "Built for teams",
    desc: "Real-time collaboration, shared boards, and transparent workflows keep everyone aligned without endless meetings.",
  },
  {
    icon: Sparkles,
    title: "AI as a teammate",
    desc: "Our AI doesn't replace your team — it handles the tedious parts: planning, breaking down tasks, and summarizing progress.",
  },
];

const About = () => (
  <div className="min-h-screen overflow-x-clip bg-bg">
    <SEO
      title="About Us"
      description="FlowUpBoard is an AI-native Kanban board built to help teams plan smarter and ship faster."
      path="/about"
    />
    <Navbar />
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* hero */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-600">
          <Zap className="h-3.5 w-3.5" /> Our story
        </span>
        <h1 className="mt-6 font-display text-[clamp(32px,5vw,52px)] font-bold leading-[1.08] tracking-tight">
          We built the Kanban board <span className="text-gradient">we wished existed</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
          FlowUpBoard started from a simple frustration: project management tools are either
          too simple or too complex. We wanted something that feels fast, looks great, and
          uses AI to handle the boring parts.
        </p>
      </div>

      {/* mission */}
      <section className="mt-20">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight">Our mission</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted leading-relaxed">
          Make every team's planning cycle shorter and their shipping cycle faster
          by combining a clean Kanban experience with AI that actually helps.
        </p>
      </section>

      {/* values */}
      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {values.map((v) => (
          <div
            key={v.title}
            className="rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-soft)]"
          >
            <span className="brand-gradient grid h-10 w-10 place-items-center rounded-xl text-white shadow-[var(--shadow-brand)]">
              <v.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{v.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight">Ready to try FlowUpBoard?</h2>
        <p className="mt-3 text-muted">Free for small teams. No credit card required.</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/register">
            <button className="brand-gradient inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
              Get started free
            </button>
          </Link>
          <Link to="/login">
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-7 text-sm font-semibold text-ink shadow-[var(--shadow-card)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
              Log in
            </button>
          </Link>
        </div>
      </section>

      <div className="mt-14 border-t pt-8">
        <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
          ← Back to home
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
