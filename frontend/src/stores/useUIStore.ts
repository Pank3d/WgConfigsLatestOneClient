import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIStore {
  toasts: Toast[];
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;

  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: (id: string) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  isModalOpen: false,
  modalContent: null,

  showToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // Auto-hide после 3 секунд
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  hideToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (content) =>
    set({
      isModalOpen: true,
      modalContent: content,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      modalContent: null,
    }),
}));
