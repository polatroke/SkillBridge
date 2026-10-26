import { createContext, useContext } from 'react'

interface MobileNavState {
  /** Menu lateral aberto (só tem efeito abaixo de `lg`; no desktop a sidebar fica sempre visível). */
  open: boolean
  setOpen: (open: boolean) => void
}

export const MobileNavContext = createContext<MobileNavState>({ open: false, setOpen: () => {} })

export function useMobileNav() {
  return useContext(MobileNavContext)
}
