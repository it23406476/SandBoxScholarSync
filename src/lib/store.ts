import { create } from 'zustand';

type Role = 'student' | 'lecturer';

interface AuthStore {
  role: Role;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  role: 'student',
  setRole: (role) => set({ role }),
}));
