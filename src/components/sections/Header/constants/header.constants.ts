// src/components/sections/Header/constants/header.constants.ts

import { Grid3x3, Tag, Star, ShoppingCart, Shield } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'categories', label: 'دسته بندی قطعات', icon: Grid3x3, href: '/part-category', hasDropdown: true },
  { id: 'offers', label: 'یدکچی آف', icon: Tag, href: '/offers', hasDropdown: false },
  { id: 'special', label: 'فروش ویژه', icon: Star, href: '/special', hasDropdown: false },
  { id: 'bestsellers', label: 'پرفروش ترین ها', icon: ShoppingCart, href: '/bestsellers', hasDropdown: false },
  { id: 'guarantee', label: 'ضمانت و گارانتی', icon: Shield, href: '/guarantee', hasDropdown: false },
] as const;

export const CATEGORY_DROPDOWN = [
  { id: 'engine', label: 'قطعات موتور', href: '/part-category/engine' },
  { id: 'transmission', label: 'قطعات گیربکس', href: '/part-category/transmission' },
  { id: 'brake', label: 'قطعات ترمز', href: '/part-category/brake' },
  { id: 'suspension', label: 'سیستم تعلیق', href: '/categopart-categoryries/suspension' },
  { id: 'electrical', label: 'سیستم برق', href: '/part-category/electrical' },
  { id: 'body', label: 'قطعات بدنه', href: '/part-category/body' },
  { id: 'fluids', label: 'روغن و مایعات', href: '/part-category/fluids' },
  { id: 'accessories', label: 'لوازم جانبی', href: '/part-category/accessories' },
] as const;

export const HEADER_CONSTANTS = {
  SCROLL_THRESHOLD: 50,
  SEARCH_PLACEHOLDER: 'جستجوی قطعات، برندها، خودرو...',
  MOBILE_SEARCH_PLACEHOLDER: 'جستجو...',
} as const;