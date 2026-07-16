'use client';

import { MapPin } from 'lucide-react';

export function PickupAlert() {
  return (
    <div className="w-full border rounded-xl p-4 bg-transparent border-primary/20 flex gap-3.5 items-start mt-3 select-none text-right">
      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-foreground font-iran-sans block">امکان تحویل حضوری</span>
        <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed mt-1 font-iran-sans">
          شما می‌توانید علاوه بر اینکه سفارش‌های خود را در محل موردنظرتان تحویل بگیرید، این امکان فراهم است که سفارش‌تان را مستقیم از درب فروشگاه تحویل بگیرید.
        </p>
      </div>
    </div>
  );
}