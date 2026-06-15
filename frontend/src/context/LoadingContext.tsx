import { createContext, useState, useContext, type ReactNode } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (val: boolean) => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setLoading: () => {},
})

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
