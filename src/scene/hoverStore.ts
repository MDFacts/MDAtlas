import { create } from 'zustand'

export interface HoverPoint {
  x: number
  y: number
  z: number
}

interface HoverStore {
  /** Name shown in the floating chip, or null when nothing is hovered. */
  label: string | null
  point: HoverPoint | null
  /** Which structure kind set the hover — lets a later source override cleanly. */
  source: string | null
  setHover: (label: string, point: HoverPoint, source: string) => void
  clearHover: (source: string) => void
}

/** Transient hover state for the 3D scene, isolated from the app store so the
 * hover chip re-renders without churning the whole UI. */
export const useHoverStore = create<HoverStore>((set, get) => ({
  label: null,
  point: null,
  source: null,
  setHover: (label, point, source) => set({ label, point, source }),
  // Only clear if the caller owns the current hover — avoids one structure
  // wiping another's label as the pointer moves between them.
  clearHover: (source) => {
    if (get().source === source) {
      set({ label: null, point: null, source: null })
    }
  },
}))
