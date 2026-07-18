import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import SEO from "../components/seo/SEO";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please email us directly at info@flowupboard.com");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-bg">
      <SEO
        title="Contact Us"
        description="Get in touch with the FlowUpBoard team. We'd love to hear from you."
        path="/contact"
      />
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* left — copy */}
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Get in touch</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Have a question, feedback, or want to partner with us? We'd love to hear from you.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <span className="brand-gradient grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-[var(--shadow-brand)]">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Email us</p>
                  <a
                    href="mailto:info@flowupboard.com"
                    className="text-sm text-muted transition-colors hover:text-brand-600"
                  >
                    info@flowupboard.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="brand-gradient grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-[var(--shadow-brand)]">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">Response time</p>
                  <p className="text-sm text-muted">We typically respond within 24 hours on business days.</p>
                </div>
              </div>
            </div>
          </div>

          {/* right — form */}
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-[var(--shadow-card)]">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-ink">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-ink">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-ink">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-ink">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full resize-none rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="brand-gradient inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
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
};

export default Contact;
