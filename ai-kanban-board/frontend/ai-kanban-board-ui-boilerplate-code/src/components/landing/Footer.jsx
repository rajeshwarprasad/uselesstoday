import { Link } from "react-router-dom";
import { Zap, Layers } from "lucide-react";

const columns = [
  {
    heading: "Product",
    links: [
      ["Features", "#features"],
      ["How it works", "#how-it-works"],
      ["Built-in AI", "#ai"],
    ],
  },
  {
    heading: "Get started",
    links: [
      ["Log in", "/login"],
      ["Create account", "/register"],
    ],
  },
  {
    heading: "Company",
    links: [
      ["About us", "/about"],
      ["Contact us", "/contact"],
      ["Privacy policy", "/privacy-policy"],
      ["Terms & conditions", "/terms"],
      ["DMCA", "/dmca"],
    ],
  },
];

const isRoute = (href) => href.startsWith("/");

const Footer = () => (
  <footer className="border-t border-line bg-surface">
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl shadow-[var(--shadow-brand)]">
              <Zap className="h-4.5 w-4.5 fill-white text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">FlowUpBoard</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/70">
            The AI-native Kanban board that turns goals into shipped work — planning less so your team ships more.
          </p>
        </div>

        {/* link columns */}
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">{col.heading}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  {isRoute(href) ? (
                    <Link to={href} className="text-sm text-ink/70 transition-colors hover:text-brand-600">
                      {label}
                    </Link>
                  ) : (
                    <a href={href} className="text-sm text-ink/70 transition-colors hover:text-brand-600">
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-ink/60 sm:flex-row">
        <span>© {new Date().getFullYear()} FlowUpBoard. All rights reserved.</span>
        <a href="https://uselesstoday.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-brand-600">
          <Layers className="h-4 w-4" /> uselesstoday.com
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
