import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/prisma';

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db
    .selectFrom('user_profile')
    .selectAll()
    .where('userId', '=', user.id)
    .execute();

  return NextResponse.json(rows[0] ?? { userId: user.id });
}

export async function PUT(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    phone?: string; strasse?: string; nr?: string;
    plz?: string; stadt?: string; land?: string;
  };

  const existing = await db
    .selectFrom('user_profile')
    .select('id')
    .where('userId', '=', user.id)
    .executeTakeFirst();

  if (existing) {
    await db
      .updateTable('user_profile')
      .set({ ...body })
      .where('userId', '=', user.id)
      .execute();
  } else {
    const { nanoid } = await import('nanoid');
    await db
      .insertInto('user_profile')
      .values({ id: nanoid(), userId: user.id, ...body })
      .execute();
  }

  return NextResponse.json({ ok: true });
}
