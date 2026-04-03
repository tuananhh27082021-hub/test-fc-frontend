import type { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const url = searchParams.get('url');

    const response = await fetch(url as string);

    if (!response.ok) {
      return Response.json({ data: null, error: null }, { status: 500 });
    }

    return new Response(await response.text());
  } catch (e) {
    return Response.json({ data: null, error: null }, { status: 500 });
  }
};
