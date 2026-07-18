import { useEffect } from "react";

const SITE_URL = "https://flowupboard.com";
const SITE_NAME = "FlowUpBoard";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const SEO = ({
  title,
  description = "AI-powered Kanban board for teams. Manage projects, assign tasks, and collaborate in real-time.",
  path = "",
  image = DEFAULT_IMAGE,
  noindex = false,
  nofollow = false,
}) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI Kanban Board for Teams`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name, content, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("robots", `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`);

    setMeta("og:type", "website");
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:url", url);
    setMeta("og:image", image);
    setMeta("og:site_name", SITE_NAME);
    setMeta("og:locale", "en_US");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [fullTitle, description, url, image, noindex, nofollow]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: SITE_NAME,
            url: SITE_URL,
            description,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "AI-powered task generation",
              "Real-time team collaboration",
              "Drag-and-drop Kanban boards",
              "Multi-company workspaces",
              "Calendar view",
              "Activity feed",
            ],
            screenshot: `${SITE_URL}/og-image.png`,
          }),
        }}
      />
    </>
  );
};

export default SEO;
