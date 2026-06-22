'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateNameAction } from '@/lib/actions';

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: '12px 28px',
        background: pending ? 'var(--sage)' : 'var(--text)', color: 'white',
        border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
        transition: 'background 0.3s',
      }}
    >
      {pending ? 'Wird gespeichert…' : 'Speichern'}
    </button>
  );
}

interface Props {
  currentName: string;
  email: string;
}

export default function PersonalDataForm({ currentName, email }: Props) {
  const [state, action] = useFormState(updateNameAction, undefined);

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    border: '1px solid var(--border-strong)', background: 'var(--white)',
    fontSize: 13, color: 'var(--text)', outline: 'none',
  } as const;

  const labelStyle = {
    fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    color: 'var(--text-light)', display: 'block', marginBottom: 8,
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, marginBottom: 28 }}>
        Persönliche Daten
      </h2>

      {state?.success && (
        <div style={{
          padding: '12px 16px', background: 'var(--sage-bg)',
          border: '1px solid var(--sage-light)', color: 'var(--sage-dark)',
          fontSize: 12, marginBottom: 24,
        }}>
          Name erfolgreich gespeichert.
        </div>
      )}
      {state?.error && (
        <div style={{
          padding: '12px 16px', background: '#fef2f2',
          border: '1px solid #fecaca', color: '#991b1b',
          fontSize: 12, marginBottom: 24,
        }}>
          {state.error}
        </div>
      )}

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input
            name="name"
            defaultValue={currentName}
            required
            minLength={2}
            style={inputStyle}
            placeholder="Ihr vollständiger Name"
            autoComplete="name"
          />
        </div>

        <div>
          <label style={labelStyle}>E-Mail-Adresse</label>
          <input
            value={email}
            readOnly
            style={{ ...inputStyle, background: 'var(--surface)', color: 'var(--text-mid)', cursor: 'not-allowed' }}
          />
          <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>
            Die E-Mail-Adresse kann nicht geändert werden.
          </p>
        </div>

        <div style={{ paddingTop: 8 }}>
          <SaveBtn />
        </div>
      </form>
    </div>
  );
}
