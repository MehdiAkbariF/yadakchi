'use client';

import * as React from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@/components/composites/Modal/Modal';
import { Button } from '@/components/primitives/Button/Button';
import { Spinner } from '@/components/composites/Loading/Spinner';
import { useGetOrderReceipt } from '@/domains/userpanel/hooks/userpanel.hooks';
import { toPersianDigits } from '@/core/utils/formatters';
import { Printer, FileText, AlertCircle, Truck } from 'lucide-react';

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderDate?: string;
}

const getShipmentMethodTitle = (method: string) => {
  switch (method) {
    case 'SnappBox':
      return 'اسنپ‌باکس (فوری)';
    case 'Tipax':
      return 'تیپاکس';
    case 'DirectShipment':
    case 'Seller':
      return 'ارسال مستقیم فروشگاه';
    case 'Local':
      return 'تحویل حضوری';
    default:
      return method || 'ارسال استاندارد';
  }
};

export function OrderReceiptModal({
  isOpen,
  onClose,
  orderId,
  orderDate,
}: OrderReceiptModalProps) {
  const { data: receipt, isLoading, isError } = useGetOrderReceipt(orderId);

  // فرمت ارقام ریالی
  const formatRial = (value: number | null | undefined) =>
    new Intl.NumberFormat('fa-IR').format(Math.abs(Math.round(value || 0)));

  // محاسبه مجموع قیمت پایه اقلام
  const totalOriginalPrice = (receipt?.orderReceiptItems || []).reduce(
    (sum: number, item: any) => sum + (item.originalPrice || 0) * (item.quantity || 1),
    0
  );

  // محاسبه کل هزینه ارسال از روی shipmentItems یا فیلد totalShipmentPrice
  const totalShipmentPrice =
    (receipt?.totalShipmentPrice && receipt.totalShipmentPrice > 0)
      ? receipt.totalShipmentPrice
      : (receipt?.shipmentItems || []).reduce(
          (sum: number, s: any) => sum + (s.shipmentPrice || 0),
          0
        );

  const displayOrderDate = orderDate
    ? new Date(orderDate).toLocaleDateString('fa-IR')
    : new Date().toLocaleDateString('fa-IR');

  const handlePrint = () => {
    if (!receipt) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsRowsHtml = (receipt.orderReceiptItems || [])
      .map((item: any, index: number) => {
        const itemTotalPrice = (item.originalPrice || 0) * (item.quantity || 1);
        const discountVal = item.discountAmount || 0;
        const finalPrice = item.finalTotalPrice || (itemTotalPrice - discountVal);

        return `
          <tr>
            <td>${toPersianDigits(index + 1)}</td>
            <td><bdi dir="ltr">${toPersianDigits(item.productCode)}</bdi></td>
            <td style="text-align: right; font-weight: 500;">${item.productTitle}</td>
            <td>${item.shopTitle || 'یدکچی'}</td>
            <td style="font-weight: bold;">${toPersianDigits(item.quantity)}</td>
            <td>${formatRial(item.originalPrice)}</td>
            <td>${formatRial(itemTotalPrice)}</td>
            <td style="color: ${discountVal > 0 ? '#dc2626' : '#111'}; font-weight: bold;">
              ${discountVal > 0 ? formatRial(discountVal) : '۰'}
            </td>
            <td style="font-weight: bold;">${formatRial(finalPrice)}</td>
          </tr>
        `;
      })
      .join('');

    const shipmentsHtml = (receipt.shipmentItems || [])
      .map(
        (s: any) => `
        <div class="shipment-item">
          <span>مرسوله فروشگاه <strong>${s.shopTitle}</strong> (${getShipmentMethodTitle(s.shipmentMethod)}):</span>
          <span>${formatRial(s.shipmentPrice)} ریال</span>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
        <head>
          <title>صورتحساب فروش | سفارش شماره ${toPersianDigits(receipt.orderNumber)}</title>
          <meta charset="UTF-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'IRANYekan', 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
              direction: rtl;
              background-color: #ffffff;
              color: #111111;
              padding: 10px;
              font-size: 11px;
              line-height: 1.4;
            }
            .invoice-box {
              width: 100%;
              max-width: 900px;
              margin: 0 auto;
              border: 1px solid #111;
              padding: 16px;
            }
            .header-title {
              text-align: center;
              border-bottom: 2px solid #111;
              padding-bottom: 10px;
              margin-bottom: 14px;
            }
            .header-title h1 {
              font-size: 16px;
              font-weight: 800;
            }
            .parties-container {
              display: flex;
              gap: 12px;
              margin-bottom: 12px;
            }
            .party-card {
              flex: 1;
              border: 1px solid #111;
              padding: 10px;
              background-color: #ffffff;
            }
            .party-card-title {
              background-color: #f3f4f6;
              border-bottom: 1px solid #111;
              margin: -10px -10px 8px -10px;
              padding: 4px;
              text-align: center;
              font-weight: bold;
              font-size: 11px;
            }
            .party-row {
              display: flex;
              margin-bottom: 4px;
              font-size: 10.5px;
            }
            .party-label {
              font-weight: bold;
              min-width: 95px;
            }
            .order-meta {
              display: flex;
              justify-content: space-between;
              border: 1px solid #111;
              background-color: #f9fafb;
              padding: 8px 12px;
              margin-bottom: 12px;
              font-size: 10.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
              font-size: 9.5px;
            }
            table th, table td {
              border: 1px solid #111;
              padding: 6px 4px;
              text-align: center;
              vertical-align: middle;
            }
            table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .total-table-row {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .shipment-box {
              border: 1px solid #111;
              background-color: #f9fafb;
              padding: 6px 12px;
              margin-bottom: 10px;
              font-size: 10.5px;
            }
            .shipment-item {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }
            .final-total-box {
              border-top: 2px solid #111;
              padding-top: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 12px;
              font-weight: bold;
            }
            .final-total-amount {
              font-size: 15px;
              color: #c2410c;
              font-weight: 900;
            }
            .signatures-box {
              display: flex;
              justify-content: space-between;
              margin-top: 28px;
              padding-top: 12px;
              border-top: 1px solid #111;
            }
            .sign-item {
              text-align: center;
            }
            .sign-item p {
              font-weight: bold;
              margin-bottom: 6px;
            }
            .sign-image {
              width: 120px;
              height: auto;
            }
            .sign-placeholder {
              width: 130px;
              height: 60px;
              border: 1px dashed #777;
            }
            .legal-footer {
              margin-top: 20px;
              text-align: center;
              font-size: 9.5px;
              color: #4b5563;
              border-top: 1px solid #e5e7eb;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header-title">
              <h1>صورتحساب فروش کالا و خدمات</h1>
            </div>

            <div class="parties-container">
              <div class="party-card">
                <div class="party-card-title">فروشنده</div>
                <div class="party-row"><span class="party-label">فروشنده:</span><span>فروشگاه اینترنتی یدکچی (سهامی خاص)</span></div>
                <div class="party-row"><span class="party-label">شناسه ملی:</span><span>۱۰۳۲۰۸۴۵۸۵۷</span></div>
                <div class="party-row"><span class="party-label">شماره ثبت:</span><span>۴۳۳۸۴۵</span></div>
                <div class="party-row"><span class="party-label">شماره اقتصادی:</span><span>۴۱۱۴۱۹۱۳۶۵۱۱</span></div>
                <div class="party-row"><span class="party-label">نشانی:</span><span>تهران، خ ملت، خ کاوه، کوچه افسانه، پ ۷، واحد ۶</span></div>
                <div class="party-row"><span class="party-label">کدپستی:</span><span>۱۵۱۷۸۶۳۳۳۲</span></div>
                <div class="party-row"><span class="party-label">تلفن:</span><span>۰۲۱-۶۱۹۳۰۰۰۰</span></div>
              </div>

              <div class="party-card">
                <div class="party-card-title">خریدار</div>
                <div class="party-row"><span class="party-label">نام خریدار:</span><span>${receipt.buyerFullName || 'ثبت نشده'}</span></div>
                <div class="party-row"><span class="party-label">کد / شناسه ملی:</span><span>${receipt.buyerNationalCode ? toPersianDigits(receipt.buyerNationalCode) : 'ثبت نشده'}</span></div>
                <div class="party-row"><span class="party-label">شماره اقتصادی:</span><span>${receipt.buyerEconomicCode ? toPersianDigits(receipt.buyerEconomicCode) : 'ندارد'}</span></div>
                <div class="party-row"><span class="party-label">شماره ثبت:</span><span>${receipt.buyerRegistrationNumber ? toPersianDigits(receipt.buyerRegistrationNumber) : 'ندارد'}</span></div>
                <div class="party-row"><span class="party-label">شماره تماس:</span><span>${receipt.buyerPhoneNumber ? toPersianDigits(receipt.buyerPhoneNumber) : 'ثبت نشده'}</span></div>
                <div class="party-row"><span class="party-label">کدپستی:</span><span>${receipt.buyerPostalCode ? toPersianDigits(receipt.buyerPostalCode) : 'ثبت نشده'}</span></div>
                <div class="party-row"><span class="party-label">نشانی:</span><span>${receipt.buyerAddress || 'ثبت نشده'}</span></div>
              </div>
            </div>

            <div class="order-meta">
              <div><strong>تاریخ سفارش:</strong> ${displayOrderDate}</div>
              <div><strong>شماره سفارش:</strong> ${toPersianDigits(receipt.orderNumber)}</div>
              <div><strong>شماره فاکتور:</strong> <bdi dir="ltr">${receipt.receiptNumber ? toPersianDigits(receipt.receiptNumber) : 'ندارد'}</bdi></div>
              <div><strong>نوع فاکتور:</strong> ${receipt.type === 'Legal' ? 'رسمی (حقوقی)' : 'عادی'}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">ردیف</th>
                  <th style="width: 12%;">کد کالا</th>
                  <th style="width: 33%; text-align: right; padding-right: 6px;">شرح کالا یا خدمات</th>
                  <th style="width: 14%;">فروشگاه</th>
                  <th style="width: 6%;">تعداد</th>
                  <th style="width: 10%;">مبلغ واحد (ریال)</th>
                  <th style="width: 10%;">مبلغ کل (ریال)</th>
                  <th style="width: 10%;">تخفیف (ریال)</th>
                  <th style="width: 10%;">مبلغ نهایی (ریال)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
                <tr class="total-table-row">
                  <td colspan="4">جمع کل اقلام</td>
                  <td>${toPersianDigits((receipt.orderReceiptItems || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0))}</td>
                  <td>—</td>
                  <td>${formatRial(totalOriginalPrice)}</td>
                  <td style="color: #dc2626;">${formatRial(receipt.totalDiscountValue || 0)}</td>
                  <td style="font-weight: 800;">${formatRial(totalOriginalPrice - (receipt.totalDiscountValue || 0))}</td>
                </tr>
              </tbody>
            </table>

            ${
              (receipt.shipmentItems && receipt.shipmentItems.length > 0) || totalShipmentPrice > 0
                ? `<div class="shipment-box">
                    <div style="font-weight: bold; margin-bottom: 4px;">هزینه‌های بسته‌بندی و ارسال:</div>
                    ${shipmentsHtml || `<div class="shipment-item"><span>مجموع هزینه ارسال:</span><span>${formatRial(totalShipmentPrice)} ریال</span></div>`}
                   </div>`
                : ''
            }

            <div class="final-total-box">
              <span>مبلغ نهایی پرداختی صورتحساب (ریال):</span>
              <span class="final-total-amount">${formatRial(receipt.totalFinalPrice)} ریال</span>
            </div>

            <div class="signatures-box">
              <div class="sign-item">
                <p>مهر و امضای فروشنده:</p>
                <img src="/mohr.webp" alt="مهر فروشگاه" class="sign-image" onerror="this.style.display='none'" />
              </div>
              <div class="sign-item">
                <p>امضای خریدار:</p>
                <div class="sign-placeholder"></div>
              </div>
            </div>

            <div class="legal-footer">
              * این سند به منزله فاکتور فروش رسمی کالا و خدمات صادر گردیده است *
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl">
      <ModalHeader onClose={onClose}>
        <ModalTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
          <FileText className="h-5 w-5 text-primary" />
          <span>صورتحساب سفارش {receipt ? `#${toPersianDigits(receipt.orderNumber)}` : ''}</span>
        </ModalTitle>
      </ModalHeader>

      <ModalBody className="max-h-[80vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Spinner className="h-8 w-8 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">
              در حال دریافت فاکتور رسمی از سرور...
            </span>
          </div>
        ) : isError || !receipt ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-bold text-foreground">
              خطا در بارگذاری فاکتور سفارش
            </p>
            <p className="text-xs text-muted-foreground">
              امکان دریافت اطلاعات صورتحساب در حال حاضر وجود ندارد.
            </p>
            <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
              بستن پنجره
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* برگه پیش‌نمایش روی صفحه */}
            <div className="select-none rounded-xl border border-black bg-white p-4 sm:p-6 text-zinc-900 shadow-xs">
              <div className="mb-4 border-b-2 border-black pb-3 text-center">
                <h2 className="text-base font-black sm:text-lg">
                  صورتحساب فروش کالا و خدمات
                </h2>
              </div>

              {/* دو ستون طرفین: فروشنده و خریدار */}
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-sm border border-black bg-white p-3">
                  <div className="-mx-3 -mt-3 mb-2 border-b border-black bg-zinc-100 p-1 text-center text-xs font-bold">
                    فروشنده
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] text-zinc-800">
                    <div className="flex"><span className="min-w-[95px] font-bold">نام شرکت:</span><span>جهان تدبیر یدک ایرانیان</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">شناسه ملی:</span><span>۱۰۳۲۰۸۴۵۸۵۷</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">شماره ثبت:</span><span>۴۳۳۸۴۵</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">شماره اقتصادی:</span><span>۴۱۱۴۱۹۱۳۶۵۱۱</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">نشانی:</span><span>تهران، خ ملت، خ کاوه، کوچه افسانه، پ ۷، واحد ۶</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">کدپستی:</span><span>۱۵۱۷۸۶۳۳۳۲</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">تلفن:</span><span>۰۲۱-۶۱۹۳۰۰۰۰</span></div>
                  </div>
                </div>

                <div className="rounded-sm border border-black bg-white p-3">
                  <div className="-mx-3 -mt-3 mb-2 border-b border-black bg-zinc-100 p-1 text-center text-xs font-bold">
                    خریدار
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] text-zinc-800">
                    <div className="flex"><span className="min-w-[95px] font-bold">نام خریدار:</span><span>{receipt.buyerFullName || 'ثبت نشده'}</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">کد / شناسه ملی:</span><span>{receipt.buyerNationalCode ? toPersianDigits(receipt.buyerNationalCode) : 'ثبت نشده'}</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">شماره اقتصادی:</span><span>{receipt.buyerEconomicCode ? toPersianDigits(receipt.buyerEconomicCode) : 'ندارد'}</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">شماره ثبت:</span><span>{receipt.buyerRegistrationNumber ? toPersianDigits(receipt.buyerRegistrationNumber) : 'ندارد'}</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">شماره تماس:</span><span>{receipt.buyerPhoneNumber ? toPersianDigits(receipt.buyerPhoneNumber) : 'ثبت نشده'}</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">کدپستی:</span><span>{receipt.buyerPostalCode ? toPersianDigits(receipt.buyerPostalCode) : 'ثبت نشده'}</span></div>
                    <div className="flex"><span className="min-w-[95px] font-bold">نشانی:</span><span className="leading-tight">{receipt.buyerAddress || 'ثبت نشده'}</span></div>
                  </div>
                </div>
              </div>

              {/* خلاصه فاکتور */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border border-black bg-zinc-50 p-2 text-xs font-medium">
                <div><strong>تاریخ سفارش:</strong> {displayOrderDate}</div>
                <div><strong>شماره سفارش:</strong> {toPersianDigits(receipt.orderNumber)}</div>
                <div><strong>شماره فاکتور:</strong> <bdi dir="ltr">{receipt.receiptNumber ? toPersianDigits(receipt.receiptNumber) : 'ندارد'}</bdi></div>
                <div><strong>نوع فاکتور:</strong> {receipt.type === 'Legal' ? 'رسمی (حقوقی)' : 'عادی'}</div>
              </div>

              {/* جدول اقلام دقیقا بر اساس ریسپانس */}
              <div className="mb-4 overflow-x-auto">
                <table className="w-full border-collapse border border-black text-center text-[10px]">
                  <thead>
                    <tr className="bg-zinc-100 font-bold text-black">
                      <th className="border border-black p-1.5">ردیف</th>
                      <th className="border border-black p-1.5">کد کالا</th>
                      <th className="border border-black p-1.5 text-right">شرح کالا یا خدمات</th>
                      <th className="border border-black p-1.5">فروشگاه</th>
                      <th className="border border-black p-1.5">تعداد</th>
                      <th className="border border-black p-1.5">مبلغ واحد (ریال)</th>
                      <th className="border border-black p-1.5">مبلغ کل (ریال)</th>
                      <th className="border border-black p-1.5">تخفیف (ریال)</th>
                      <th className="border border-black p-1.5">مبلغ نهایی (ریال)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(receipt.orderReceiptItems || []).map((item: any, index: number) => {
                      const itemTotalPrice = (item.originalPrice || 0) * (item.quantity || 1);
                      const discountVal = item.discountAmount || 0;
                      const finalPrice = item.finalTotalPrice || (itemTotalPrice - discountVal);

                      return (
                        <tr key={index} className="text-zinc-800">
                          <td className="border border-black p-1">{toPersianDigits(index + 1)}</td>
                          <td className="border border-black p-1"><bdi dir="ltr">{toPersianDigits(item.productCode)}</bdi></td>
                          <td className="border border-black p-1 text-right font-medium">{item.productTitle}</td>
                          <td className="border border-black p-1">{item.shopTitle || 'یدکچی'}</td>
                          <td className="border border-black p-1 font-bold">{toPersianDigits(item.quantity)}</td>
                          <td className="border border-black p-1">{formatRial(item.originalPrice)}</td>
                          <td className="border border-black p-1">{formatRial(itemTotalPrice)}</td>
                          <td className="border border-black p-1 font-bold text-red-600">
                            {discountVal > 0 ? formatRial(discountVal) : '۰'}
                          </td>
                          <td className="border border-black p-1 font-bold">{formatRial(finalPrice)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-zinc-100 font-bold text-black">
                      <td colSpan={4} className="border border-black p-1">جمع کل اقلام</td>
                      <td className="border border-black p-1">
                        {toPersianDigits(
                          (receipt.orderReceiptItems || []).reduce((sum: number, i: any) => sum + (i.quantity || 1), 0)
                        )}
                      </td>
                      <td className="border border-black p-1">—</td>
                      <td className="border border-black p-1">{formatRial(totalOriginalPrice)}</td>
                      <td className="border border-black p-1 text-red-600">{formatRial(receipt.totalDiscountValue || 0)}</td>
                      <td className="border border-black p-1 font-black">
                        {formatRial(totalOriginalPrice - (receipt.totalDiscountValue || 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* بخش مرسوله‌ها بر اساس shipmentItems */}
              {((receipt.shipmentItems && receipt.shipmentItems.length > 0) || totalShipmentPrice > 0) && (
                <div className="mb-3 rounded-sm border border-black bg-zinc-50 p-2.5 text-xs">
                  <div className="mb-1.5 flex items-center gap-1.5 font-bold text-zinc-900">
                    <Truck className="h-3.5 w-3.5" />
                    <span>هزینه‌های بسته‌بندی و ارسال:</span>
                  </div>
                  {receipt.shipmentItems && receipt.shipmentItems.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {receipt.shipmentItems.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between text-[11px] text-zinc-700">
                          <span>مرسوله فروشگاه <strong>{s.shopTitle}</strong> ({getShipmentMethodTitle(s.shipmentMethod)}):</span>
                          <span className="font-bold">{formatRial(s.shipmentPrice)} ریال</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-zinc-700">
                      <span>مجموع هزینه ارسال:</span>
                      <span className="font-bold">{formatRial(totalShipmentPrice)} ریال</span>
                    </div>
                  )}
                </div>
              )}

              {/* مبلغ نهایی کل منطبق با totalFinalPrice */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-black pt-3 text-xs">
                <span className="font-bold text-zinc-900">
                  مبلغ نهایی پرداختی فاکتور (ریال):
                </span>
                <span className="text-base font-black text-amber-600">
                  {formatRial(receipt.totalFinalPrice)} ریال
                </span>
              </div>

              <div className="mt-8 flex items-start justify-between border-t border-black pt-4 text-xs">
                <div className="flex flex-col items-center">
                  <span className="mb-2 font-bold">مهر و امضای فروشنده:</span>
                  <img
                    src="/mohr.webp"
                    alt="مهر فروشگاه"
                    className="h-auto w-28 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="mb-2 font-bold">امضای خریدار:</span>
                  <div className="h-16 w-32 rounded-sm border border-dashed border-zinc-400"></div>
                </div>
              </div>
            </div>

            {/* دکمه‌های کنترل مودال */}
            <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-3">
              <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs">
                بستن
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="h-9 gap-2 px-5 text-xs font-bold shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>چاپ فاکتور</span>
              </Button>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}