'use client';

import { useState, useEffect, useTransition } from 'react';

interface ProfileData {
  phone?: string;
  strasse?: string;
  nr?: string;
  plz?: string;
  stadt?: string;
  land?: string;
}

const inputStyle = {
  width: '100%', padding: '13px 16px',
  border: '1px solid var(--border-strong)', background: 'var(--white)',
  fontSize: 13, color: 'var(--text)', outline: 'none',
} as const;

const labelStyle = {
  fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: 'var(--text-light)', display: 'block', marginBottom: 8,
};

export default function AddressForm() {
  const [form, setForm] = useState<ProfileData>({
    phone: '', strasse: '', nr: '', plz: '', stadt: '', land: 'Österreich',
  });
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isPending, start] = useTransition();

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then((data: ProfileData) => {
        if (data) setForm(f => ({ ...f, ...data }));
      })
      .catch(() => {});
  }, []);

  const set = (k: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        setStatus(res.ok ? 'saved' : 'error');
        setTimeout(() => setStatus('idle'), 3000);
      } catch {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    });
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>
        Lieferadresse
      </h2>
      <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 28 }}>
        Diese Adresse wird beim Checkout automatisch vorausgefüllt.
      </p>

      {status === 'saved' && (
        <div style={{
          padding: '12px 16px', background: 'var(--sage-bg)',
          border: '1px solid var(--sage-light)', color: 'var(--sage-dark)',
          fontSize: 12, marginBottom: 24,
        }}>
          Adresse erfolgreich gespeichert.
        </div>
      )}
      {status === 'error' && (
        <div style={{
          padding: '12px 16px', background: '#fef2f2',
          border: '1px solid #fecaca', color: '#991b1b',
          fontSize: 12, marginBottom: 24,
        }}>
          Fehler beim Speichern. Bitte versuchen Sie es erneut.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        {/* Phone */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Telefon</label>
          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={set('phone')}
            style={inputStyle}
            placeholder="+43 123 456 789"
            autoComplete="tel"
          />
        </div>

        {/* Street + Nr */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Straße</label>
            <input
              value={form.strasse ?? ''}
              onChange={set('strasse')}
              style={inputStyle}
              placeholder="Musterstraße"
              autoComplete="street-address"
            />
          </div>
          <div style={{ width: 100 }}>
            <label style={labelStyle}>Nr.</label>
            <input
              value={form.nr ?? ''}
              onChange={set('nr')}
              style={inputStyle}
              placeholder="12a"
            />
          </div>
        </div>

        {/* PLZ + Stadt */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 130 }}>
            <label style={labelStyle}>PLZ</label>
            <input
              value={form.plz ?? ''}
              onChange={set('plz')}
              style={inputStyle}
              placeholder="1010"
              autoComplete="postal-code"
            />
          </div>
          <div>
            <label style={labelStyle}>Stadt</label>
            <input
              value={form.stadt ?? ''}
              onChange={set('stadt')}
              style={inputStyle}
              placeholder="Wien"
              autoComplete="address-level2"
            />
          </div>
        </div>

        {/* Land */}
        <div style={{ marginBottom: 32 }}>
          <label style={labelStyle}>Land</label>
          <select
            value={form.land ?? 'Österreich'}
            onChange={set('land')}
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          >
            {['Österreich', 'Deutschland', 'Schweiz', 'Liechtenstein'].map(l => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '12px 28px',
            background: isPending ? 'var(--sage)' : 'var(--text)', color: 'white',
            border: 'none', cursor: isPending ? 'not-allowed' : 'pointer',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            transition: 'background 0.3s',
          }}
        >
          {isPending ? 'Wird gespeichert…' : 'Adresse speichern'}
        </button>
      </form>
    </div>
  );
}
