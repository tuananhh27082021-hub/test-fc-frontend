import { NextResponse } from 'next/server';

const RPC_URL = process.env.RPC_URL;

export async function POST(request: Request) {
  if (!RPC_URL) {
    return NextResponse.json({ error: 'RPC not configured' }, { status: 500 });
  }

  const body = await request.text();

  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
