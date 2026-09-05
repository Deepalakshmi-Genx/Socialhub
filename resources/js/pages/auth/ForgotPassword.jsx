import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Button } from '../../components/ui'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendLink = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { toast.error('Enter a valid email address'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Reset link sent to ' + email)
    setStep(2)
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Password reset successfully!')
    setStep(3)
    setLoading(false)
  }

  return (
    <div className="auth-layout">
      <div className="auth-sidebar">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/genx_logo.png" alt="GenX Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ color: 'white', fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em' }}>GenX SocialHub</span>
          </div>
          <h2 style={{ color: 'white', fontSize: 30, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.04em', marginTop: 48 }}>
            Don&apos;t worry, we&apos;ve got you covered
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7, marginTop: 12 }}>
            Password recovery is quick and easy. We&apos;ll help you get back into your account in minutes.
          </p>

          {/* Steps */}
          <div style={{ marginTop: 48 }}>
            {['Enter your email', 'Check your inbox', 'Create new password'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: step > i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step > i ? 'var(--color-brand-700)' : 'white',
                  fontWeight: 700, fontSize: 14,
                }}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span style={{ color: step === i + 1 ? 'white' : 'rgba(255,255,255,0.65)', fontSize: 15, fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          {step === 1 && (
            <>
              <div className="auth-card-header">
                <h1 className="auth-card-title">Reset your password</h1>
                <p className="auth-card-subtitle">Enter your email and we&apos;ll send you a reset link</p>
              </div>
              <form className="auth-form" onSubmit={handleSendLink}>
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
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 72, height: 72, background: 'var(--color-brand-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-600)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <h1 className="auth-card-title">Check your inbox</h1>
                <p className="auth-card-subtitle" style={{ marginTop: 8 }}>
                  We sent a reset link to <strong>{email}</strong>
                </p>
              </div>
              <Button variant="primary" size="lg" fullWidth onClick={() => setStep(3)}>
                I clicked the link → Reset Password
              </Button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Didn&apos;t receive it?{' '}
                <button style={{ background: 'none', border: 'none', color: 'var(--color-brand-600)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                  onClick={() => toast.success('Reset link resent!')}>
                  Resend
                </button>
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div className="auth-card-header">
                <h1 className="auth-card-title">Create new password</h1>
                <p className="auth-card-subtitle">Choose a strong password for your account</p>
              </div>
              <form className="auth-form" onSubmit={handleReset}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <span className="form-hint">At least 8 characters with a mix of letters & numbers</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Reset Password
                </Button>
              </form>
            </>
          )}

          {step !== 2 && (
            <div className="auth-footer">
              <Link to="/login">← Back to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
