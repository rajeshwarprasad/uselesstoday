export interface Env {
  ASSETS: Fetcher;
}

const HSTS = "max-age=63072000; includeSubDomains; preload";

// Paths only vulnerability scanners request. This site ships static assets
// only: no PHP runtime, no WordPress, no VCS metadata, no dotfiles.
const SCANNER_PATH =
  /^\/(?:wp-|wp\/|xmlrpc|phpmyadmin|vendor\/|\.env|\.git|\.svn|\.aws|\.ssh|\.DS_Store|backup|config\.json)/i;

function isScannerRequest(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return SCANNER_PATH.test(path) || path.endsWith(".php");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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

    const response = await env.ASSETS.fetch(request);

    const headers = new Headers(response.headers);

    if (!headers.has("Strict-Transport-Security")) {
      headers.set("Strict-Transport-Security", HSTS);
    }

    if (url.pathname === "/.well-known/security.txt" || url.pathname === "/security.txt") {
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
