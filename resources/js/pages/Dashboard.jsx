import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { Button, Avatar, Badge, StatusBadge, PlatformIcon } from '../components/ui'
import {
  MOCK_CAMPAIGNS, MOCK_ANALYTICS,
  useAuthStore, useSocialAccountsStore, usePostsStore
} from '../store'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'

function StatCard({ icon, label, value, trend, trendUp, color }) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="stat-card-icon" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && (
        <div className={`stat-card-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? '↑' : '↓'} {trend}
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}> vs last month</span>
        </div>
      )}
    </div>
  )
}

const PLATFORM_COLORS = {
  facebook: '#1877f2',
  instagram: '#e1306c',
  linkedin: '#0077b5',
}

function QuickPostPlatformCard({ account }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/posts/create?account=${account.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: 'var(--bg-card)', border: '1.5px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)', cursor: 'pointer', width: '100%',
        transition: 'all var(--transition-fast)', textAlign: 'left',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = PLATFORM_COLORS[account.platform]; e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.background = 'var(--bg-card)' }}
    >
      <PlatformIcon platform={account.platform} size={24} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{account.account_name}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{account.followers?.toLocaleString()} followers</div>
      </div>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: account.status === 'active' ? 'var(--color-success-500)' : 'var(--color-warning-500)' }} />
    </button>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '10px 14px', boxShadow: 'var(--shadow-lg)', fontSize: 'var(--font-size-xs)' }}>
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [chartRange, setChartRange] = useState('14d')

  const { accounts, fetchAccounts, fetched: accountsFetched } = useSocialAccountsStore()
  const { posts, fetchPosts, fetched: postsFetched } = usePostsStore()

  useEffect(() => {
    if (!accountsFetched) fetchAccounts()
    if (!postsFetched) fetchPosts()
  }, [accountsFetched, postsFetched, fetchAccounts, fetchPosts])

  const stats = [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, label: 'Connected Accounts', value: accounts.length, trend: '1 new', trendUp: true, color: '#7c5cfc' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>, label: 'Scheduled Posts', value: posts.filter(p => p.status === 'scheduled').length, trend: '3 this week', trendUp: true, color: '#3b82f6' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/></svg>, label: 'Published Posts', value: posts.filter(p => p.status === 'published').length, trend: '12.5%', trendUp: true, color: '#10b981' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>, label: 'Failed Posts', value: posts.filter(p => p.status === 'failed').length, color: '#ef4444' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v4m0 0h10M9 7v10a2 2 0 002 2h6a2 2 0 002-2V7M9 7H5a2 2 0 00-2 2v10a2 2 0 002 2h4"/></svg>, label: 'Active Campaigns', value: MOCK_CAMPAIGNS.filter(c => c.status === 'active').length, trend: '2 new', trendUp: true, color: '#f59e0b' },

    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, label: 'Total Impressions', value: MOCK_ANALYTICS.organic.total_impressions.toLocaleString(), trend: '24.1%', trendUp: true, color: '#ec4899' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, label: 'Avg. Engagement', value: `${MOCK_ANALYTICS.organic.engagement_rate}%`, trend: '0.5%', trendUp: true, color: '#f59e0b' },
  ]

  const recentPosts = posts.slice(0, 5)

  return (
    <DashboardLayout
      title="Dashboard"
      actions={
        <Button variant="primary" size="sm" onClick={() => navigate('/posts/create')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Create Post
        </Button>
      }
    >
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-800))',
        borderRadius: 'var(--radius-xl)', padding: '24px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'absolute', width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', top: -60, right: 80 }} />
        <div style={{ position: 'absolute', width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', bottom: -40, right: 20 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'white', fontSize: 'var(--font-size-2xl)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}

          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            You have {posts.filter(p => p.status === 'scheduled').length} posts scheduled and {MOCK_CAMPAIGNS.filter(c => c.status === 'active').length} campaigns running today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/posts/create')} style={{ background: 'white', color: 'var(--color-brand-700)', border: 'none', borderRadius: 'var(--radius-lg)', padding: '10px 20px', fontWeight: 700, fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Create Post
          </button>
          <button onClick={() => navigate('/campaigns/create')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-lg)', padding: '10px 20px', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(8px)' }}>
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts + Quick Create row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
        {/* Engagement chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Engagement Overview</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Impressions, clicks & engagement over time</p>
            </div>
            <div className="tabs">
              {['7d', '14d', '30d'].map(r => (
                <button key={r} className={`tab-btn ${chartRange === r ? 'active' : ''}`} onClick={() => setChartRange(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_ANALYTICS.chart_data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="impressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="engageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="impressions" stroke="#7c5cfc" strokeWidth={2} fill="url(#impressGrad)" name="Impressions" dot={false} />
                <Area type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} fill="url(#engageGrad)" name="Engagement" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick create */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Quick Create</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Post to a specific account</p>
            {accounts.map(acc => (
              <QuickPostPlatformCard key={acc.id} account={acc} />
            ))}
            <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/accounts')} style={{ marginTop: 4 }}>
              + Connect Account
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Posts + Campaign Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Recent Posts */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Posts</h3>
            <Link to="/posts" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-brand-600)', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ overflow: 'hidden' }}>
            {recentPosts.map((post, i) => (
              <div key={post.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 24px',
                borderTop: i > 0 ? '1px solid var(--border-secondary)' : 'none',
                transition: 'background var(--transition-fast)', cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => navigate('/posts')}
              >
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-lg)', background: `${PLATFORM_COLORS[post.platform]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <PlatformIcon platform={post.platform} size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>{post.account_name}</span>
                    <StatusBadge status={post.status} />
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    {post.content}
                  </p>
                  {post.status === 'published' && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                      {[['❤️', post.likes], ['💬', post.comments], ['🔁', post.shares]].map(([emoji, val], j) => (
                        <span key={j} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}>{emoji} {val}</span>
                      ))}
                    </div>
                  )}
                  {post.status === 'failed' && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error-500)', marginTop: 4 }}>⚠️ {post.error}</p>
                  )}
                  {(post.scheduled_at || post.published_at) && (
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {post.scheduled_at ? `📅 Scheduled: ${post.scheduled_at}` : `✓ Published: ${post.published_at}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </DashboardLayout>
  )
}
