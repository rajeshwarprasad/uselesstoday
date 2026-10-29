export interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = "uselesstoday.com";
const HSTS = "max-age=63072000; includeSubDomains; preload";

// Hashed build output never changes between builds, so it can be cached hard.
const IMMUTABLE_PREFIXES = ["/_astro/", "/fonts/"];
const IMMUTABLE = "public, max-age=31536000, immutable";

// Paths only vulnerability scanners request. This site ships static assets
// only: no PHP runtime, no WordPress, no VCS metadata, no dotfiles.
const SCANNER_PATH =
  /^\/(?:wp-|wp\/|xmlrpc|phpmyadmin|vendor\/|\.env|\.git|\.svn|\.aws|\.ssh|\.DS_Store|backup|config\.json)/i;

function isScannerRequest(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return SCANNER_PATH.test(path) || path.endsWith(".php");
}

function isImmutableAsset(pathname: string): boolean {
  return IMMUTABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Files (anything with an extension in its last segment) are served as-is;
// everything else is a directory route and must carry a trailing slash so each
// page has exactly one URL.
const FILE_EXTENSION = /\.[^/]+$/;

/** Serve the built 404 page with a real 404 status. */
async function notFound(env: Env, request: Request): Promise<Response> {
  const fallback = new Request(new URL("/404.html", request.url), request);
  try {
    const res = await env.ASSETS.fetch(fallback);
    if (res.ok) {
      const headers = new Headers(res.headers);
      headers.set("X-Robots-Tag", "noindex");
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
      headers.set("Strict-Transport-Security", HSTS);
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      headers.set("X-Frame-Options", "SAMEORIGIN");
      return new Response(res.body, { status: 404, headers });
    }
  } catch {
    // fall through to the plain-text response below
  }
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      "Strict-Transport-Security": HSTS,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ── Canonical URL: one host, one scheme, one trailing-slash form ─────
    // Duplicate http:// and www. copies split ranking signals, so collapse
    // both onto https://uselesstoday.com with permanent redirects (one hop).
    let canonicalRedirect = false;
    if (url.protocol === "http:") {
      url.protocol = "https:";
      canonicalRedirect = true;
    }
    if (url.hostname !== CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      canonicalRedirect = true;
    }
    if (canonicalRedirect) {
      return Response.redirect(url.toString(), 301);
    }

    if (!url.pathname.endsWith("/") && !FILE_EXTENSION.test(url.pathname)) {
      url.pathname = `${url.pathname}/`;
      return Response.redirect(url.toString(), 301);
    }

    // /sitemap.xml is the URL people (and older robots.txt copies) expect.
    // The build emits a sitemap index at /sitemap-index.xml; alias the former.
    if (url.pathname === "/sitemap.xml") {
      url.pathname = "/sitemap-index.xml";
      return Response.redirect(url.toString(), 301);
    }

    if (isScannerRequest(url.pathname)) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex",
          "Strict-Transport-Security": HSTS,
        },
      });
    }

    // A directory path with no index.html (e.g. /fonts/, /games/) makes the
    // assets binding throw, which surfaces as a Cloudflare 1101 error page.
    // Treat those as ordinary 404s so crawlers and humans get a real answer.
    // `html_handling: none` means we resolve directory indexes ourselves.
    const assetUrl = new URL(url.toString());
    if (url.pathname.endsWith("/")) {
      assetUrl.pathname =
        url.pathname === "/" ? "/index.html" : `${url.pathname}index.html`;
    }

    let response: Response;
    try {
      response = await env.ASSETS.fetch(
        new Request(assetUrl.toString(), {
          method: request.method,
          headers: request.headers,
        }),
      );
    } catch {
      return notFound(env, request);
    }

    if (response.status >= 500) {
      return notFound(env, request);
    }

    const headers = new Headers(response.headers);

    // ── Security headers (applied to every asset response) ───────────────
    headers.set("Strict-Transport-Security", HSTS);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    );

    // ── Caching ──────────────────────────────────────────────────────────
    if (isImmutableAsset(url.pathname)) {
      headers.set("Cache-Control", IMMUTABLE);
    } else if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    }

    // Directory indexes are served as .html, so keep the charset explicit.
    const contentType = headers.get("Content-Type");
    if (contentType?.startsWith("text/html") && !/charset/i.test(contentType)) {
      headers.set("Content-Type", "text/html; charset=utf-8");
    }

    if (
      url.pathname === "/.well-known/security.txt" ||
      url.pathname === "/security.txt"
    ) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "text/plain; charset=utf-8");
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
