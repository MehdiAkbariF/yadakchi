// src/app/(public)/payment/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';

function getSafeBaseUrl(req: NextRequest): string {
  // ۱. اولویت قطعی و امن: آدرس سایت تعریف شده در متغیر محیطی
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  // ۲. استخراج دامنه امن از رکوئست
  const origin = req.nextUrl.origin;
  if (origin && !origin.includes('localhost')) {
    return origin;
  }

  return 'https://yadakchi.com';
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const queryString = params.toString();

    const baseUrl = getSafeBaseUrl(req);
    const redirectUrl = new URL(
      `/payment/callback/result${queryString ? `?${queryString}` : ''}`,
      baseUrl
    );

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (err) {
    console.error('[PaymentCallback] Security Alert - Failed to parse POST body:', err);

    const baseUrl = getSafeBaseUrl(req);
    return NextResponse.redirect(
      new URL('/payment/callback/result?Status=failed', baseUrl),
      { status: 303 }
    );
  }
}

export async function GET(req: NextRequest) {
  const queryString = req.nextUrl.searchParams.toString();
  const baseUrl = getSafeBaseUrl(req);

  const redirectUrl = new URL(
    `/payment/callback/result${queryString ? `?${queryString}` : ''}`,
    baseUrl
  );

  return NextResponse.redirect(redirectUrl, { status: 303 });
}