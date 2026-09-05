import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/Layout'
import { Button, Avatar, Badge, Tabs } from '../../components/ui'
import { useAdminStore } from '../../store'
import { toast } from 'react-hot-toast'

const SYSTEM_LOGS = [
  { id: 1, user: 'alex@techbrand.io', action: 'post.publish', module: 'Content', status: 'success', ip: '192.168.1.1', time: '2024-03-15 10:02' },
  { id: 2, user: 'sarah@socialhub.io', action: 'campaign.create', module: 'Advertising', status: 'success', ip: '10.0.0.2', time: '2024-03-15 09:45' },
  { id: 3, user: 'mike@medialab.com', action: 'account.connect', module: 'Accounts', status: 'success', ip: '172.16.0.5', time: '2024-03-15 09:30' },
  { id: 4, user: 'emma@brandco.io', action: 'post.schedule', module: 'Content', status: 'success', ip: '10.0.0.8', time: '2024-03-15 09:12' },
  { id: 5, user: 'alex@techbrand.io', action: 'token.refresh', module: 'OAuth', status: 'failed', ip: '192.168.1.1', time: '2024-03-15 09:00' },
  { id: 6, user: 'james@techbrand.io', action: 'media.upload', module: 'Media', status: 'success', ip: '192.168.1.10', time: '2024-03-14 18:45' },
  { id: 7, user: 'sarah@socialhub.io', action: 'campaign.pause', module: 'Advertising', status: 'success', ip: '10.0.0.2', time: '2024-03-14 16:20' },
]

const API_ERRORS = [
  { id: 1, platform: 'facebook', error: 'OAuthException', code: 190, message: 'Access token has expired', post_id: 4, time: '2024-03-14 09:00' },
  { id: 2, platform: 'instagram', error: 'IGApiError', code: 400, message: 'Invalid image format', post_id: null, time: '2024-03-13 14:30' },
  { id: 3, platform: 'linkedin', error: 'LinkedInException', code: 401, message: 'Unauthorized: Token revoked', post_id: null, time: '2024-03-12 11:15' },
]

function UserRow({ user, onToggle }) {
  const roleColors = { admin: 'brand', manager: 'info', user: 'neutral' }
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user.name} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td><Badge variant={roleColors[user.role]}>{user.role}</Badge></td>
      <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{user.accounts}</td>
      <td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-xs)', fontWeight: 600,
          background: user.status === 'active' ? 'var(--color-success-50)' : 'var(--bg-tertiary)',
          color: user.status === 'active' ? 'var(--color-success-600)' : 'var(--text-tertiary)',
        }}>
          {user.status === 'active' ? '●' : '○'} {user.status}
        </span>
      </td>
      <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>{user.created_at}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="ghost" size="xs" onClick={() => toast.success('Editing user...')}>Edit</Button>
          <Button variant={user.status === 'active' ? 'danger' : 'success'} size="xs" onClick={() => onToggle(user)}>
            {user.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')
  const { users, fetchUsers, fetched } = useAdminStore()
  
  useEffect(() => {
    if (!fetched) fetchUsers()
  }, [fetched])

  const toggleUser = (user) => {
    // Optimistic UI or call API (mocked for now, assuming AdminController implements toggle)
    toast.success(`${user.name} action triggered (API call pending).`)
  }

  const systemStats = [
    { label: 'Total Users', value: users.length, color: '#7c5cfc' },
    { label: 'Active Users', value: users.filter(u => u.status === 'active').length, color: '#10b981' },
    { label: 'API Errors (24h)', value: API_ERRORS.length, color: '#f59e0b' },
    { label: 'Posts Today', value: 18, color: '#3b82f6' },
    { label: 'Campaigns Active', value: 2, color: '#ec4899' },
    { label: 'Scheduled Posts', value: 7, color: '#6366f1' },
  ]

  return (
    <DashboardLayout title="Admin Panel">
      {/* Admin notice */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))', borderRadius: 'var(--radius-xl)', padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 'var(--font-size-md)' }}>Admin Dashboard</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-xs)' }}>You have administrator access. Handle user management and system settings here.</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: users.length, color: '#7c5cfc' },
          { label: 'Active Users', value: users.filter(u => u.status === 'active').length, color: '#10b981' },
          { label: 'API Errors (24h)', value: API_ERRORS.length, color: '#ef4444' },
          { label: 'System Logs', value: SYSTEM_LOGS.length, color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{
            borderTop: `4.5px solid ${s.color}`,
            borderLeft: '1px solid var(--border-primary)',
            borderRight: '1px solid var(--border-primary)',
            borderBottom: '1px solid var(--border-primary)',
            borderRadius: '16px',
            background: 'var(--bg-card)',
            padding: '16px 20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>{s.value}</div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[
          { value: 'users', label: 'User Management' },
          { value: 'logs', label: 'System Logs' },
          { value: 'api', label: 'API Errors' },
          { value: 'settings', label: 'Settings' },
        ].map(t => (
          <button key={t.value} className={`tab-btn ${activeTab === t.value ? 'active' : ''}`} onClick={() => setActiveTab(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>User Management</h3>
            <Button variant="primary" size="sm" onClick={() => toast.success('Invite user modal...')}>Invite User</Button>
          </div>
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Accounts</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => <UserRow key={user.id} user={user} onToggle={toggleUser} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs tab */}
      {activeTab === 'logs' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>Audit Logs</h3>
            <Button variant="secondary" size="sm" onClick={() => toast.success('Exporting logs...')}>Export CSV</Button>
          </div>
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Status</th>
                  <th>IP</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {SYSTEM_LOGS.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{log.user}</td>
                    <td><code style={{ fontSize: 11, background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-primary)' }}>{log.action}</code></td>
                    <td><Badge variant="neutral">{log.module}</Badge></td>
                    <td><Badge variant={log.status === 'success' ? 'success' : 'error'}>{log.status}</Badge></td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{log.ip}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Errors tab */}
      {activeTab === 'api' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>API Errors</h3>
            <Badge variant="error">{API_ERRORS.length} errors</Badge>
          </div>
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Error Type</th>
                  <th>Code</th>
                  <th>Message</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {API_ERRORS.map(err => (
                  <tr key={err.id}>
                    <td style={{ textTransform: 'capitalize' }}>
                      <Badge variant={`${err.platform}`}>{err.platform}</Badge>
                    </td>
                    <td><code style={{ fontSize: 11, background: 'var(--color-error-50)', color: 'var(--color-error-600)', padding: '2px 6px', borderRadius: 4 }}>{err.error}</code></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{err.code}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{err.message}</td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{err.time}</td>
                    <td>
                      <Button variant="ghost" size="xs" onClick={() => toast.success('Viewing error details...')}>Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>System Settings</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'Application Name', value: 'SocialHub', type: 'text' },
              { label: 'Support Email', value: 'support@socialhub.io', type: 'email' },
              { label: 'Max Accounts Per User', value: '10', type: 'number' },
              { label: 'Post Scheduler Interval (minutes)', value: '5', type: 'number' },
              { label: 'Default Timezone', value: 'UTC', type: 'select', options: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata'] },
              { label: 'Analytics Sync Interval (hours)', value: '6', type: 'number' },
            ].map((s, i) => (
              <div key={i} className="form-group">
                <label className="form-label">{s.label}</label>
                {s.type === 'select' ? (
                  <select className="form-select" defaultValue={s.value}>
                    {s.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="form-input" type={s.type} defaultValue={s.value} />
                )}
              </div>
            ))}
            <Button variant="primary" size="md" onClick={() => toast.success('Settings saved!')}>Save Settings</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
