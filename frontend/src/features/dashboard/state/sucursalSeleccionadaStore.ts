import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SucursalSeleccionadaState {
  sucursalId: number | null
  setSucursalId: (id: number | null) => void
}

export const useSucursalSeleccionadaStore = create<SucursalSeleccionadaState>()(
  persist(
    (set) => ({
      sucursalId: null,
      setSucursalId: (id) => set({ sucursalId: id }),
    }),
    { name: 'sucursal-seleccionada' }
  )
)
