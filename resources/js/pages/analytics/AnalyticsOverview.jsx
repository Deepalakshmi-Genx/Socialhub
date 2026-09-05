import { useState, useEffect } from 'react'
import axios from 'axios'
import { DashboardLayout } from '../../components/Layout'
import { Tabs, PlatformIcon } from '../../components/ui'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'

const COLORS = ['#7c5cfc', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: '10px 14px', boxShadow: 'var(--shadow-lg)', fontSize: 'var(--font-size-xs)' }}>
      <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' && p.value > 100 ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  )
}

function MetricCard({ label, value, sub, trend, icon, color = '#7c5cfc' }) {
  return (
    <div 
      className="stat-card animate-slide-up"
      style={{
        borderTop: `4.5px solid ${color}`,
        borderLeft: '1px solid var(--border-primary)',
        borderRight: '1px solid var(--border-primary)',
        borderBottom: '1px solid var(--border-primary)',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        padding: '20px 22px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {icon && <div style={{ fontSize: 18, color: color }}>{icon}</div>}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
        {value !== undefined ? value : '-'}
      </div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: 6, fontWeight: 500 }}>{sub}</div>}
      {trend && (
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: 8, fontWeight: 500 }}>
          <span style={{ color: trend.up ? 'var(--color-success-500)' : 'var(--color-error-500)', fontWeight: 700 }}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
          <span> vs last period</span>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsOverview() {
  const [tab, setTab] = useState('organic')
  const [range, setRange] = useState('14d')
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    organic: {},
    advertising: {},
    chart_data: []
  })

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/analytics/overview?range=${range.replace('d', '')}`)
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [range])

  const { organic, advertising, chart_data } = data

  const platformPieData = [
    { name: 'Facebook', value: 45 },
    { name: 'Instagram', value: 35 },
    { name: 'LinkedIn', value: 20 },
  ]

  return (
    <DashboardLayout title="Analytics">
      {/* Tab + Range */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Tabs
          tabs={[
            { value: 'organic', label: 'Organic Content' },
            { value: 'advertising', label: 'Advertising' },
          ]}
          activeTab={tab}
          onTabChange={setTab}
        />
        <div className="tabs">
          {['7d', '14d', '30d', '90d'].map(r => (
            <button key={r} className={`tab-btn ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Organic Analytics */}
      {tab === 'organic' && (
        <>
          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <MetricCard label="Posts Published" value={organic.total_posts} trend={{ up: true, value: '12%' }} color="#7c5cfc" />
            <MetricCard label="Total Reach" value={organic.total_reach?.toLocaleString()} trend={{ up: true, value: '18%' }} color="#3b82f6" />
            <MetricCard label="Total Impressions" value={organic.total_impressions?.toLocaleString()} trend={{ up: true, value: '24%' }} color="#10b981" />
            <MetricCard label="Engagement Rate" value={organic.engagement_rate !== undefined ? `${organic.engagement_rate}%` : undefined} trend={{ up: true, value: '0.5%' }} color="#f59e0b" />
            <MetricCard label="Total Likes" value={organic.total_likes?.toLocaleString()} color="#ec4899" />
            <MetricCard label="Total Comments" value={organic.total_comments?.toLocaleString()} color="#06b6d4" />
            <MetricCard label="Total Shares" value={organic.total_shares?.toLocaleString()} color="#8b5cf6" />
            <MetricCard label="Followers Growth" value={organic.followers_growth !== undefined ? `+${organic.followers_growth}%` : undefined} trend={{ up: true, value: '2.1%' }} color="#10b981" />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Impressions & Reach */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>Impressions & Reach</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Daily trend over selected period</p>
                </div>
              </div>
              <div className="card-body" style={{ paddingTop: 8 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chart_data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.3}/><stop offset="95%" stopColor="#7c5cfc" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="impressions" stroke="#7c5cfc" strokeWidth={2} fill="url(#grad1)" name="Impressions" dot={false} />
                    <Area type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={2} fill="url(#grad2)" name="Reach" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform breakdown pie */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>Platform Split</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={platformPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {platformPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  {platformPieData.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Engagement bar chart */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>Daily Engagement</h3>
            </div>
            <div className="card-body" style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chart_data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="engagement" fill="#7c5cfc" radius={[4, 4, 0, 0]} name="Engagement" />
                  <Bar dataKey="clicks" fill="#10b981" radius={[4, 4, 0, 0]} name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Advertising Analytics */}
      {tab === 'advertising' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <MetricCard label="Total Spend" value={advertising.total_spend !== undefined ? `$${advertising.total_spend.toFixed(0)}` : undefined} trend={{ up: false, value: '8%' }} color="#7c5cfc" />
            <MetricCard label="Impressions" value={advertising.total_impressions?.toLocaleString()} trend={{ up: true, value: '31%' }} color="#10b981" />
            <MetricCard label="Total Clicks" value={advertising.total_clicks?.toLocaleString()} trend={{ up: true, value: '15%' }} color="#3b82f6" />
            <MetricCard label="Avg CTR" value={advertising.avg_ctr !== undefined ? `${advertising.avg_ctr}%` : undefined} trend={{ up: true, value: '0.3%' }} color="#f59e0b" />
            <MetricCard label="Avg CPC" value={advertising.cpa !== undefined ? `$${advertising.cpa}` : undefined} sub="Cost per click" color="#ec4899" />
            <MetricCard label="Conversions" value={advertising.conversions} trend={{ up: true, value: '22%' }} color="#06b6d4" />
            <MetricCard label="Cost/Conversion" value={advertising.cpa !== undefined ? `$${advertising.cpa}` : undefined} trend={{ up: false, value: '5%' }} color="#8b5cf6" />
            <MetricCard label="Active Campaigns" value={4} color="#10b981" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>Spend & Clicks Over Time</h3>
              </div>
              <div className="card-body" style={{ paddingTop: 8 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chart_data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-tertiary)' }} />
                    <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#7c5cfc" strokeWidth={2} dot={false} name="Clicks" />
                    <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#f59e0b" strokeWidth={2} dot={false} name="Spend ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>Spend by Platform</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { platform: 'facebook', spend: 342.50, budget: 500 },
                  { platform: 'linkedin', spend: 412.00, budget: 800 },
                  { platform: 'instagram', spend: 87.20, budget: 200 },
                ].map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlatformIcon platform={p.platform} size={16} />
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{p.platform}</span>
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${p.spend.toFixed(0)} / ${p.budget}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(p.spend / p.budget) * 100}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
