import { create } from 'zustand'

interface User {
  user_id: number
  full_name: string
  role: string
  token: string
}

interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: (() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })(),
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    set({ user: null })
  },
}))