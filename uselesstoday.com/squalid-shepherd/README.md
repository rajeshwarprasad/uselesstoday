# uselesstoday.com

A collection of small, fun, gloriously useless web games and toys — built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), deployed on [Cloudflare](https://developers.cloudflare.com/workers/static-assets/).

## Development

```sh
npm install     # install dependencies
npm run dev     # start dev server at localhost:4321
npm run build   # build to ./dist/
npm run preview # preview the production build
```

## Deployment

The site is served as static assets via Cloudflare (see `wrangler.jsonc`):

```sh
npm run build
npx wrangler deploy
```
