'use client';

import Link from 'next/link';

const ORDERS = [
  { id: '#NV-2025-001', name: 'Stuhl Hans × 2', date: '12. Mai 2025', status: 'Geliefert', total: '2.178 €' },
  { id: '#NV-2025-002', name: 'Tisch Walnut × 1', date: '3. Juni 2025', status: 'In Bearbeitung', total: '2.390 €' },
  { id: '#NV-2025-003', name: 'Sofa Lune × 1', date: '18. Juni 2025', status: 'Versandt', total: '3.290 €' },
];

export default function DashboardPage() {
  return (
    <>
      <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 48px 80px' }}>
          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 8 }}>
              Mein Konto
            </p>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 400 }}>
              Willkommen zurück
            </h1>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48 }}>
            {[
              { label: 'Bestellungen', value: '3' },
              { label: 'Gesamt ausgegeben', value: '7.858 €' },
              { label: 'Treuepunkte', value: '785' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--white)', padding: '28px 32px' }}>
                <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>{s.label}</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Orders */}
          <div style={{ background: 'var(--white)', padding: '36px' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, marginBottom: 28 }}>Bestellverlauf</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Bestellnr.', 'Produkt', 'Datum', 'Status', 'Summe'].map(h => (
                    <th key={h} style={{
                      padding: '12px 0', textAlign: 'left',
                      fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: 'var(--text-light)', fontWeight: 400,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '18px 0', fontSize: 12, color: 'var(--text-mid)', fontFamily: 'monospace' }}>{o.id}</td>
                    <td style={{ padding: '18px 0', fontSize: 13 }}>{o.name}</td>
                    <td style={{ padding: '18px 0', fontSize: 12, color: 'var(--text-mid)' }}>{o.date}</td>
                    <td style={{ padding: '18px 0' }}>
                      <span style={{
                        fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '4px 10px',
                        background: o.status === 'Geliefert' ? 'var(--sage-bg)' : o.status === 'Versandt' ? '#f0eee8' : '#f5f0e8',
                        color: o.status === 'Geliefert' ? 'var(--sage-dark)' : 'var(--text-mid)',
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '18px 0', fontSize: 13, fontWeight: 500 }}>{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Link href="/login" style={{ fontSize: 12, color: 'var(--text-light)', letterSpacing: '0.04em' }}>
              Abmelden →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
