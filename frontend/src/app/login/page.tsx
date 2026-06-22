'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Metadata } from 'next';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    border: '1px solid var(--border-strong)', background: 'var(--white)',
    fontSize: 13, color: 'var(--text)', marginBottom: 16,
  } as const;

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Left: form */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 80px', background: 'var(--white)',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: 56 }}>
            Noven
          </Link>

          <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 12 }}>
            Willkommen zurück
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, marginBottom: 40 }}>Anmelden</h1>

          <label style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)', display: 'block', marginBottom: 8 }}>
            E-Mail
          </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ihre@email.at" style={inputStyle} />

          <label style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mid)', display: 'block', marginBottom: 8 }}>
            Passwort
          </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
            <button style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-light)', cursor: 'pointer' }}>
              Passwort vergessen?
            </button>
          </div>

          <button style={{
            width: '100%', padding: '15px 24px',
            background: 'var(--text)', color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Anmelden
          </button>

          <p style={{ fontSize: 13, color: 'var(--text-mid)', textAlign: 'center' }}>
            Noch kein Konto?{' '}
            <Link href="/signup" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Registrieren</Link>
          </p>
        </div>
      </div>

      {/* Right: decorative */}
      <div style={{
        background: 'var(--sage-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
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
