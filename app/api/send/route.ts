import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { subject, emailBody } = await req.json();

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.AI_WOC_FROM_EMAIL;
    const to = process.env.AI_WOC_DEFAULT_TO_EMAIL;

    if (!apiKey || !from || !to) {
      return NextResponse.json({ error: 'Server email configuration is missing.' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const sent = await resend.emails.send({
      from,
      to,
      subject,
      text: emailBody,
    });

    if (sent.error) {
      return NextResponse.json({ error: 'Email provider rejected the request.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
