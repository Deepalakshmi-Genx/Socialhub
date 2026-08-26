import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { DashboardLayout } from '../../components/Layout'
import { Button, PlatformIcon, StatusBadge, Tabs } from '../../components/ui'
import { MOCK_CAMPAIGNS } from '../../store'

const PLATFORM_COLORS = { facebook: '#1877f2', instagram: '#e1306c', linkedin: '#0077b5' }

function CampaignCard({ campaign, onPause, onResume, onDuplicate }) {
  const pct = Math.min(100, (campaign.spend / campaign.budget) * 100)

  return (
    <div className="card animate-slide-up" style={{ padding: 0 }}>
      <div style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: `${PLATFORM_COLORS[campaign.platform]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlatformIcon platform={campaign.platform} size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{campaign.name}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                {campaign.objective} · {campaign.start_date} – {campaign.end_date}
              </div>
            </div>
          </div>
          <StatusBadge status={campaign.status} />
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[
            { label: 'Budget', value: `$${campaign.budget}` },
            { label: 'Spent', value: `$${campaign.spend.toFixed(0)}` },
            { label: 'Impressions', value: campaign.impressions.toLocaleString() },
            { label: 'Clicks', value: campaign.clicks.toLocaleString() },
            { label: 'CTR', value: `${campaign.ctr}%` },
          ].map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Budget progress */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Budget used</span>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: pct > 90 ? 'var(--color-error-500)' : 'var(--text-primary)' }}>
              ${campaign.spend.toFixed(0)} / ${campaign.budget} ({pct.toFixed(0)}%)
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${pct}%`,
                background: pct > 90 ? 'var(--color-error-500)' : pct > 70 ? 'var(--color-warning-500)' : 'var(--color-brand-500)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 24px', borderTop: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="ghost" size="sm" onClick={() => onDuplicate(campaign)}>Duplicate</Button>
        {campaign.status === 'active' && (
          <Button variant="secondary" size="sm" onClick={() => onPause(campaign)}>⏸ Pause</Button>
        )}
        {campaign.status === 'paused' && (
          <Button variant="success" size="sm" onClick={() => onResume(campaign)}>▶ Resume</Button>
        )}
        <Button variant="primary" size="sm" onClick={() => toast.success('Opening campaign analytics...')}>
          View Analytics
        </Button>
      </div>
    </div>
  )
}

export default function Campaigns() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS)
  const [activeTab, setActiveTab] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')

  const tabs = [
    { value: 'all', label: 'All', count: campaigns.length },
    { value: 'active', label: 'Active', count: campaigns.filter(c => c.status === 'active').length },
    { value: 'paused', label: 'Paused', count: campaigns.filter(c => c.status === 'paused').length },
    { value: 'completed', label: 'Completed', count: campaigns.filter(c => c.status === 'completed').length },
  ]

  const filtered = campaigns.filter(c =>
    (activeTab === 'all' || c.status === activeTab) &&
    (platformFilter === 'all' || c.platform === platformFilter)
  )

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)

  const handlePause = (c) => {
    setCampaigns(cs => cs.map(x => x.id === c.id ? { ...x, status: 'paused' } : x))
    toast.success(`"${c.name}" paused.`)
  }

  const handleResume = (c) => {
    setCampaigns(cs => cs.map(x => x.id === c.id ? { ...x, status: 'active' } : x))
    toast.success(`"${c.name}" resumed.`)
  }

  const handleDuplicate = (c) => {
    const dup = { ...c, id: Date.now(), name: `${c.name} (Copy)`, status: 'paused', spend: 0 }
    setCampaigns(cs => [dup, ...cs])
    toast.success(`Campaign duplicated!`)
  }

  return (
    <DashboardLayout
      title="Campaigns"
      actions={
        <Button variant="primary" size="sm" onClick={() => navigate('/campaigns/create')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Campaign
        </Button>
      }
    >
      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Campaigns', value: campaigns.length, icon: '📊', color: 'var(--color-brand-500)' },
          { label: 'Total Spend', value: `$${totalSpend.toFixed(0)}`, icon: '💵', color: 'var(--color-success-500)' },
          { label: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: '👁', color: 'var(--color-info-500)' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: '🖱', color: 'var(--color-warning-500)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ paddingTop: 16, paddingBottom: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{s.value}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <select className="form-select" style={{ width: 160 }} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
          <option value="all">All Platforms</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
        </select>
      </div>

      {/* Campaign list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No campaigns found</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>Create your first advertising campaign to reach more people.</p>
            <Button variant="primary" onClick={() => navigate('/campaigns/create')}>Create Campaign</Button>
          </div>
        ) : (
          filtered.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onPause={handlePause}
              onResume={handleResume}
              onDuplicate={handleDuplicate}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
