This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Folder Structure

```
scholarsync/
├── prisma/
│   └── schema.prisma        # Your database tables go here
├── public/                  # Static assets (logos, icons)
├── src/
│   ├── app/                 # NEXT.JS APP ROUTER (Pages & API)
│   │   ├── (auth)/          # Group route for login/register (Member 3)
│   │   ├── (dashboard)/     # Group route for Admin/Lecturer UI (Member 4)
│   │   ├── api/             # REST API Routes (if you don't use Server Actions)
│   │   ├── forum/           # Forum pages (Member 2)
│   │   ├── globals.css      # Tailwind base styles
│   │   ├── layout.tsx       # Main layout (Navbar/Sidebar goes here)
│   │   └── page.tsx         # The landing page / Q&A feed (YOU)
│   ├── components/          # REUSABLE UI COMPONENTS
│   │   ├── ui/              # Buttons, Inputs, Cards (e.g., Shadcn UI)
│   │   ├── shared/          # Navbar, Footer, Sidebar
│   │   ├── qa/              # Question Cards, Search Bar components
│   │   └── forum/           # Post Cards, Comment sections
│   ├── lib/                 # UTILITIES & CONFIG
│   │   ├── prisma.ts        # Prisma client instance (prevents multiple connections)
│   │   └── utils.ts         # Formatting dates, text, etc.
│   ├── actions/             # SERVER ACTIONS (Next.js 14 specific backend logic)
│   └── types/               # TYPESCRIPT INTERFACES (Shared types)
├── .env                     # ENVIRONMENT VARIABLES (DO NOT PUSH TO GITHUB)
├── .gitignore
├── tailwind.config.ts
└── package.json
```
