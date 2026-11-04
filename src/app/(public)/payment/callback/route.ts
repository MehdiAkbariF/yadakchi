// src/app/(public)/payment/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * 🔹 استخراج دامنه و پروتکل واقعی سایت حتی اگر پشت Nginx/داکر باشد
 */
function getBaseUrl(req: NextRequest): string {
  // ۱. اولویت اول: خواندن از متغیر محیطی دامنه (در صورت تعریف)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  // ۲. اولویت دوم: استخراج از هدرهای Reverse Proxy (Nginx / Cloudflare)
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // ۳. اولویت سوم: هدر Host استاندارد مرورگر
  const host = req.headers.get('host');
  if (host && !host.includes('localhost')) {
    return `https://${host}`;
  }

  // ۴. در صورت اجرای محلی
  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const queryString = params.toString();

    const baseUrl = getBaseUrl(req);
    const redirectUrl = new URL(
      `/payment/callback/result${queryString ? `?${queryString}` : ''}`,
      baseUrl
    );

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (err) {
    console.error('[PaymentCallback] Failed to parse POST body:', err);

    const baseUrl = getBaseUrl(req);
    return NextResponse.redirect(
      new URL('/payment/callback/result?Status=failed', baseUrl),
      { status: 303 }
    );
  }
}

export async function GET(req: NextRequest) {
  const queryString = req.nextUrl.searchParams.toString();
  const baseUrl = getBaseUrl(req);

  const redirectUrl = new URL(
    `/payment/callback/result${queryString ? `?${queryString}` : ''}`,
    baseUrl
  );

  return NextResponse.redirect(redirectUrl, { status: 303 });
}