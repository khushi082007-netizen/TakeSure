# TakeSure frontend

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4.

```bash
npm install
echo 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api' > .env.local
npm run dev        # http://localhost:3000
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run lint
```

Pages: `/` (home + demo mode), `/check`, `/review`, `/results`, `/knowledge-base`, `/knowledge-base/[code]`,
`/how-it-works`, `/adr`, `/about`, `/demo`. All backend calls go through `lib/api.ts`; every error is mapped to
actionable copy in `lib/errors.ts`. No secrets are used client-side.
