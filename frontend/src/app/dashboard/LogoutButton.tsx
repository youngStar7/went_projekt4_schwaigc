'use client';

import { logoutAction } from '@/lib/actions';
import { useTransition } from 'react';

export default function LogoutButton() {
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() => start(() => logoutAction())}
      disabled={pending}
      style={{
        background: 'none', border: '1px solid var(--border-strong)',
        padding: '10px 20px', cursor: pending ? 'not-allowed' : 'pointer',
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: pending ? 'var(--text-light)' : 'var(--text)',
        transition: 'all 0.2s',
      }}
    >
      {pending ? 'Abmelden…' : 'Abmelden'}
    </button>
  );
}
