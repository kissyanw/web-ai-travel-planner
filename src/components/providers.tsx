'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface AppState {
  currentPlanId: string | null
  setCurrentPlanId: (id: string | null) => void
}

const AppContext = createContext<AppState | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)

  return (
    <AppContext.Provider value={{ currentPlanId, setCurrentPlanId }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within a Provider')
  }
  return context
}
