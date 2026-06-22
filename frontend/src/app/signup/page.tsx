import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SignupForm from './SignupForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Registrieren — Noven' };

export default async function SignupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/dashboard');

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: decorative */}
      <div style={{
        background: 'var(--text)', display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'flex-end', padding: 64,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(138,148,120,0.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(138,148,120,0.08)',
        }} />
        <Link href="/" style={{
          fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'white', marginBottom: 'auto',
          position: 'relative', zIndex: 1,
        }}>
          Noven
        </Link>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3vw,40px)', fontWeight: 300, color: 'white', marginBottom: 16 }}>
            Werden Sie Teil<br />unserer Gemeinschaft
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 320 }}>
            Exklusive Angebote, frühe Zugänge zu neuen Kollektionen und personalisierte Empfehlungen.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', background: 'var(--white)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>
            Neu hier?
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, marginBottom: 40 }}>
            Konto erstellen
          </h1>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}
