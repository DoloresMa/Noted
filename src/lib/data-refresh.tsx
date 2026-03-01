import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

interface DataRefreshContextValue {
  version: number
  bumpVersion: () => void
}

const DataRefreshContext = createContext<DataRefreshContextValue | undefined>(undefined)

export function DataRefreshProvider({
  value,
  children,
}: {
  value: DataRefreshContextValue
  children: ReactNode
}) {
  return <DataRefreshContext.Provider value={value}>{children}</DataRefreshContext.Provider>
}

export function useDataRefresh(): DataRefreshContextValue {
  const context = useContext(DataRefreshContext)

  if (!context) {
    throw new Error('useDataRefresh must be used within DataRefreshProvider')
  }

  return context
}
