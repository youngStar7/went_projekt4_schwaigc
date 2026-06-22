'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    border: '1px solid var(--border-strong)', background: 'var(--white)',
    fontSize: 13, color: 'var(--text)', marginBottom: 16,
  } as const;

  const labelStyle = {
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
    color: 'var(--text-mid)', display: 'block', marginBottom: 8,
  };

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
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white', marginBottom: 'auto', position: 'relative', zIndex: 1 }}>
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
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, marginBottom: 40 }}>Konto erstellen</h1>

          <label style={labelStyle}>Name</label>
          <input type="text" value={form.name} onChange={set('name')} placeholder="Ihr Name" style={inputStyle} />

          <label style={labelStyle}>E-Mail</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="ihre@email.at" style={inputStyle} />

          <label style={labelStyle}>Passwort</label>
          <input type="password" value={form.password} onChange={set('password')} placeholder="Mindestens 8 Zeichen" style={inputStyle} />

          <p style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 28 }}>
            Mit der Registrierung stimmen Sie unseren <a href="/" style={{ color: 'var(--text)' }}>AGB</a> und der <a href="/" style={{ color: 'var(--text)' }}>Datenschutzerklärung</a> zu.
          </p>

          <button style={{
            width: '100%', padding: '15px 24px',
            background: 'var(--text)', color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24,
          }}>
            Konto erstellen
          </button>

          <p style={{ fontSize: 13, color: 'var(--text-mid)', textAlign: 'center' }}>
            Bereits registriert?{' '}
            <Link href="/login" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Anmelden</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
