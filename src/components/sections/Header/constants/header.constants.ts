// src/components/sections/Header/constants/header.constants.ts

import { Grid3x3, Tag, Star, ShoppingCart, Shield } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'categories', label: 'دسته بندی قطعات', icon: Grid3x3, href: '/categories', hasDropdown: true },
  { id: 'offers', label: 'یدکچی آف', icon: Tag, href: '/offers', hasDropdown: false },
  { id: 'special', label: 'فروش ویژه', icon: Star, href: '/special', hasDropdown: false },
  { id: 'bestsellers', label: 'پرفروش ترین ها', icon: ShoppingCart, href: '/bestsellers', hasDropdown: false },
  { id: 'guarantee', label: 'ضمانت و گارانتی', icon: Shield, href: '/guarantee', hasDropdown: false },
] as const;

export const CATEGORY_DROPDOWN = [
  { id: 'engine', label: 'قطعات موتور', href: '/categories/engine' },
  { id: 'transmission', label: 'قطعات گیربکس', href: '/categories/transmission' },
  { id: 'brake', label: 'قطعات ترمز', href: '/categories/brake' },
  { id: 'suspension', label: 'سیستم تعلیق', href: '/categories/suspension' },
  { id: 'electrical', label: 'سیستم برق', href: '/categories/electrical' },
  { id: 'body', label: 'قطعات بدنه', href: '/categories/body' },
  { id: 'fluids', label: 'روغن و مایعات', href: '/categories/fluids' },
  { id: 'accessories', label: 'لوازم جانبی', href: '/categories/accessories' },
] as const;

export const HEADER_CONSTANTS = {
  SCROLL_THRESHOLD: 50,
  SEARCH_PLACEHOLDER: 'جستجوی قطعات، برندها، خودرو...',
  MOBILE_SEARCH_PLACEHOLDER: 'جستجو...',
} as const;