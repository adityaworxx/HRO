import { create } from 'zustand';
import type { UserRole } from '@/lib/navigation';

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  initFromStorage: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hro:sidebar-collapsed', String(next));
      }
      return { sidebarCollapsed: next };
    }),
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hro:sidebar-collapsed', String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  role: 'manager',
  setRole: (role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hro:demo-role', role);
    }
    set({ role });
  },
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    const savedRole = localStorage.getItem('hro:demo-role');
    const savedSidebar = localStorage.getItem('hro:sidebar-collapsed');
    set({
      role: savedRole === 'manager' || savedRole === 'hr' ? savedRole : 'manager',
      sidebarCollapsed: savedSidebar === 'true',
    });
  },
}));
