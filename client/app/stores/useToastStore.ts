"use client";

import { create } from "zustand";

export type ToastType = "error" | "success" | "info";

type ToastState = {
  message: string | null;
  type: ToastType;
  visible: boolean;
};

type ToastActions = {
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
};

const AUTO_HIDE_MS = 6000;

let hideTimeout: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState & ToastActions>((set) => ({
  message: null,
  type: "error",
  visible: false,

  show: (message, type = "error") => {
    if (hideTimeout) clearTimeout(hideTimeout);
    set({ message, type, visible: true });
    hideTimeout = setTimeout(() => {
      set({ visible: false, message: null });
      hideTimeout = null;
    }, AUTO_HIDE_MS);
  },

  hide: () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = null;
    set({ visible: false, message: null });
  },
}));
