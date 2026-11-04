// src/components/features/Compare/CompareContent.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Trash2,
  ShoppingBag,
  Scale,
  ChevronDown,
  ShieldCheck,
  Truck,
  ArrowLeftRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProductService } from '@/domains/front/product/services/product.service';
import { useAddToBasket } from '@/domains/front/basket/hooks/basket.hooks';
import { AddProductToCompareModal } from './components/AddProductToCompareModal';
import { Breadcrumb } from '@/components/composites/Breadcrumb/Breadcrumb';
import { ThreeDotsLoader } from '@/components/composites/Loading/ThreeDotsLoader';
import { toPersianDigits, getFullUrl, getProductUrl } from '@/core/utils/formatters';
import { showToast } from '@/core/utils/toast';
import { cn } from '@/design-system/utils/cn';

const productService = getProductService();
const MAX_COMPARE_ITEMS = 4;

interface SellerOption {
  id: string;
  shopTitle: string;
  priceRaw: number;
  finalPrice: string;
  retailPrice?: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
  warrantyTitle?: string;
  deliveryDays?: string;
}

export function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [onlyDifferences, setOnlyDifferences] = React.useState(false);
  const [selectedSellerMap, setSelectedSellerMap] = React.useState<Record<number, string>>({});
  const [mobileComparePair, setMobileComparePair] = React.useState<[number, number]>([0, 1]);

  const addToBasket = useAddToBasket();

  const productCodes = React.useMemo(() => {
    const raw = searchParams.get('products') || searchParams.get('product');
    if (!raw) return [];
    const parsed = raw
      .split(',')
      .map((c) => parseInt(c.trim(), 10))
      .filter((c) => !isNaN(c) && c > 0);
    return Array.from(new Set(parsed));
  }, [searchParams]);

  const { data: productsData = [], isLoading } = useQuery({
    queryKey: ['front', 'compare-products', productCodes.join(',')],
    queryFn: async () => {
      if (productCodes.length === 0) return [];
      const promises = productCodes.map((code) => productService.getProductPageData(code));
      const results = await Promise.allSettled(promises);

      const successfulMap = new Map<number, any>();
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.product?.code) {
          successfulMap.set(res.value.product.code, res.value);
        }
      });

      return productCodes
        .map((code) => successfulMap.get(code))
        .filter(Boolean);
    },
    enabled: productCodes.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    const total = productsData.length;
    if (total <= 1) {
      setMobileComparePair([0, 1]);
    } else {
      setMobileComparePair(([a, b]) => {
        const nextA = a < total ? a : 0;
        let nextB = b < total ? b : 1;
        if (nextA === nextB) {
          nextB = (nextA + 1) % total;
        }
        return [nextA, nextB];
      });
    }
  }, [productsData.length]);

  const updateUrlParams = (newCodes: number[]) => {
    if (newCodes.length === 0) {
      router.push('/compare');
    } else {
      router.push(`/compare?products=${newCodes.join(',')}`);
    }
  };

  const handleRemoveProduct = (code: number) => {
    const filtered = productCodes.filter((c) => c !== code);
    updateUrlParams(filtered);
    showToast.success('کالا از مقایسه حذف شد');
  };

  const handleAddProduct = (code: number) => {
    if (productCodes.includes(code)) return;
    if (productCodes.length >= MAX_COMPARE_ITEMS) {
      showToast.error(`امکان مقایسه همزمان بیش از ${toPersianDigits(MAX_COMPARE_ITEMS)} کالا وجود ندارد`);
      return;
    }
    updateUrlParams([...productCodes, code]);
    showToast.success('کالا به مقایسه اضافه شد');
  };

  const handleSwapMobilePair = () => {
    setMobileComparePair(([a, b]) => [b, a]);
  };

  const handleAddSingleToBasket = async (shopProductId: string) => {
    try {
      await addToBasket.mutateAsync({ shopProductId, quantity: 1 });
      showToast.success('کالا به سبد خرید اضافه شد');
    } catch (err: any) {
      showToast.error(err?.userMessage || 'خطا در افزودن به سبد');
    }
  };

  const productPricingAnalysis = React.useMemo(() => {
    const map: Record<number, {
      allSellers: SellerOption[];
      cheapestSeller: SellerOption | null;
      minPriceRaw: number;
      maxPriceRaw: number;
      priceRangeLabel: string;
      activeSeller: SellerOption | null;
    }> = {};

    productsData.forEach((pd: any) => {
      const p = pd.product;
      const sp = pd.shopProducts || {};

      const rawSellers: any[] = [
        ...(sp.newOnline || []),
        ...(sp.newLocal || []),
        ...(sp.stockOnline || []),
        ...(sp.stockLocal || []),
        ...(sp.takeOffOnline || []),
        ...(sp.takeOffLocal || []),
      ];

      const uniqueSellersMap = new Map<string, any>();
      rawSellers.forEach((s) => {
        if (!uniqueSellersMap.has(s.id)) uniqueSellersMap.set(s.id, s);
      });

      const sellersList: SellerOption[] = Array.from(uniqueSellersMap.values()).map((s) => {
        const resolvedShopTitle =
          s.shop?.shopTitle ||
          s.shop?.title ||
          s.shopTitle ||
          s.shop?.name ||
          'یدکچی';

        return {
          id: s.id,
          shopTitle: resolvedShopTitle,
          priceRaw: s.finalPriceRaw || 0,
          finalPrice: s.finalPrice || '—',
          retailPrice: s.retailPrice,
          hasDiscount: s.hasDiscount,
          discountPercentage: s.discountPercentage,
          warrantyTitle: s.warrantyTitle || 'ضمانت اصالت و سلامت',
          deliveryDays: s.dayOfDeliveryLabel || 'ارسال عادی',
        };
      }).sort((a, b) => a.priceRaw - b.priceRaw);

      const cheapest = sellersList[0] || null;
      const minPrice = cheapest?.priceRaw || 0;
      const maxPrice = sellersList.length > 0 ? sellersList[sellersList.length - 1].priceRaw : 0;

      let rangeLabel = 'ناموجود';
      if (sellersList.length === 1) {
        rangeLabel = sellersList[0].finalPrice;
      } else if (sellersList.length > 1) {
        rangeLabel = minPrice === maxPrice
          ? sellersList[0].finalPrice
          : `از ${sellersList[0].finalPrice} تا ${sellersList[sellersList.length - 1].finalPrice}`;
      }

      const chosenSellerId = selectedSellerMap[p.code];
      const activeSeller = sellersList.find((s) => s.id === chosenSellerId) || cheapest;

      map[p.code] = {
        allSellers: sellersList,
        cheapestSeller: cheapest,
        minPriceRaw: minPrice,
        maxPriceRaw: maxPrice,
        priceRangeLabel: rangeLabel,
        activeSeller,
      };
    });

    return map;
  }, [productsData, selectedSellerMap]);

  const { allSpecGroups, specMatrix } = React.useMemo(() => {
    const groupMap = new Map<string, Set<string>>();

    productsData.forEach((pd: any) => {
      const groups = pd?.product?.specGroups || [];
      groups.forEach((g: any) => {
        if (!groupMap.has(g.name)) {
          groupMap.set(g.name, new Set());
        }
        (g.specs || []).forEach((s: any) => {
          groupMap.get(g.name)?.add(s.name);
        });
      });
    });

    const resultGroups: { groupName: string; specs: string[] }[] = [];
    groupMap.forEach((specSet, groupName) => {
      resultGroups.push({ groupName, specs: Array.from(specSet) });
    });

    const matrix: Record<string, Record<string, string[]>> = {};

    resultGroups.forEach(({ groupName, specs }) => {
      matrix[groupName] = {};
      specs.forEach((specName) => {
        const values = productsData.map((pd: any) => {
          const group = (pd?.product?.specGroups || []).find((g: any) => g.name === groupName);
          const item = (group?.specs || []).find((s: any) => s.name === specName);
          return item?.value?.trim() || '—';
        });
        matrix[groupName][specName] = values;
      });
    });

    return { allSpecGroups: resultGroups, specMatrix: matrix };
  }, [productsData]);

  const mobileProductA = productsData[mobileComparePair[0]] || null;
  const mobileProductB =
    productsData.length > 1 && mobileComparePair[0] !== mobileComparePair[1]
      ? productsData[mobileComparePair[1]] || null
      : null;

  const breadcrumbItems = [
    { id: 'home', title: 'خانه', href: '/' },
    { id: 'compare', title: 'مقایسه کالاها' },
  ];

  if (isLoading) {
    return (
      <div className="flex w-full min-h-[60vh] flex-col items-center justify-center gap-3">
        <ThreeDotsLoader size="md" />
        <span className="text-xs font-bold text-muted-foreground">در حال بارگذاری اطلاعات مقایسه...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 py-3 select-none" dir="rtl">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scale className="h-4 w-4 stroke-[2]" />
          </div>
          <div className="flex flex-col text-right">
            <h1 className="text-xs sm:text-sm font-black text-foreground">
              میز مقایسه تخصصی قطعات
            </h1>
            <span className="text-3xs text-muted-foreground">
              {toPersianDigits(productsData.length)} از حداکثر {toPersianDigits(MAX_COMPARE_ITEMS)} کالا در لیست
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          {productsData.length > 1 && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none bg-muted/40 hover:bg-muted/70 px-2.5 py-1.5 rounded-lg border border-border/60 transition-colors">
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => setOnlyDifferences(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-primary cursor-pointer"
              />
              <span className="text-2xs font-bold text-foreground">فقط تفاوت‌ها</span>
            </label>
          )}

          {productsData.length < MAX_COMPARE_ITEMS && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition-transform"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>افزودن کالا</span>
            </button>
          )}
        </div>
      </div>

      {productsData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <Scale className="h-6 w-6 stroke-[1.75]" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-foreground">هیچ کالایی برای مقایسه انتخاب نشده است</h2>
          <p className="max-w-sm text-2xs text-muted-foreground mt-1.5 leading-relaxed">
            کالاهای مورد نظر خود را اضافه کنید تا مشخصات و قیمت‌های فروشندگان را در کنار هم مقایسه کنید.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>افزودن کالا</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-card border border-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-black text-muted-foreground">
                  کالاهای فعال جهت مقایسه:
                </span>
                {productsData.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwapMobilePair}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg active:scale-95 transition-transform"
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                    <span>جابجایی دو طرف</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {productsData.map((pd: any, idx: number) => {
                  const isA = mobileComparePair[0] === idx;
                  const isB = productsData.length > 1 && mobileComparePair[1] === idx;

                  return (
                    <div
                      key={pd.product.id}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-3xs font-bold shrink-0 transition-all',
                        isA
                          ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                          : isB
                          ? 'border-shop bg-shop/10 text-shop ring-1 ring-shop'
                          : 'border-border bg-muted/30 text-muted-foreground'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isA) return;
                          if (isB) {
                            handleSwapMobilePair();
                          } else {
                            setMobileComparePair([mobileComparePair[0], idx]);
                          }
                        }}
                        className="flex items-center gap-1.5 text-right"
                      >
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-black shrink-0',
                            isA ? 'bg-primary' : isB ? 'bg-shop' : 'bg-muted-foreground/60'
                          )}
                        >
                          {toPersianDigits(idx + 1)}
                        </span>
                        <span className="max-w-[85px] truncate">{pd.product.title}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProduct(pd.product.code);
                        }}
                        className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}

                {productsData.length < MAX_COMPARE_ITEMS && (
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-dashed border-primary/50 text-primary text-3xs font-bold shrink-0 bg-primary/5 active:scale-95"
                  >
                    <Plus className="h-3 w-3" />
                    <span>افزودن ({toPersianDigits(productsData.length)}/{toPersianDigits(MAX_COMPARE_ITEMS)})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[mobileProductA, mobileProductB].map((pd: any, colIdx: number) => {
                const isFirst = colIdx === 0;
                const activeIndex = isFirst ? mobileComparePair[0] : mobileComparePair[1];
                const badgeColor = isFirst ? 'bg-primary text-primary-foreground' : 'bg-shop text-shop-foreground';
                const borderColor = isFirst ? 'border-primary/40' : 'border-shop/40';

                if (!pd) {
                  return (
                    <button
                      key={colIdx}
                      type="button"
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-border bg-card/60 text-muted-foreground hover:text-primary hover:border-primary/40 min-h-[230px] transition-all group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-2">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-2xs font-bold text-foreground">افزودن کالای مقایسه</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">انتخاب کالا از لیست</span>
                    </button>
                  );
                }

                const p = pd.product;
                const pricing = productPricingAnalysis[p.code];
                const activeSeller = pricing?.activeSeller;

                return (
                  <div
                    key={p.id}
                    className={cn(
                      'relative flex flex-col rounded-2xl border bg-card p-2.5 shadow-xs justify-between gap-2 transition-all',
                      borderColor
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black', badgeColor)}>
                        کالای {toPersianDigits(activeIndex + 1)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p.code)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Link href={getProductUrl(p.code, p.title)} className="flex flex-col items-center text-center gap-1.5">
                      <div className="relative h-20 w-20 rounded-xl border border-border p-1 bg-card overflow-hidden">
                        <Image src={getFullUrl(p.image)} alt={p.title} fill className="object-contain p-1" />
                      </div>
                      <span className="line-clamp-2 text-3xs font-bold text-foreground leading-tight">
                        {p.title}
                      </span>
                    </Link>

                    <div className="pt-2 border-t border-dashed border-border/70 flex flex-col gap-1.5 mt-auto">
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] text-muted-foreground">قیمت</span>
                        <span className="text-2xs font-black text-foreground">{pricing?.priceRangeLabel}</span>
                      </div>

                      {activeSeller ? (
                        <button
                          type="button"
                          onClick={() => handleAddSingleToBasket(activeSeller.id)}
                          className={cn(
                            'flex items-center justify-center gap-1 h-7 w-full rounded-lg text-3xs font-bold shadow-xs active:scale-95 transition-transform text-white',
                            isFirst ? 'bg-primary' : 'bg-shop'
                          )}
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span className="truncate">خرید از {activeSeller.shopTitle}</span>
                        </button>
                      ) : (
                        <div className="h-7 w-full flex items-center justify-center rounded-lg bg-muted text-3xs font-bold text-muted-foreground">
                          ناموجود
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {mobileProductA && mobileProductB && (
              <div className="flex flex-col gap-2.5 mt-2">
                {allSpecGroups.map(({ groupName, specs }) => {
                  const pAIndex = mobileComparePair[0];
                  const pBIndex = mobileComparePair[1];

                  const validSpecs = specs.filter((specName) => {
                    const valA = specMatrix[groupName]?.[specName]?.[pAIndex] || '—';
                    const valB = specMatrix[groupName]?.[specName]?.[pBIndex] || '—';
                    if (onlyDifferences) return valA !== valB;
                    return true;
                  });

                  if (validSpecs.length === 0) return null;

                  return (
                    <div key={groupName} className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
                      <div className="bg-muted/40 px-3 py-1.5 text-2xs font-black text-foreground border-b border-border/60">
                        {groupName}
                      </div>

                      <div className="flex flex-col divide-y divide-border/40">
                        {validSpecs.map((specName) => {
                          const valA = specMatrix[groupName]?.[specName]?.[pAIndex] || '—';
                          const valB = specMatrix[groupName]?.[specName]?.[pBIndex] || '—';
                          const isDifferent = valA !== valB;

                          return (
                            <div
                              key={specName}
                              className={cn(
                                'flex flex-col p-2.5 gap-2 transition-colors',
                                isDifferent ? 'bg-primary/[0.04]' : 'bg-card'
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-3xs font-black text-muted-foreground">{specName}</span>
                                {isDifferent && (
                                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    تفاوت دارد
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-center text-2xs font-semibold">
                                <div className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-muted/20 border border-primary/20">
                                  <span className="text-[9px] font-black text-primary">
                                    کالای {toPersianDigits(pAIndex + 1)}
                                  </span>
                                  <span className="text-foreground font-bold">{toPersianDigits(valA)}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-muted/20 border border-shop/20">
                                  <span className="text-[9px] font-black text-shop">
                                    کالای {toPersianDigits(pBIndex + 1)}
                                  </span>
                                  <span className="text-foreground font-bold">{toPersianDigits(valB)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs pb-3">
            <table className="w-max min-w-full table-fixed border-collapse text-right">
              <thead>
                <tr className="border-b border-border/80 bg-muted/20">
                  <th className="w-44 min-w-[180px] max-w-[180px] p-3 text-2xs font-black text-muted-foreground shrink-0 sticky start-0 bg-card z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] align-top">
                    <div className="flex flex-col gap-0.5 pt-1">
                      <span>کالاهای منتخب</span>
                      <span className="text-3xs text-muted-foreground font-normal">مشخصات و قیمت</span>
                    </div>
                  </th>

                  {productsData.map((pd: any, idx: number) => {
                    const p = pd.product;
                    const pricing = productPricingAnalysis[p.code];
                    const activeSeller = pricing?.activeSeller;
                    const allSellers = pricing?.allSellers || [];

                    return (
                      <th key={p.id} className="w-56 min-w-[220px] max-w-[230px] p-3 align-top">
                        <div className="flex flex-col gap-2.5 h-full">
                          <div className="flex items-center justify-between">
                            <span className="text-3xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              کالای {toPersianDigits(idx + 1)}
                            </span>

                            <div className="flex items-center gap-1">
                              <span className="text-3xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {toPersianDigits(p.code)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(p.code)}
                                title="حذف از مقایسه"
                                className="p-0.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <Link href={getProductUrl(p.code, p.title)} className="group flex flex-col items-center gap-1.5">
                            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-2xs">
                              <Image
                                src={getFullUrl(p.image)}
                                alt={p.title}
                                fill
                                className="object-contain p-1 group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <span className="line-clamp-2 text-2xs font-bold text-foreground text-center group-hover:text-primary transition-colors leading-relaxed">
                              {p.title}
                            </span>
                          </Link>

                          <div className="mt-auto pt-2 border-t border-dashed border-border/70 flex flex-col gap-1.5">
                            <div className="flex flex-col items-center text-center">
                              <span className="text-3xs text-muted-foreground font-normal">
                                {allSellers.length > 1 ? `${toPersianDigits(allSellers.length)} فروشگاه` : 'قیمت قطعه'}
                              </span>
                              <span className="text-xs font-black text-foreground" dir="rtl">
                                {pricing?.priceRangeLabel}
                              </span>
                            </div>

                            {allSellers.length > 1 && (
                              <div className="relative w-full">
                                <select
                                  value={activeSeller?.id}
                                  onChange={(e) => {
                                    setSelectedSellerMap((prev) => ({ ...prev, [p.code]: e.target.value }));
                                  }}
                                  className="w-full h-7 px-1.5 pe-5 text-3xs font-bold rounded-md border border-border bg-muted/40 text-foreground appearance-none outline-none focus:border-primary cursor-pointer truncate"
                                >
                                  {allSellers.map((seller, sIdx) => (
                                    <option key={seller.id} value={seller.id}>
                                      {seller.shopTitle} {sIdx === 0 ? '(بهترین قیمت) - ' : ' - '} {seller.finalPrice}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute end-1.5 top-2 h-2.5 w-2.5 text-muted-foreground pointer-events-none" />
                              </div>
                            )}

                            {activeSeller ? (
                              <button
                                type="button"
                                onClick={() => handleAddSingleToBasket(activeSeller.id)}
                                className="flex items-center justify-center gap-1 h-8 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover text-2xs font-bold shadow-xs active:scale-95 transition-all px-1.5"
                              >
                                <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">خرید از {activeSeller.shopTitle}</span>
                              </button>
                            ) : (
                              <div className="h-8 w-full flex items-center justify-center rounded-lg bg-muted text-3xs font-bold text-muted-foreground">
                                ناموجود
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}

                  {productsData.length < MAX_COMPARE_ITEMS && (
                    <th className="w-48 min-w-[180px] max-w-[190px] p-3 align-middle text-center border-s border-dashed border-border/60">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary w-full transition-all group active:scale-98"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                          <Plus className="h-4 w-4" />
                        </div>
                        <span className="text-2xs font-bold">افزودن کالا</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                <tr className="bg-muted/40 border-b border-border/80">
                  <td
                    colSpan={productsData.length + (productsData.length < MAX_COMPARE_ITEMS ? 2 : 1)}
                    className="py-1.5 px-3 text-2xs font-black text-primary sticky start-0"
                  >
                    تامین‌کننده و اصالت
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="w-44 min-w-[180px] max-w-[180px] p-2.5 text-2xs font-bold text-muted-foreground sticky start-0 bg-card z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] truncate">
                    گارانتی قطعه
                  </td>
                  {productsData.map((pd: any) => {
                    const pricing = productPricingAnalysis[pd.product.code];
                    return (
                      <td key={pd.product.id} className="w-56 min-w-[220px] max-w-[230px] p-2.5 text-2xs font-semibold text-foreground text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{pricing?.activeSeller?.warrantyTitle || 'ضمانت اصالت'}</span>
                        </div>
                      </td>
                    );
                  })}
                  {productsData.length < MAX_COMPARE_ITEMS && <td className="w-48 border-s border-dashed border-border/40" />}
                </tr>

                <tr className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="w-44 min-w-[180px] max-w-[180px] p-2.5 text-2xs font-bold text-muted-foreground sticky start-0 bg-card z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] truncate">
                    زمان ارسال
                  </td>
                  {productsData.map((pd: any) => {
                    const pricing = productPricingAnalysis[pd.product.code];
                    return (
                      <td key={pd.product.id} className="w-56 min-w-[220px] max-w-[230px] p-2.5 text-2xs font-semibold text-foreground text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Truck className="h-3 w-3 shrink-0 text-primary" />
                          <span>{pricing?.activeSeller?.deliveryDays || 'آماده ارسال'}</span>
                        </div>
                      </td>
                    );
                  })}
                  {productsData.length < MAX_COMPARE_ITEMS && <td className="w-48 border-s border-dashed border-border/40" />}
                </tr>

                {allSpecGroups.map(({ groupName, specs }) => {
                  const filteredSpecs = specs.filter((specName) => {
                    if (!onlyDifferences) return true;
                    const values = specMatrix[groupName]?.[specName] || [];
                    const firstVal = values[0];
                    return values.some((v) => v !== firstVal);
                  });

                  if (filteredSpecs.length === 0) return null;

                  return (
                    <React.Fragment key={groupName}>
                      <tr className="bg-muted/40 border-b border-border/80">
                        <td
                          colSpan={productsData.length + (productsData.length < MAX_COMPARE_ITEMS ? 2 : 1)}
                          className="py-1.5 px-3 text-2xs font-black text-primary sticky start-0"
                        >
                          {groupName}
                        </td>
                      </tr>

                      {filteredSpecs.map((specName, sIdx) => {
                        const values = specMatrix[groupName]?.[specName] || [];
                        const isRowDifferent = values.some((v) => v !== values[0]);

                        return (
                          <tr
                            key={sIdx}
                            className={cn(
                              'border-b border-border/50 transition-colors',
                              isRowDifferent ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : 'hover:bg-muted/10'
                            )}
                          >
                            <td className="w-44 min-w-[180px] max-w-[180px] p-2.5 text-2xs font-bold text-muted-foreground sticky start-0 bg-card z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.03)] truncate">
                              {specName}
                            </td>

                            {values.map((val, vIdx) => (
                              <td key={vIdx} className="w-56 min-w-[220px] max-w-[230px] p-2.5 text-2xs font-semibold text-foreground text-center truncate">
                                {toPersianDigits(val)}
                              </td>
                            ))}

                            {productsData.length < MAX_COMPARE_ITEMS && (
                              <td className="w-48 border-s border-dashed border-border/40" />
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AddProductToCompareModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectProduct={handleAddProduct}
        existingCodes={productCodes}
      />
    </div>
  );
}

export default CompareContent;