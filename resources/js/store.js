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
      setUser: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
    }),
    { name: 'socialhub-auth' }
  )
)

// ─── Theme Store ──────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
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
export const MOCK_USER = {
  id: 1,
  name: 'Alex Johnson',
  email: 'alex@socialhub.io',
  role: 'admin',
  company: 'TechBrand Inc.',
  avatar: null,
  plan: 'Pro',
}

// ─── API Data Stores ──────────────────────────────────────────────────────────
export const useSocialAccountsStore = create((set) => ({
  accounts: [],
  loading: false,
  fetched: false,
  fetchAccounts: async () => {
    set({ loading: true })
    try {
      const res = await axios.get('/api/social/accounts')
      if (res.data.success) {
        set({ accounts: res.data.accounts, fetched: true })
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      set({ loading: false })
    }
  }
}))

export const usePostsStore = create((set) => ({
  posts: [],
  loading: false,
  fetched: false,
  fetchPosts: async () => {
    set({ loading: true })
    try {
      const res = await axios.get('/api/posts?per_page=100') // fetch enough for calendar/dashboard
      if (res.data.success) {
        const items = res.data.data?.data || res.data.data || []
        set({ posts: items, fetched: true })
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      set({ loading: false })
    }
  }
}))

export const MOCK_CAMPAIGNS = [
  {
    id: 1, name: 'Spring Launch 2024', platform: 'facebook', objective: 'Brand Awareness',
    status: 'active', budget: 500, spend: 342.50, impressions: 45200, clicks: 1240, ctr: 2.74,
    start_date: '2024-03-01', end_date: '2024-03-31',
  },
  {
    id: 2, name: 'Instagram Engagement Boost', platform: 'instagram', objective: 'Engagement',
    status: 'paused', budget: 200, spend: 87.20, impressions: 18900, clicks: 643, ctr: 3.40,
    start_date: '2024-03-10', end_date: '2024-03-25',
  },
  {
    id: 3, name: 'LinkedIn Lead Gen Q1', platform: 'linkedin', objective: 'Lead Generation',
    status: 'active', budget: 800, spend: 412.00, impressions: 9800, clicks: 284, ctr: 2.90,
    start_date: '2024-02-15', end_date: '2024-03-31',
  },
  {
    id: 4, name: 'Product Demo Retargeting', platform: 'facebook', objective: 'Conversions',
    status: 'completed', budget: 300, spend: 298.40, impressions: 32100, clicks: 890, ctr: 2.77,
    start_date: '2024-02-01', end_date: '2024-02-28',
  },
]

export const MOCK_NOTIFICATIONS = [
  {
    id: 1, type: 'success', title: 'Post Published!',
    message: 'Your post on TechBrand Page was published successfully.',
    is_read: false, created_at: '2 min ago',
  },
  {
    id: 2, type: 'error', title: 'Post Failed',
    message: 'Could not publish to @techbrand_official. Token expired.',
    is_read: false, created_at: '15 min ago',
  },
  {
    id: 3, type: 'warning', title: 'Connection Expiring',
    message: 'Your LinkedIn connection will expire in 3 days. Please reconnect.',
    is_read: false, created_at: '1 hour ago',
  },
  {
    id: 4, type: 'info', title: 'Campaign Approved',
    message: 'Spring Launch 2024 campaign has been approved and is now running.',
    is_read: true, created_at: '3 hours ago',
  },
  {
    id: 5, type: 'success', title: 'Post Scheduled',
    message: 'Your Instagram post has been scheduled for March 23 at 4:00 PM.',
    is_read: true, created_at: '5 hours ago',
  },
]

export const MOCK_ANALYTICS = {
  organic: {
    total_posts: 48,
    total_likes: 3240,
    total_comments: 412,
    total_shares: 287,
    total_reach: 84200,
    total_impressions: 127400,
    engagement_rate: 4.2,
    followers_growth: 14.5,
  },
  advertising: {
    total_campaigns: 4,
    total_impressions: 106000,
    total_clicks: 3057,
    avg_ctr: 2.88,
    total_spend: 1140.10,
    avg_cpc: 0.37,
    conversions: 142,
    cost_per_conversion: 8.03,
  },
  chart_data: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    impressions: Math.floor(3000 + Math.random() * 4000),
    clicks: Math.floor(80 + Math.random() * 200),
    engagement: Math.floor(40 + Math.random() * 120),
    reach: Math.floor(2000 + Math.random() * 3000),
  })),
}

export const MOCK_USERS_ADMIN = [
  { id: 1, name: 'Alex Johnson', email: 'alex@techbrand.io', role: 'admin', status: 'active', created_at: '2024-01-10', accounts: 3 },
  { id: 2, name: 'Sarah Chen', email: 'sarah@socialhub.io', role: 'manager', status: 'active', created_at: '2024-01-15', accounts: 2 },
  { id: 3, name: 'Mike Torres', email: 'mike@medialab.com', role: 'user', status: 'active', created_at: '2024-02-01', accounts: 1 },
  { id: 4, name: 'Emma Wilson', email: 'emma@brandco.io', role: 'user', status: 'inactive', created_at: '2024-02-10', accounts: 2 },
  { id: 5, name: 'James Park', email: 'james@techbrand.io', role: 'user', status: 'active', created_at: '2024-02-20', accounts: 3 },
]
