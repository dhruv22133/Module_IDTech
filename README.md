This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure MySQL (localhost)

This project uses MySQL for user authentication.

1. Open MySQL Workbench and connect to your local server.
2. Open and run `database/schema.sql`.
3. Create your local env file:

```bash
cp env.template .env.local
```

4. Update `.env.local` with your real MySQL username/password.

### 3) Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database notes

- Database name: `module_idtech`
- Main table: `users`
- `email` is unique so duplicate signups are rejected cleanly.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
