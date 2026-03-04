import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useAppAuth = create<AppAuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      userId: null,
      cpf: null,

      setAuth: (token: string, userId: string, cpf: string) => {
        set({ isAuthenticated: true, token, userId, cpf });
      },

      clearAuth: () => {
        set({ isAuthenticated: false, token: null, userId: null, cpf: null });
      },
    }),
    {
      name: 'app-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userId: state.userId,
        cpf: state.cpf,
      }),
    },
  ),
);

type AppAuthStore = {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  cpf: string | null;
  setAuth: (token: string, userId: string, cpf: string) => void;
  clearAuth: () => void;
};
