import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuthStore } from '../../store'
import { Button, PlatformIcon } from '../../components/ui'

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [step, setStep] = useState(1) // 1=form, 2=verify email
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', company: '',
    password: '', confirmPassword: '', terms: false,
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (!form.mobile || form.mobile.length < 7) e.mobile = 'Valid phone required'
    if (!form.company.trim()) e.company = 'Company name is required'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.terms) e.terms = 'Please accept the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        company: form.company,
        password: form.password,
        password_confirmation: form.confirmPassword,
        terms: form.terms
      })
      if (res.data.success) {
        setStep(2)
      } else {
        toast.error(res.data.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Registration failed. Check your details.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = () => {
    // Usually, verification is done via a link sent to email.
    // For local testing, we can just redirect to login so they can log in if they manually verified or don't require verification locally.
    toast.success('Please check your email for the verification link.')
    navigate('/login')
  }

  const F = ({ id, label, type = 'text', placeholder, hint }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label} <span className="form-label-required">*</span>
      </label>
      <input
        id={id}
        type={type}
        className={`form-input ${errors[id] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      />
      {errors[id] && <span className="form-error">{errors[id]}</span>}
      {hint && !errors[id] && <span className="form-hint">{hint}</span>}
    </div>
  )

  if (step === 2) {
    return (
      <div className="auth-layout">
        <div className="auth-sidebar" />
        <div className="auth-main">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: 'var(--color-success-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-600)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className="auth-card-title" style={{ textAlign: 'center' }}>Check your email</h1>
            <p className="auth-card-subtitle" style={{ textAlign: 'center', margin: '8px 0 32px' }}>
              We sent a verification link to <strong>{form.email}</strong>. Click the link to activate your account.
            </p>
            <Button variant="primary" size="lg" fullWidth loading={loading} onClick={handleVerify}>
              I've Verified My Email
            </Button>
            <p className="auth-footer" style={{ marginTop: 16 }}>
              Didn't receive it? <button style={{ background: 'none', border: 'none', color: 'var(--color-brand-600)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>Resend email</button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <div className="auth-sidebar">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/genx_logo.png" alt="GenX Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em' }}>GenX SocialHub</span>
          </div>
          <h2 style={{ color: 'white', fontSize: 30, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: 16 }}>
            Start managing your social media smarter
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7 }}>
            Join thousands of marketers and businesses who use SocialHub to grow their social presence.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 40 }}>
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500K+', label: 'Posts Published' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '3 min', label: 'Avg. Setup Time' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div style={{ color: 'white', fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em' }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-card-title">Create your account</h1>
            <p className="auth-card-subtitle">Get started with SocialHub for free</p>
          </div>

          {/* Google SSO */}
          <button type="button" className="sso-btn" onClick={() => window.location.href = '/api/auth/google'} style={{ marginBottom: 20 }}>
            <PlatformIcon platform="google" size={20} />
            Sign up with Google
          </button>

          <div className="auth-divider">or sign up with email</div>

          <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <F id="name" label="Full Name" placeholder="Alex Johnson" />
              <F id="company" label="Company Name" placeholder="TechBrand Inc." />
            </div>
            <F id="email" label="Email Address" type="email" placeholder="you@company.com" />
            <F id="mobile" label="Mobile Number" type="tel" placeholder="+1 555 000 0000" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <F id="password" label="Password" type="password" placeholder="min. 8 characters" hint="At least 8 characters" />
              <F id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" />
            </div>

            <div>
              <label className="form-check" style={{ alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={form.terms}
                  onChange={e => setForm(f => ({ ...f, terms: e.target.checked }))}
                />
                <span className="form-check-label">
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" style={{ color: 'var(--color-brand-600)', fontWeight: 600 }}>Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <span className="form-error" style={{ marginTop: 4 }}>{errors.terms}</span>}
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
