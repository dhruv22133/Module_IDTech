This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure MySQL (localhost)

This project uses MySQL for authentication and operational pages.

1. Create your local env file:

```bash
cp env.template .env.local
```

2. Update `.env.local` with your real MySQL username/password.
3. Initialize the schema and seed data:

```bash
npm run db:init
```

### 3) Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database notes

- Database name: `module_idtech`
- Core tables now cover all key modules:
  - `users`
  - `plants`
  - `suppliers`
  - `moulds`
  - `transfer_challans`
  - `mould_returns`
  - `maintenance_jobs`
  - `depreciation_entries`
  - `scrap_records`
- `database/schema.sql` creates tables and constraints.
- `database/seed.sql` inserts starter data for dashboard/testing.
- Dashboard summary endpoint: `GET /api/dashboard/summary`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
