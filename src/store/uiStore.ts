import { create } from 'zustand';

interface UIState {
  showCreateModal: boolean;
  showExportModal: boolean;
  activePanel: 'layers' | 'properties';
  searchQuery: string;
  fileFilter: 'all' | 'recent' | 'favorites';
  toasts: Toast[];
  setShowCreateModal: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setActivePanel: (panel: 'layers' | 'properties') => void;
  setSearchQuery: (query: string) => void;
  setFileFilter: (filter: 'all' | 'recent' | 'favorites') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useUIStore = create<UIState>((set, get) => ({
  showCreateModal: false,
  showExportModal: false,
  activePanel: 'layers',
  searchQuery: '',
  fileFilter: 'all',
  toasts: [],

  setShowCreateModal: (show) => set({ showCreateModal: show }),
  setShowExportModal: (show) => set({ showExportModal: show }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFileFilter: (filter) => set({ fileFilter: filter }),

  addToast: (toast) => {
    const id = generateId();
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration || 3000);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
