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

  return (
    <div className="w-full flex flex-col gap-2.5 text-right mt-2">
      <span className="text-xs font-bold font-iran-yekan text-muted-foreground">نوع قطعه را انتخاب کنید:</span>
      <div className="flex flex-wrap gap-2">
        <button
          disabled={!isNewAvailable}
          onClick={() => onChangeCondition('New')}
          className={cn(
            "px-5 py-2 rounded-xl text-xs font-bold font-iran-sans border transition-all disabled:opacity-35 outline-none",
            selectedCondition === 'New' 
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" 
              : "hover:border-primary/20 bg-background text-foreground"
          )}
        >
          قطعه نو
        </button>

        <button
          disabled={!isStockAvailable}
          onClick={() => onChangeCondition('Stock')}
          className={cn(
            "px-5 py-2 rounded-xl text-xs font-bold font-iran-sans border transition-all disabled:opacity-35 outline-none",
            selectedCondition === 'Stock' 
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" 
              : "hover:border-primary/20 bg-background text-foreground"
          )}
        >
          قطعه استوک
        </button>

        <button
          disabled={!isTakeOffAvailable}
          onClick={() => onChangeCondition('TakeOff')}
          className={cn(
            "px-5 py-2 rounded-xl text-xs font-bold font-iran-sans border transition-all disabled:opacity-35 outline-none",
            selectedCondition === 'TakeOff' 
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" 
              : "hover:border-primary/20 bg-background text-foreground"
          )}
        >
          قطعه زیرصفری
        </button>
      </div>
    </div>
  );
}