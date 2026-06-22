import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import DashboardTabs from './DashboardTabs';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mein Konto — Noven' };

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const { user } = session;
  const initials = user.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 48px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--sage)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white',
              fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 400,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 6 }}>
                Mein Konto
              </p>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 400 }}>
                Willkommen, {user.name?.split(' ')[0]}
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
          {[
            { label: 'Bestellungen', value: '3' },
            { label: 'Gesamt ausgegeben', value: '7.858 €' },
            { label: 'Treuepunkte', value: '785' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--white)', padding: '28px 32px' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>
                {s.label}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs: Bestellverlauf | Persönliche Daten | Lieferadresse */}
        <DashboardTabs name={user.name ?? ''} email={user.email} />

      </div>
    </div>
  );
}
