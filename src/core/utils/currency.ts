/**
 * فرمت‌کننده واحد پول استاندارد ریال به تومان برای سراسر پنل کاربری
 */
export function formatToman(
  amount: number | string | undefined | null,
  options?: {
    isAlreadyToman?: boolean;
    showUnit?: boolean;
  }
): string {
  const { isAlreadyToman = false, showUnit = true } = options || {};

  if (amount === null || amount === undefined || amount === '') {
    return showUnit ? '۰ تومان' : '۰';
  }

  let numeric: number;
  if (typeof amount === 'string') {
    // پاکسازی کاراکترهای غیرعددی (به جز علامت منفی و ممیز)
    const cleaned = amount.replace(/[^0-9.-]+/g, '');
    numeric = parseFloat(cleaned);
  } else {
    numeric = amount;
  }

  if (isNaN(numeric)) {
    return showUnit ? '۰ تومان' : '۰';
  }

  const tomanValue = isAlreadyToman ? numeric : Math.round(numeric / 10);
  const formatted = new Intl.NumberFormat('fa-IR').format(tomanValue);

  return showUnit ? `${formatted} تومان` : formatted;
}