import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LoginForm from './LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Anmelden — Noven' };

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/dashboard');

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: form */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px', background: 'var(--white)',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{
            fontFamily: 'var(--serif)', fontSize: 18, letterSpacing: '0.2em',
            textTransform: 'uppercase', display: 'block', marginBottom: 56,
          }}>
            Noven
          </Link>

          <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>
            Willkommen zurück
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, marginBottom: 40 }}>
            Anmelden
          </h1>

          <LoginForm />
        </div>
      </div>

      {/* Right: decorative */}
      <div style={{
        background: 'var(--sage-bg)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(80px,10vw,140px)',
          fontWeight: 300, color: 'rgba(138,148,120,0.15)', letterSpacing: '-0.04em',
          userSelect: 'none', lineHeight: 1,
        }}>
          Noven
        </div>
        <div style={{
          position: 'absolute', bottom: 48, left: 48, right: 48,
          padding: 32, background: 'var(--white)',
        }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400, marginBottom: 8 }}>
            "Qualität, die bleibt."
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-mid)' }}>Handgefertigte Möbel seit 1987.</p>
        </div>
      </div>
    </div>
  );
}
