'use client';

import { useState } from 'react';
import PersonalDataForm from './PersonalDataForm';
import AddressForm from './AddressForm';

const TABS = ['Bestellverlauf', 'Persönliche Daten', 'Lieferadresse'] as const;
type Tab = (typeof TABS)[number];

const ORDERS = [
  { id: '#NV-2025-001', name: 'Stuhl Hans × 2', date: '12. Mai 2025', status: 'Geliefert', total: '2.178 €' },
  { id: '#NV-2025-002', name: 'Tisch Walnut × 1', date: '3. Juni 2025', status: 'In Bearbeitung', total: '2.390 €' },
  { id: '#NV-2025-003', name: 'Sofa Lune × 1', date: '18. Juni 2025', status: 'Versandt', total: '3.290 €' },
];

interface Props {
  name: string;
  email: string;
}

export default function DashboardTabs({ name, email }: Props) {
  const [active, setActive] = useState<Tab>('Bestellverlauf');

  return (
    <>
      {/* Tab bar */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        marginBottom: 32, gap: 0,
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            style={{
              padding: '14px 24px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: active === tab ? 'var(--text)' : 'var(--text-light)',
              borderBottom: active === tab ? '2px solid var(--text)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: 'var(--white)', padding: '36px' }}>
        {active === 'Bestellverlauf' && (
          <>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 400, marginBottom: 28 }}>
              Bestellverlauf
            </h2>
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
          </>
        )}

        {active === 'Persönliche Daten' && (
          <PersonalDataForm currentName={name} email={email} />
        )}

        {active === 'Lieferadresse' && (
          <AddressForm />
        )}
      </div>
    </>
  );
}
