import { useState } from 'react'
import { DashboardLayout } from '../components/Layout'
import { Button, Avatar, Toggle } from '../components/ui'
import { useAuthStore, useThemeStore, ACCENT_COLORS } from '../store'
import { toast } from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const { theme, setTheme, accent, setAccent } = useThemeStore()
  const [activeSection, setActiveSection] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    mobile: '',
    bio: '',
  })
  const [notifSettings, setNotifSettings] = useState({
    post_published: true,
    post_failed: true,
    post_scheduled: true,
    campaign_approved: true,
    campaign_rejected: true,
    token_expired: true,
    email_notifs: true,
    browser_notifs: false,
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    updateUser({ name: form.name, email: form.email, company: form.company })
    toast.success('Settings saved!')
    setSaving(false)
  }

  const sections = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
  ]

  return (
    <DashboardLayout title="Settings">
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar nav */}
        <div className="card" style={{ height: 'fit-content', padding: '12px' }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
                borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: activeSection === s.id ? 'var(--bg-active)' : 'transparent',
                color: activeSection === s.id ? 'var(--color-brand-600)' : 'var(--text-secondary)',
                fontWeight: activeSection === s.id ? 700 : 500,
                fontSize: 'var(--font-size-sm)', textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeSection === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>Profile Information</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Avatar section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <Avatar name={user?.name} size="2xl" />
                  <div>
                    <Button variant="secondary" size="sm" onClick={() => toast.success('Upload photo...')}>Change Photo</Button>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 6 }}>JPG, PNG or GIF · Max 5MB</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Business Name</label>
                    <input className="form-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input type="tel" className="form-input" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="+1 555 000 0000" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." rows={3} />
                </div>

                <div>
                  <Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>Security Settings</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)', marginBottom: 16 }}>Change Password</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => (
                      <div key={i} className="form-group">
                        <label className="form-label">{label}</label>
                        <input type="password" className="form-input" placeholder="••••••••" />
                      </div>
                    ))}
                    <Button variant="primary" size="md" onClick={() => toast.success('Password updated!')}>Update Password</Button>
                  </div>
                </div>

                <hr className="divider" />

                <div>
                  <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)', marginBottom: 12 }}>Active Sessions</h4>
                  {[
                    { device: 'Chrome on macOS', ip: '192.168.1.1', time: 'Current session', current: true },
                    { device: 'Safari on iPhone', ip: '10.0.0.5', time: '2 hours ago', current: false },
                    { device: 'Firefox on Windows', ip: '172.16.0.8', time: '3 days ago', current: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{s.device}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{s.ip} · {s.time}</div>
                      </div>
                      {s.current ? (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success-600)', fontWeight: 600 }}>✓ Current</span>
                      ) : (
                        <Button variant="ghost" size="xs" onClick={() => toast.success('Session revoked!')}>Revoke</Button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <Button variant="danger" size="sm" onClick={() => toast.success('All other sessions revoked!')}>
                    Revoke All Other Sessions
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>Notification Preferences</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)', marginBottom: 16 }}>Event Notifications</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { key: 'post_published', label: 'Post published successfully', desc: 'When a scheduled post is published' },
                      { key: 'post_failed', label: 'Post publishing failed', desc: 'When a post fails to publish' },
                      { key: 'post_scheduled', label: 'Post scheduled', desc: 'When a post is successfully scheduled' },
                      { key: 'campaign_approved', label: 'Campaign approved', desc: 'When an ad campaign is approved by the platform' },
                      { key: 'campaign_rejected', label: 'Campaign rejected', desc: 'When an ad campaign is rejected' },
                      { key: 'token_expired', label: 'Account connection expired', desc: 'When a social media token needs renewal' },
                    ].map(n => (
                      <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{n.label}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{n.desc}</div>
                        </div>
                        <Toggle on={notifSettings[n.key]} onChange={() => setNotifSettings(s => ({ ...s, [n.key]: !s[n.key] }))} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)', marginBottom: 16 }}>Delivery Channels</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { key: 'email_notifs', label: 'Email notifications', desc: 'Receive notifications via email' },
                      { key: 'browser_notifs', label: 'Browser notifications', desc: 'Push notifications in your browser' },
                    ].map(n => (
                      <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{n.label}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{n.desc}</div>
                        </div>
                        <Toggle on={notifSettings[n.key]} onChange={() => setNotifSettings(s => ({ ...s, [n.key]: !s[n.key] }))} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="primary" onClick={() => toast.success('Notification preferences saved!')}>Save Preferences</Button>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>Appearance</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Theme mode */}
                <div>
                  <label className="form-label" style={{ marginBottom: 12, display: 'block' }}>Theme Mode</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {[
                      { value: 'light', label: 'Light', desc: 'Clean white background' },
                      { value: 'dark', label: 'Dark', desc: 'Easy on the eyes at night' },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        style={{
                          padding: '16px 20px', borderRadius: 'var(--radius-xl)',
                          border: `2px solid ${theme === t.value ? 'var(--color-brand-500)' : 'var(--border-primary)'}`,
                          background: theme === t.value ? 'var(--bg-active)' : 'var(--bg-secondary)',
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                          transition: 'all var(--transition-fast)',
                          display: 'flex', alignItems: 'center', gap: 14,
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 'var(--radius-lg)',
                          background: t.value === 'light' ? '#f8fafc' : '#1e293b',
                          border: '2px solid var(--border-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {t.value === 'light' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: theme === t.value ? 'var(--color-brand-600)' : 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{t.label}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{t.desc}</div>
                        </div>
                        {theme === t.value && (
                          <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: 'var(--color-brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent color */}
                <div>
                  <label className="form-label" style={{ marginBottom: 4, display: 'block' }}>Accent Color</label>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 14 }}>Changes the primary brand color across the entire application.</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {ACCENT_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setAccent(color.id)}
                        title={color.label}
                        style={{
                          width: 42, height: 42, borderRadius: 'var(--radius-lg)',
                          background: color.primary,
                          border: `3px solid ${accent === color.id ? color.dark : 'transparent'}`,
                          outline: accent === color.id ? `2px solid ${color.primary}` : 'none',
                          outlineOffset: 2,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          transform: accent === color.id ? 'scale(1.12)' : 'scale(1)',
                        }}
                      >
                        {accent === color.id && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: ACCENT_COLORS.find(c => c.id === accent)?.primary || '#7c5cfc' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {ACCENT_COLORS.find(c => c.id === accent)?.label || 'Violet'} selected
                    </span>
                  </div>
                </div>

                <Button variant="primary" onClick={() => toast.success('Appearance settings saved!')} style={{ width: 'fit-content' }}>Save Preferences</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
