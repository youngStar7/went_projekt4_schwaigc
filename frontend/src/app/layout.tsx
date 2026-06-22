import type { Metadata } from 'next';
import './globals.css';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: { default: 'Noven — Möbel', template: '%s | Noven' },
  description: 'Designmöbel mit individueller Ästhetik, Handwerkskunst und zeitlosem Design.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="de">
      <body>
        <Providers isLoggedIn={!!session}>{children}</Providers>
      </body>
    </html>
  );
}
