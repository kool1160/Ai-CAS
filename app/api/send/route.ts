import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'The legacy /api/send endpoint is disabled. Use the controlled /api/send-correction workflow.' },
    { status: 410 },
  );
}
