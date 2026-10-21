'use client';

import { MapPin } from 'lucide-react';

export function PickupAlert() {
  return (
    <div className="mt-3 flex w-full select-none items-start gap-3.5 rounded-md border border-accent bg-accent/40 p-4">
      <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-foreground">امکان تحویل حضوری</span>
        <p className="mt-1 text-2xs leading-relaxed text-muted-foreground md:text-xs">
          شما می‌توانید علاوه بر اینکه سفارش‌های خود را در محل موردنظرتان تحویل بگیرید، این امکان فراهم است که سفارش‌تان را مستقیم از درب فروشگاه تحویل بگیرید.
        </p>
      </div>
    </div>
  );
}