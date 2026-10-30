import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './apps/worker/src/database/schema/*',
  out: './apps/worker/src/database/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || '00000000-0000-0000-0000-000000000001',
    token: process.env.CLOUDFLARE_D1_TOKEN || '',
  },
});

