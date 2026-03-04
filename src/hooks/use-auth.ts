import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type DecodedToken, decodeToken } from '@/config/token';

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,

      setAuth: (token: string) => {
        const user = decodeToken(token);
        if (!user) return;

        set({
          isAuthenticated: true,
          user,
          token,
        });
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

type AuthStore = {
  isAuthenticated: boolean;
  user: DecodedToken | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
};
