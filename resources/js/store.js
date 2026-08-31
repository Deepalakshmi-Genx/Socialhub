import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (data) => {
        set((state) => ({ user: { ...state.user, ...data } }))
      },
    }),
    { name: 'socialhub-auth' }
  )
)

// ─── Accent Colors ────────────────────────────────────────────────────────────
export const ACCENT_COLORS = [
  { id: 'violet',  label: 'Violet',  primary: '#7c5cfc', dark: '#5b3fd4' },
  { id: 'blue',    label: 'Blue',    primary: '#3b82f6', dark: '#1d4ed8' },
  { id: 'emerald', label: 'Emerald', primary: '#10b981', dark: '#047857' },
  { id: 'rose',    label: 'Rose',    primary: '#f43f5e', dark: '#be123c' },
  { id: 'amber',   label: 'Amber',   primary: '#f59e0b', dark: '#b45309' },
  { id: 'cyan',    label: 'Cyan',    primary: '#06b6d4', dark: '#0e7490' },
]

function applyAccent(colorId) {
  const color = ACCENT_COLORS.find(c => c.id === colorId) || ACCENT_COLORS[0]
  const r = document.documentElement
  r.style.setProperty('--color-brand-500', color.primary)
  r.style.setProperty('--color-brand-600', color.primary)
  r.style.setProperty('--color-brand-700', color.dark)
  r.style.setProperty('--color-brand-800', color.dark)
}

// ─── Theme Store ──────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      accent: 'violet',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          document.documentElement.setAttribute('data-theme', newTheme)
          localStorage.setItem('socialhub-theme', newTheme)
          return { theme: newTheme }
        }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('socialhub-theme', theme)
        set({ theme })
      },
      setAccent: (colorId) => {
        applyAccent(colorId)
        set({ accent: colorId })
      },
    }),
    { name: 'socialhub-theme-store' }
  )
)

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
  notificationPanelOpen: false,
  toggleNotificationPanel: () =>
    set((state) => ({ notificationPanelOpen: !state.notificationPanelOpen })),
  closeNotificationPanel: () => set({ notificationPanelOpen: false }),
}))

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = []

export const MOCK_CAMPAIGNS = []

export const MOCK_ANALYTICS = {
  chart_data: [
    { date: 'Mon', impressions: 1200, reach: 900 },
    { date: 'Tue', impressions: 2100, reach: 1600 },
    { date: 'Wed', impressions: 1800, reach: 1400 },
    { date: 'Thu', impressions: 2400, reach: 1900 },
    { date: 'Fri', impressions: 2800, reach: 2100 },
    { date: 'Sat', impressions: 3200, reach: 2400 },
    { date: 'Sun', impressions: 3600, reach: 2800 }
  ],
  organic: {
    total_posts: 125,
    total_impressions: 45200,
    total_reach: 38400,
    total_engagement: 5200,
    engagement_rate: 4.8,
    total_clicks: 1200,
    followers_growth: 3.2,
    total_likes: 3400,
    total_comments: 850,
    total_shares: 420
  },
  advertising: {
    total_spend: 1250.50,
    total_impressions: 125000,
    total_reach: 85000,
    total_clicks: 4500,
    avg_ctr: 3.6,
    conversions: 125,
    cpa: 10.00,
    roas: 2.4
  },
}

export const MOCK_USER = {
  id: 1,
  name: 'Deepa Administrator',
  email: 'admin@socialhub.com',
  role: 'admin',
  company: 'Acme Corp',
}

export const MOCK_USERS_ADMIN = [
  { id: 1, name: 'Deepa', email: 'admin@socialhub.com', role: 'admin', status: 'active', last_login: '2 mins ago' },
]

// ─── Data Stores ──────────────────────────────────────────────────────────────
export const useSocialAccountsStore = create((set) => ({
  accounts: [],
  fetched: false,
  fetchAccounts: async () => {
    try {
      const res = await axios.get('/api/social/accounts')
      const accounts = res.data.accounts || (Array.isArray(res.data) ? res.data : (res.data.data?.data || res.data.data || []))
      set({ accounts, fetched: true })
    } catch (e) {
      console.error('Failed to fetch accounts', e)
      set({ accounts: [], fetched: true })
    }
  }
}))

export const usePostsStore = create((set) => ({
  posts: [],
  fetched: false,
  fetchPosts: async () => {
    try {
      const res = await axios.get('/api/posts')
      const posts = Array.isArray(res.data) ? res.data : (res.data.data?.data || res.data.data || [])
      set({ posts, fetched: true })
    } catch (e) {
      console.error('Failed to fetch posts', e)
      set({ posts: [], fetched: true })
    }
  }
}))
