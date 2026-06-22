'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '@/lib/actions';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%', padding: '15px 24px',
        background: pending ? 'var(--sage)' : 'var(--text)', color: 'white',
        border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: 24, transition: 'background 0.3s',
      }}
    >
      {pending ? 'Wird angemeldet…' : 'Anmelden'}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useFormState(loginAction, undefined);

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    border: '1px solid var(--border-strong)', background: 'var(--white)',
    fontSize: 13, color: 'var(--text)', marginBottom: 16, outline: 'none',
  } as const;

  const labelStyle = {
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
    color: 'var(--text-mid)', display: 'block', marginBottom: 8,
  };

  return (
    <form action={action}>
      {state?.error && (
        <div style={{
          padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
          color: '#991b1b', fontSize: 12, marginBottom: 20, lineHeight: 1.5,
        }}>
          {state.error}
        </div>
      )}

      <label style={labelStyle}>E-Mail</label>
      <input
        type="email" name="email" required
        placeholder="ihre@email.at" style={inputStyle}
        autoComplete="email"
      />

      <label style={labelStyle}>Passwort</label>
      <input
        type="password" name="password" required
        placeholder="••••••••" style={inputStyle}
        autoComplete="current-password"
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--text-light)', cursor: 'pointer' }}>
          Passwort vergessen?
        </button>
      </div>

      <SubmitBtn />

      <p style={{ fontSize: 13, color: 'var(--text-mid)', textAlign: 'center' }}>
        Noch kein Konto?{' '}
        <Link href="/signup" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
          Registrieren
        </Link>
      </p>
    </form>
  );
}
