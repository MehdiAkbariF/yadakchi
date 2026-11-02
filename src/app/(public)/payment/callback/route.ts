// src/app/(public)/payment/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * هندلر POST درگاه سامان
 *
 * درگاه سامان با POST و body به فرمت
 * `application/x-www-form-urlencoded` به این مسیر درخواست می‌زند.
 *
 * ما این POST را به یک GET با query params تبدیل می‌کنیم
 * (با status 303 = See Other) تا صفحه‌ی result بتواند
 * پارامترها را از `searchParams` بخواند.
 */
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const queryString = params.toString();

    const redirectUrl = new URL(
      `/payment/callback/result${queryString ? `?${queryString}` : ''}`,
      req.url
    );

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (err) {
    console.error('[PaymentCallback] Failed to parse POST body:', err);

    return NextResponse.redirect(
      new URL('/payment/callback/result?Status=failed', req.url),
      { status: 303 }
    );
  }
}


export async function GET(req: NextRequest) {
  const queryString = req.nextUrl.searchParams.toString();
  const redirectUrl = new URL(
    `/payment/callback/result${queryString ? `?${queryString}` : ''}`,
    req.url
  );

  return NextResponse.redirect(redirectUrl, { status: 303 });
}