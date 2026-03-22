import { create } from 'zustand';

type Role = 'student' | 'lecturer';

const DEV_USER_BY_ROLE: Record<Role, { id: string; email: string; name: string }> = {
  student: {
    id: 'dev-student',
    email: 'sams@student.sliit.lk',
    name: 'Dev Student',
  },
  lecturer: {
    id: 'dev-lecturer',
    email: 'lecturer@sliit.lk',
    name: 'Dev Lecturer',
  },
};

interface AuthStore {
  role: Role;
  currentUser: {
    id: string;
    email: string;
    name: string;
  };
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  role: 'student',
  currentUser: DEV_USER_BY_ROLE.student,
  setRole: (role) =>
    set({
      role,
      currentUser: DEV_USER_BY_ROLE[role],
    }),
}));
