import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: { default: 'Noven — Möbel', template: '%s | Noven' },
  description: 'Designmöbel mit individueller Ästhetik, Handwerkskunst und zeitlosem Design.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
