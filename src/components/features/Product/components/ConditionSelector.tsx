'use client';

import { cn } from '@/design-system/utils/cn';

interface ConditionSelectorProps {
  selectedCondition: 'New' | 'Stock' | 'TakeOff';
  onChangeCondition: (cond: 'New' | 'Stock' | 'TakeOff') => void;
  sellersGroup: any;
}

export function ConditionSelector({ selectedCondition, onChangeCondition, sellersGroup }: ConditionSelectorProps) {
  const isNewAvailable = sellersGroup.newOnline.length > 0 || sellersGroup.newLocal.length > 0;
  const isStockAvailable = sellersGroup.stockOnline.length > 0 || sellersGroup.stockLocal.length > 0;
  const isTakeOffAvailable = sellersGroup.takeOffOnline.length > 0 || sellersGroup.takeOffLocal.length > 0;

  const hasAnyCondition = isNewAvailable || isStockAvailable || isTakeOffAvailable;

  if (!hasAnyCondition) return null;

  const baseBtn = "px-5 py-2 rounded-xl text-xs font-bold font-iran-yekan border transition-all outline-none";
  const activeBtn = "border-shop/60 bg-shop/5 text-shop ring-1 ring-shop/30";
  const idleBtn = "border-shop/20 hover:border-shop/40 bg-background text-foreground";

  return (
    <div className="w-full flex flex-col gap-2.5 text-right mt-2 select-none">
      <span className="text-xs font-bold font-iran-yekan text-foreground">نوع قطعه را انتخاب کنید:</span>
      <div className="flex flex-wrap gap-2">
        {isNewAvailable && (
          <button
            type="button"
            onClick={() => onChangeCondition('New')}
            className={cn(baseBtn, selectedCondition === 'New' ? activeBtn : idleBtn)}
          >
            قطعه نو
          </button>
        )}

        {isStockAvailable && (
          <button
            type="button"
            onClick={() => onChangeCondition('Stock')}
            className={cn(baseBtn, selectedCondition === 'Stock' ? activeBtn : idleBtn)}
          >
            قطعه استوک
          </button>
        )}

        {isTakeOffAvailable && (
          <button
            type="button"
            onClick={() => onChangeCondition('TakeOff')}
            className={cn(baseBtn, selectedCondition === 'TakeOff' ? activeBtn : idleBtn)}
          >
            قطعه زیرصفری
          </button>
        )}
      </div>
    </div>
  );
}