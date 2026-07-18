import { Link } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import SEO from "../components/seo/SEO";

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly, including your name, email address, and any data you input into FlowUpBoard such as tasks, boards, and comments. We also collect usage data like pages visited, features used, and interactions with the platform to improve our service.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your information to provide, maintain, and improve FlowUpBoard; to send you service-related communications; to respond to your inquiries; and to detect and prevent fraud or abuse. We do not sell your personal information to third parties.`,
  },
  {
    title: "Data Storage & Security",
    content: `Your data is stored on secure cloud infrastructure provided by trusted partners. We use industry-standard encryption (TLS) for data in transit and encryption at rest. While we take reasonable measures to protect your data, no method of transmission or storage is 100% secure.`,
  },
  {
    title: "AI Features",
    content: `FlowUpBoard offers AI-powered features that may process your task data to generate suggestions, breakdowns, and summaries. This processing is done to provide the service and your data is not used to train third-party AI models.`,
  },
  {
    title: "Cookies & Tracking",
    content: `FlowUpBoard uses essential cookies for authentication and session management. We may use analytics tools to understand how our service is used. You can control cookie settings through your browser preferences.`,
  },
  {
    title: "Third-Party Services",
    content: `We use third-party services for hosting, analytics, and payment processing. These services may have access to your information only to perform tasks on our behalf and are obligated not to disclose or use it for other purposes.`,
  },
  {
    title: "Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide you the service. You may delete your account at any time, and we will remove your data within a reasonable period.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to access, correct, or delete your personal data. You can export your data at any time from the Settings page. For any data-related requests, please contact us.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.`,
  },
  {
    title: "Contact Us",
    content: `If you have questions about this Privacy Policy, please contact us at info@flowupboard.com.`,
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen overflow-x-clip bg-bg">
    <SEO title="Privacy Policy" path="/privacy-policy" noindex />
    <Navbar />
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: July 2026</p>

      <p className="mt-6 leading-relaxed text-muted">
        FlowUpBoard ("we", "us", or "our") is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, and safeguard your information
        when you use our platform at{" "}
        <a href="https://flowupboard.com" className="font-semibold text-brand-600 hover:text-brand-500">
          flowupboard.com
        </a>.
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

export default PrivacyPolicy;
