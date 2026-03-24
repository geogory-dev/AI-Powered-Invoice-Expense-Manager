# AI-Powered Invoice & Expense Manager

A full-stack SaaS app that uploads receipts, uses GPT-4o to extract data automatically, and gives you a dashboard to track and analyze spending.

## Live Demo
🔗 Coming soon

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui
- **Auth:** Clerk
- **AI:** OpenAI GPT-4o (receipt parsing)
- **Database:** PostgreSQL + Prisma ORM
- **Storage:** Supabase
- **Deploy:** Vercel + Railway

## Features
- Upload receipts as images or PDFs
- AI automatically extracts vendor, amount, date, and category
- Dashboard with spending breakdown by category and month
- Filter and search expenses
- Export to CSV

## Getting Started
```bash
git clone https://github.com/geogory-dev/AI-Powered-Invoice-Expense-Manager.git
cd AI-Powered-Invoice-Expense-Manager
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

## What I Learned
- GPT-4o vision for structured data extraction
- Full auth flow with Clerk in Next.js App Router
- File uploads with Supabase Storage
- Production-ready Postgres schema with Prisma
