import { create } from 'zustand';
import type { UserRole } from '@/lib/navigation';

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => {
  // Read persisted role from localStorage safely in browser
  let initialRole: UserRole = 'manager';
  let initialSidebar = false;

  if (typeof window !== 'undefined') {
    const savedRole = localStorage.getItem('hro:demo-role');
    if (savedRole === 'manager' || savedRole === 'hr') {
      initialRole = savedRole;
    }
    const savedSidebar = localStorage.getItem('hro:sidebar-collapsed');
    if (savedSidebar !== null) {
      initialSidebar = savedSidebar === 'true';
    }
  }

  return {
    sidebarCollapsed: initialSidebar,
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
    role: initialRole,
    setRole: (role) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hro:demo-role', role);
      }
      set({ role });
    },
    commandPaletteOpen: false,
    setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  };
});
