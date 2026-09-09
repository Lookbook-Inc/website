# Lookbook Edits Web

Read-only web companion for existing Lookbook members. This is a separate Next.js app from the marketing and Style Snapshot app in `../website`.

## Local development

Node 22 is required. Fixture mode never connects to production:

```bash
cp .env.example .env.local
npm install
npm run dev
```

The checked-in example enables `EDITS_DATA_MODE=fixture`. Production ignores fixture mode and fails closed if the production Lookbook Supabase or FastAPI configuration is absent.

Validation commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Production architecture

- The browser uses the production Lookbook Supabase project only for email/password authentication and session cookies.
- Application pages and concrete `/api/*` route handlers call the server-only data client.
- The Vercel server forwards the authenticated Supabase access token to FastAPI `/web/v1/*` GET endpoints.
- No service-role key is present in this project, no wardrobe tables are queried from the browser, and no wardrobe-data mutation handler exists.
- Signed private-media URLs are rendered with plain `img` elements so they are not copied into a public image-optimization cache.
- All private responses use `Cache-Control: private, no-store`.

## Vercel project

Create a second Vercel project against the same `Lookbook-Inc/website` repository:

1. Set the project root directory to `edits-web` and the Node.js version to 22.
2. Configure the variables in `.env.example` independently for Development, Preview, and Production. Do not reuse the Style Snapshot Supabase variables.
3. Keep ordinary preview deployments fixture-backed. Create a protected integration deployment with `EDITS_DATA_MODE=backend`, `EDITS_ENFORCE_ALLOWLIST=true`, and internal production user IDs only.
4. Attach `edits.lookbook.inc` to this project and add the DNS record Vercel requests. HTTPS is provisioned by Vercel.
5. In the production Lookbook Supabase Auth URL configuration, set the Site URL to `https://edits.lookbook.inc` and add `https://edits.lookbook.inc/auth/callback`, the exact protected integration callback URL, and `http://localhost:3000/auth/callback` only when local production-auth testing is intentionally needed.

Deploy the additive FastAPI branch before switching a preview from fixtures to `backend` mode. FastAPI does not need an Edits CORS origin because private-data calls are server-to-server.

## Rollout

Start with internal UUIDs in `EDITS_ALLOWED_USER_IDS`, then selected beta accounts, then disable allowlist enforcement for all existing users. PostHog events contain only sanitized section names; wardrobe metadata, tokens, user IDs, and signed media URLs must never be added as properties.
