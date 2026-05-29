import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url, bearerToken } = await req.json();

    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
      return NextResponse.json({ error: 'A valid HTTPS URL is required.' }, { status: 400 });
    }

    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    const privateRange = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|localhost$|0\.0\.0\.0|::1$)/;
    if (privateRange.test(hostname)) {
      return NextResponse.json({ error: 'Private or local addresses are not permitted.' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 28000);

    try {
      const reqHeaders = { Accept: 'application/json, text/plain, */*', 'User-Agent': 'LevelShift-Demo/1.0' };
      if (bearerToken && typeof bearerToken === 'string' && bearerToken.trim()) {
        reqHeaders['Authorization'] = `Bearer ${bearerToken.trim()}`;
      }
      const response = await fetch(url, { signal: controller.signal, headers: reqHeaders });
      clearTimeout(timeout);
      const text = await response.text();
      return NextResponse.json({ text: text.slice(0, 6000), status: response.status });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const msg =
        fetchErr.name === 'AbortError'
          ? 'Connection timed out after 30 seconds. Check the endpoint is reachable.'
          : 'Could not reach the endpoint. Verify the URL and try again.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } catch (err) {
    console.error('[connect]', err.message);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
