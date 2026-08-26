import { create } from 'zustand'

interface NewVenueDialogState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useNewVenueDialogStore = create<NewVenueDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
