import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuthStore, formatUserName } from '../../store'
import { Button, PlatformIcon } from '../../components/ui'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', form)
      if (res.data.success) {
        const formattedName = formatUserName(res.data.user || { email: form.email })
        setUser({ ...res.data.user, name: formattedName }, res.data.token)
        toast.success(`Welcome back, ${formattedName}!`)
        navigate('/dashboard')
      } else {
        toast.error(res.data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      // Fallback for demo login if backend user is not seeded
      const formattedName = formatUserName({ email: form.email })
      setUser({ id: 1, name: formattedName, email: form.email, role: 'admin', company: 'SocialHub' }, 'demo-token')
      toast.success(`Welcome back, ${formattedName}!`)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSSOLogin = (provider) => {
    setLoading(true)
    if (provider === 'Google') {
      window.location.href = '/api/auth/google'
    } else {
      toast.error(`${provider} login is not configured yet.`)
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* Left sidebar */}
      <div className="auth-sidebar">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/genx_logo.png" alt="GenX Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em' }}>GenX SocialHub</span>
          </div>
          <h2 style={{ color: 'white', fontSize: 32, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: 16 }}>
            Manage all your social media in one place
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            Schedule posts, run ads, and track performance across Facebook, Instagram, and LinkedIn — all from a single dashboard.
          </p>

          {/* Feature list */}
          {[
            'Schedule posts to all platforms',
            'Manage Facebook, Instagram & LinkedIn ads',
            'Analytics & performance reports',
            'Team collaboration tools',
          ].map((feat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, color: 'rgba(255,255,255,0.9)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <span style={{ fontSize: 14 }}>{feat}</span>
            </div>
          ))}
        </div>


      </div>

      {/* Right main */}
      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-card-title">Welcome back</h1>
            <p className="auth-card-subtitle">Sign in to your SocialHub account</p>
          </div>

          {/* SSO Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <button className="sso-btn" onClick={() => handleSSOLogin('Google')}>
              <PlatformIcon platform="google" size={20} />
              Continue with Google
            </button>
          </div>

          <div className="auth-divider">or</div>

          {/* Email form */}
          <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-brand-600)', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input has-icon-left has-icon-right"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(s => !s)}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create account</Link>
          </div>

          {/* Demo credentials hint */}
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Demo: Enter any email & password to log in
          </div>
        </div>
      </div>
    </div>
  )
}
