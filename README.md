# ScholarSync

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js 18 or newer
- npm (or yarn/pnpm/bun)

## Dependency Installation

Before running or building the project, install all dependencies:

```bash
npm install
```

> **Note:** This project uses several runtime dependencies (UI, state, utility, and theme libraries) that must be present for the app to build and run. If you see errors about missing modules (e.g., `lucide-react`, `clsx`, `zustand`, etc.), ensure you have run `npm install`.

## Prisma Version Alignment

**Important:** The versions of `prisma` (CLI/dev) and `@prisma/client` (runtime) must match. This project uses:

- `prisma@6.19.2`
- `@prisma/client@6.19.2`

If you upgrade one, upgrade the other to the same version to avoid runtime errors.

## Build Troubleshooting

If you encounter build errors about missing modules, run:

```bash
npm install
```

If you see errors about Prisma engine files or version mismatches, ensure both `prisma` and `@prisma/client` are the same version in `package.json`.

## Development

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run lint` — Lint the codebase
- `npm run format` — Format the codebase with Prettier
- `npm run seed` — Seed the database (see `prisma/seed.ts`)

## Database

Prisma schema is in `prisma/schema.prisma`. To apply migrations or seed data, use the provided npm scripts.

## License

See [LICENSE](LICENSE).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Auth Environment Variables (Vercel + CD)

For NextAuth login/session to work after deployment, configure these environment variables in Vercel Project Settings:

- `NEXTAUTH_URL=https://scholar-sync-jet.vercel.app/`
- `NEXTAUTH_SECRET=<your-strong-random-secret>`
- `DATABASE_URL=<your-production-postgres-url>`
- `GOOGLE_CLIENT_ID=<optional, if Google login enabled>`
- `GOOGLE_CLIENT_SECRET=<optional, if Google login enabled>`

Notes:

- Yes, if `NEXTAUTH_URL` is wrong or missing in production, login callbacks can fail.
- Set the same variables in your CI/CD provider secrets (GitHub Actions) so build/deploy pipelines are consistent.
