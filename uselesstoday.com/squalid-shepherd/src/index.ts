export interface Env {
  ASSETS: Fetcher;
}

const HSTS = "max-age=63072000; includeSubDomains; preload";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);

    const headers = new Headers(response.headers);

    if (!headers.has("Strict-Transport-Security")) {
      headers.set("Strict-Transport-Security", HSTS);
    }

    const url = new URL(request.url);
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
