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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedCity: null,
      setSelectedCity: (city) => set({ selectedCity: city }),
    }),
    {
      name: 'yadakchi-app-state',
    }
  )
);