import { Link } from "react-router-dom";
import { AlertTriangle, Mail } from "lucide-react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import SEO from "../components/seo/SEO";

const DMCA = () => (
  <div className="min-h-screen overflow-x-clip bg-bg">
    <SEO title="DMCA Notice" path="/dmca" noindex />
    <Navbar />
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold tracking-tight">DMCA Notice</h1>
      <p className="mt-3 text-sm text-muted">Last updated: July 2026</p>

      <div className="mt-8 flex items-start gap-4 rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-priority-urgent/10 text-priority-urgent">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-ink">Reporting Copyright Infringement</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            FlowUpBoard respects the intellectual property rights of others and expects our users to do the same.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Filing a DMCA Takedown Notice</h2>
          <p className="mt-3 leading-relaxed text-muted">
            If you believe that content hosted on or through FlowUpBoard infringes your copyright,
            you may submit a DMCA takedown notice. Your notice must include:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 text-muted">
            <li>A physical or electronic signature of the copyright owner or authorized agent.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing, with enough detail for us to locate it on the service.</li>
            <li>Your contact information (name, address, phone number, and email).</li>
            <li>A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement, under penalty of perjury, that the information in the notice is accurate and you are authorized to act on behalf of the copyright owner.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Submit Your Notice</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Send your DMCA takedown notice to our designated DMCA agent at:
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="brand-gradient grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-[var(--shadow-brand)]">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-ink">DMCA Agent</p>
              <a
                href="mailto:info@flowupboard.com"
                className="text-sm text-muted transition-colors hover:text-brand-600"
              >
                info@flowupboard.com
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Counter-Notification</h2>
          <p className="mt-3 leading-relaxed text-muted">
            If you believe your content was removed in error, you may file a counter-notification.
            Your counter-notice must include your physical or electronic signature, identification
            of the removed material, a statement under penalty of perjury that the removal was
            a mistake, and your consent to the jurisdiction of the applicable court.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">Repeat Infringers</h2>
          <p className="mt-3 leading-relaxed text-muted">
            FlowUpBoard may terminate the accounts of users who are determined to be repeat
            infringers under applicable copyright law.
          </p>
        </section>
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

export default DMCA;
