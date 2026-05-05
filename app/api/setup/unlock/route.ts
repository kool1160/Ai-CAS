import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const setupCode = process.env.REFAB_CONNECT_SETUP_CODE;

  if (!setupCode) {
    return NextResponse.json(
      { error: 'Setup unlock code is not configured. Add REFAB_CONNECT_SETUP_CODE to enable Setup/Admin.' },
      { status: 503 },
    );
  }

  let payload: { code?: unknown };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid setup unlock request.' }, { status: 400 });
  }

  const submittedCode = typeof payload.code === 'string' ? payload.code : '';

  if (!submittedCode || submittedCode !== setupCode) {
    return NextResponse.json({ error: 'Incorrect master code.' }, { status: 401 });
  }

  return NextResponse.json({ unlocked: true });
}
