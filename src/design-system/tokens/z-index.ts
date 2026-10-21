// src/design-system/tokens/z-index.ts
//
// هیچ z-index عددی مستقیم در کد مجاز نیست. فقط از این کلیدها.
// ترتیب قطعی (از پایین به بالا):
//   base < sticky < fixed < dropdown < overlay < modal < popover < toast
//
// دلیل: در RTL هم همین ترتیب است. اگر روزی مودالی روی Toast باز شد،
// آن باید popover باشد نه modal.

export const zIndex = {
  base:     0,
  sticky:   10,   // هدر sticky
  fixed:    20,   // bottom nav, FAB
  dropdown: 30,   // search suggestions, category dropdown
  overlay:  40,   // backdrop (پشت مودال)
  modal:    50,   // dialog, bottom sheet
  popover:  60,   // tooltip, popover روی مودال
  toast:    70,   // toast notification
  debug:    999,  // فقط dev — در prod استفاده نکن
} as const;

export type ZIndexKey = keyof typeof zIndex;