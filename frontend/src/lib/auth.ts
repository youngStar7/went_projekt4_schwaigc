import { betterAuth } from 'better-auth';
import { kyselyAdapter } from '@better-auth/kysely-adapter';
import { nextCookies } from 'better-auth/next-js';
import { db } from './prisma';

export const auth = betterAuth({
  database: kyselyAdapter(db, {
    type: 'mysql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
