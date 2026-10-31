"use client"
import { createContext, useContext, useReducer } from 'react'
import { Action, State, dashboardReducer, initialState } from '@/lib/dashboard'
const Context = createContext<{ state: State; commit: (action: Action) => Promise<void> } | null>(null)
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  async function commit(action: Action) { await new Promise(resolve => setTimeout(resolve, 600)); dispatch(action) }
  return <Context.Provider value={{ state, commit }}>{children}</Context.Provider>
}
export function useDashboard() { const context = useContext(Context); if (!context) throw new Error('DashboardProvider requerido'); return context }
