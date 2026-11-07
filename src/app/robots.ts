import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yadakchi.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/profile/',
          '/profile/*',
          '/basket',
          '/checkout',
          '/basket-payment',
          '/payment/*',
          '/api/',
          '/proxy-api/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/profile/',
          '/basket',
          '/checkout',
          '/basket-payment',
          '/payment/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}