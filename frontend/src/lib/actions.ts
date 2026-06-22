'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from './auth';

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  try {
    await auth.api.signInEmail({
      body: { email, password },
    });
  } catch {
    return { error: 'Ungültige E-Mail-Adresse oder Passwort.' };
  }

  redirect('/dashboard');
}

export async function signupAction(_prev: unknown, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Bitte alle Felder ausfüllen.' };
  }
  if (password.length < 8) {
    return { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' };
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('already')) return { error: 'Diese E-Mail ist bereits registriert.' };
    return { error: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect('/login');
}

export async function updateNameAction(_prev: unknown, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name || name.length < 2) return { error: 'Name muss mindestens 2 Zeichen lang sein.' };

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'Nicht angemeldet.' };

  try {
    await auth.api.updateUser({
      body: { name },
      headers: await headers(),
    });
  } catch {
    return { error: 'Name konnte nicht gespeichert werden.' };
  }

  return { success: true };
}
