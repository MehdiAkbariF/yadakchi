'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SelectedCity {
  id: string;
  name: string;
}

interface AppState {
  selectedCity: SelectedCity | null;
  setSelectedCity: (city: SelectedCity | null) => void;
  isHeaderMinimized: boolean;
  setIsHeaderMinimized: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCity: null,
      setSelectedCity: (city) => set({ selectedCity: city }),
      isHeaderMinimized: false,
      setIsHeaderMinimized: (val) => set({ isHeaderMinimized: val }),
    }),
    {
      name: 'yadakchi-app-state',
      partialize: (state) => ({ selectedCity: state.selectedCity }),
    }
  )
);