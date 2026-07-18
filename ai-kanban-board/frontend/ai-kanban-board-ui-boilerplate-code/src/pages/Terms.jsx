import { Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import SEO from "../components/seo/SEO";

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using FlowUpBoard at flowupboard.com, you agree to be bound by these Terms & Conditions. If you do not agree, do not use the service.`,
  },
  {
    title: "Description of Service",
    content: `FlowUpBoard is an AI-powered Kanban board and project management platform. We provide task management, team collaboration, AI task generation, and related features.`,
  },
  {
    title: "User Accounts",
    content: `You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must be at least 13 years old to use the service.`,
  },
  {
    title: "Acceptable Use",
    content: `You agree not to: misuse the service or attempt to access it unauthorized; use it for any unlawful purpose; transmit malware or harmful code; interfere with or disrupt the service; or attempt to extract, scrape, or reverse-engineer the platform.`,
  },
  {
    title: "Ownership & Content",
    content: `You retain full ownership of all data, tasks, boards, and content you create on FlowUpBoard. We do not claim ownership over your work. You grant us a limited license to host and process your content solely to provide the service.`,
  },
  {
    title: "AI-Generated Content",
    content: `AI features on FlowUpBoard generate suggestions, task breakdowns, and summaries based on your input. AI-generated content may not always be accurate — you are responsible for reviewing and validating all AI output before acting on it.`,
  },
  {
    title: "Payment & Billing",
    content: `Free tier features are available at no cost. If you subscribe to a paid plan, you agree to the pricing and billing terms presented at the time of purchase. All payments are non-refundable unless required by applicable law.`,
  },
  {
    title: "Termination",
    content: `We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time from Settings. Upon termination, your data will be retained for a limited period and then deleted.`,
  },
  {
    title: "Limitation of Liability",
    content: `FlowUpBoard is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the last 12 months.`,
  },
  {
    title: "Modifications",
    content: `We may update these Terms from time to time. Material changes will be communicated via email or in-app notice. Continued use of the service after changes constitutes acceptance of the updated Terms.`,
  },
  {
    title: "Governing Law",
    content: `These Terms are governed by the laws of the jurisdiction in which FlowUpBoard operates, without regard to conflict of law principles.`,
  },
  {
    title: "Contact",
    content: `Questions about these Terms? Email us at info@flowupboard.com.`,
  },
];

const Terms = () => (
  <div className="min-h-screen overflow-x-clip bg-bg">
    <SEO title="Terms & Conditions" path="/terms" noindex />
    <Navbar />
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold tracking-tight">Terms &amp; Conditions</h1>
      <p className="mt-3 text-sm text-muted">Last updated: July 2026</p>

      <p className="mt-6 leading-relaxed text-muted">
        Please read these Terms &amp; Conditions carefully before using FlowUpBoard.
        By using our service, you agree to these terms.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl font-semibold tracking-tight">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-muted">{s.content}</p>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t pt-8">
        <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-500">
          ← Back to home
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
