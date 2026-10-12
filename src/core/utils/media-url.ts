
export function resolveMediaUrl(path: unknown): string {
  // مقادیر نامعتبر
  if (!path || typeof path !== 'string') {
    return '/placeholder.png';
  }

  const trimmed = path.trim();

  if (!trimmed) {
    return '/placeholder.png';
  }

  // URL کامل یا data/blob → مستقیم برگردان
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // از قبل پروکسی‌شده → دست نزن
  if (trimmed.startsWith('/proxy-api/')) {
    return trimmed;
  }

  // asset داخلی خود پروژه Next (توی public/) → دست نزن
  if (
    trimmed.startsWith('/_next/') ||
    trimmed.startsWith('/Font/') ||
    trimmed.startsWith('/font/') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('/image/') ||
    trimmed.startsWith('/banners/') ||
    trimmed.startsWith('/banner/') ||
    trimmed.startsWith('/Logo') ||
    trimmed.startsWith('/Ylogo') ||
    trimmed.startsWith('/icon-') ||
    trimmed.startsWith('/favicon')
  ) {
    return trimmed;
  }

  // مسیر خام بک‌اند → از پروکسی رد کن
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const base = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/proxy-api').replace(
    /\/$/,
    ''
  );
  return `${base}${cleanPath}`;
}