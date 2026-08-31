import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import SSOCallback from './pages/auth/SSOCallback'

// App pages
import Dashboard from './pages/Dashboard'
import ConnectedAccounts from './pages/accounts/ConnectedAccounts'
import CreatePost from './pages/content/CreatePost'
import PostsList from './pages/content/PostsList'
import Calendar from './pages/content/Calendar'
import MediaLibrary from './pages/media/MediaLibrary'
import Campaigns from './pages/ads/Campaigns'
import CreateCampaign from './pages/ads/CreateCampaign'
import AnalyticsOverview from './pages/analytics/AnalyticsOverview'
import AdminPanel from './pages/admin/AdminPanel'
import Settings from './pages/Settings'

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// ─── Public Route (redirect if logged in) ─────────────────────────────────────
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

// ─── Admin Route ──────────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/auth/sso" element={<PublicRoute><SSOCallback /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute><ConnectedAccounts /></ProtectedRoute>} />

      <Route path="/posts" element={<ProtectedRoute><PostsList /></ProtectedRoute>} />
      <Route path="/posts/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      <Route path="/posts/edit/:id" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />

      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />

      <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/campaigns/create" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />

      <Route path="/analytics" element={<ProtectedRoute><AnalyticsOverview /></ProtectedRoute>} />

      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'var(--bg-secondary)' }}>
          <div style={{ fontSize: 72 }}>🔍</div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>404 — Page Not Found</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-md)' }}>The page you're looking for doesn't exist.</p>
          <a href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))', color: 'white', padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 8 }}>
            ← Back to Dashboard
          </a>
        </div>
      } />
    </Routes>
  )
}
