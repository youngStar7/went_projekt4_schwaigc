'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [val, setVal] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (val.includes('@')) setSent(true);
  };

  return (
    <div style={{ background: 'var(--sage-bg)', padding: '80px 48px', textAlign: 'center' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {sent ? (
          <>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, marginBottom: 12 }}>Danke</p>
            <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.7 }}>
              Willkommen bei Noven. Wir melden uns bald.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 16 }}>
              Newsletter
            </p>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, marginBottom: 12 }}>
              Exklusive Einblicke
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.8, marginBottom: 36 }}>
              Neue Kollektionen, Designgeschichten und Angebote — direkt in Ihrem Postfach.
            </p>
            <div style={{ display: 'flex', gap: 0, maxWidth: 400, margin: '0 auto' }}>
              <input
                type="email"
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ihre E-Mail-Adresse"
                style={{
                  flex: 1, padding: '13px 18px',
                  border: '1px solid var(--border-strong)', borderRight: 'none',
                  fontSize: 13, background: 'var(--white)',
                  color: 'var(--text)',
                }}
              />
              <button
                onClick={send}
                style={{
                  padding: '13px 24px', background: 'var(--text)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                Anmelden
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 16 }}>
              Kein Spam. Jederzeit abmeldbar.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
