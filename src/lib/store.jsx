import { create } from 'zustand'

export const useStore = create((set) => ({
  content: "",
  setContent: (content) => set({ content }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  url: "",
  setUrl: (url) => set({ url }),

  fontFamily: "serif",
  setFontFamily: (fontFamily) => set({ fontFamily }),

  fontSize: 18,
  setFontSize: (newFontSize) => set({ fontSize: newFontSize }),

  readingTime: 0,
  setReadingTime: (readingTime) => set({ readingTime }),

  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));
