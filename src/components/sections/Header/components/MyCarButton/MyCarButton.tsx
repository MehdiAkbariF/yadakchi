// src/components/sections/Header/components/MyCarButton/MyCarButton.tsx

import Link from 'next/link';
import { Car } from 'lucide-react';

export function MyCarButton() {
  return (
    <Link href="/my-car" className="flex items-center gap-1 text-xs xl:text-sm hover:text-primary transition-colors whitespace-nowrap">
      <Car className="h-3 w-3 xl:h-4 xl:w-4" />
      ماشین من
    </Link>
  );
}