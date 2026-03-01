import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
  confirm: () => void;
}

export const useConfirm = create<ConfirmState>((set, get) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,

  openConfirm: (title, message, onConfirm) => {
    set({ isOpen: true, title, message, onConfirm });
  },

  closeConfirm: () => {
    set({ isOpen: false, title: '', message: '', onConfirm: null });
  },

  confirm: () => {
    const { onConfirm } = get();
    if (onConfirm) {
      onConfirm();
    }
    get().closeConfirm();
  },
}));
