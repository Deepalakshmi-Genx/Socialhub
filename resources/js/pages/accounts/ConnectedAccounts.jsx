import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { DashboardLayout } from '../../components/Layout'
import { Button, PlatformIcon, StatusBadge, Badge, Modal } from '../../components/ui'

const PLATFORM_INFO = {
  facebook: {
    name: 'Facebook',
    desc: 'Connect Facebook Pages to publish posts and run ads.',
    color: '#1877f2',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'ads_management'],
  },
  instagram: {
    name: 'Instagram',
    desc: 'Connect Instagram Business accounts for content and ads.',
    color: '#e1306c',
    scopes: ['instagram_basic', 'instagram_content_publish', 'ads_management'],
  },
  linkedin: {
    name: 'LinkedIn',
    desc: 'Connect LinkedIn Company Pages to publish and advertise.',
    color: '#0077b5',
    scopes: ['r_liteprofile', 'w_member_social', 'r_ads', 'w_ads'],
  },
}

function AccountCard({ account, onDisconnect, onReconnect }) {
  const info = PLATFORM_INFO[account.platform]
  const isExpired = account.status === 'expired'

  return (
    <div className="card animate-slide-up" style={{ padding: 0 }}>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: `${info.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlatformIcon platform={account.platform} size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-md)' }}>{account.account_name}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{info.name} · {account.followers?.toLocaleString()} followers</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isExpired ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 600, background: 'var(--color-warning-50)', color: 'var(--color-warning-600)' }}>
                ⚠️ Expired
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 600, background: 'var(--color-success-50)', color: 'var(--color-success-600)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success-500)', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
                Active
              </span>
            )}
          </div>
        </div>

        {/* Permission badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
          {info.scopes.map(scope => (
            <span key={scope} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontSize: 10, fontWeight: 600 }}>
              {scope}
            </span>
          ))}
        </div>

        {/* Stats row */}
        {!isExpired && (
          <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            {[
              { label: 'Posts This Month', value: Math.floor(Math.random() * 20) + 5 },
              { label: 'Connected Since', value: account.connected_at },
              { label: 'Last Published', value: '2 days ago' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {isExpired && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--color-warning-50)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-xs)', color: 'var(--color-warning-600)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span>
            <span>Your {info.name} connection has expired. Reconnect to continue publishing.</span>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="ghost" size="sm" onClick={() => toast.success('Opening account settings...')}>
          Settings
        </Button>
        {isExpired ? (
          <Button variant="primary" size="sm" onClick={() => onReconnect(account)}>
            Reconnect
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onDisconnect(account)}>
            Disconnect
          </Button>
        )}
      </div>
    </div>
  )
}

function ConnectModal({ isOpen, onClose }) {
  const [connecting, setConnecting] = useState(null)
  const [showFbOptions, setShowFbOptions] = useState(false)

  const handleConnect = (platform) => {
    if (platform === 'facebook' && !showFbOptions) {
      setShowFbOptions(true)
      return
    }

    setConnecting(platform)
    if (platform === 'facebook_page' || platform === 'facebook_group' || platform === 'instagram') {
      const type = platform === 'facebook_group' ? 'group' : 'page'
      axios.get(`/api/social/meta/url?type=${type}`)
        .then(res => {
          if (res.data.url) {
            window.location.href = res.data.url
          }
        })
        .catch(err => {
          toast.error('Failed to initialize Meta login')
          setConnecting(null)
          setShowFbOptions(false)
        })
    } else {
      window.location.href = `/api/oauth/${platform}`
    }
  }

  const handleClose = () => {
    setShowFbOptions(false)
    setConnecting(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={showFbOptions ? "Select Facebook Account Type" : "Connect Social Account"}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {showFbOptions ? (
          <>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Check out our guide to supported channels for more details.
            </p>
            <button
              disabled={!!connecting}
              onClick={() => handleConnect('facebook_page')}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px',
                background: 'var(--bg-secondary)', border: '1.5px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer', width: '100%',
                transition: 'all var(--transition-base)', fontFamily: 'inherit', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!connecting) e.currentTarget.style.borderColor = '#1877f2' }}
              onMouseLeave={e => { if (connecting !== 'facebook_page') e.currentTarget.style.borderColor = 'var(--border-primary)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1877f218', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {connecting === 'facebook_page' ? (
                   <div style={{ width: 20, height: 20, border: '2px solid #1877f240', borderTop: '2px solid #1877f2', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                   <span style={{ fontSize: 20 }}>🏳️</span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>Page</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.5 }}>
                  A page is for businesses, brands, organizations and public figures. Connecting to personal profiles is not supported by Meta.
                </div>
              </div>
            </button>
            <button
              disabled={!!connecting}
              onClick={() => handleConnect('facebook_group')}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px',
                background: 'var(--bg-secondary)', border: '1.5px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer', width: '100%',
                transition: 'all var(--transition-base)', fontFamily: 'inherit', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!connecting) e.currentTarget.style.borderColor = '#1877f2' }}
              onMouseLeave={e => { if (connecting !== 'facebook_group') e.currentTarget.style.borderColor = 'var(--border-primary)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1877f218', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {connecting === 'facebook_group' ? (
                   <div style={{ width: 20, height: 20, border: '2px solid #1877f240', borderTop: '2px solid #1877f2', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                   <span style={{ fontSize: 20 }}>👥</span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>Group</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.5 }}>
                  Share to Groups as a member or an admin. Direct publishing to Facebook Groups is restricted by Meta for new apps.
                </div>
              </div>
            </button>
            <Button variant="ghost" onClick={() => setShowFbOptions(false)} disabled={!!connecting} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              ← Back
            </Button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Choose a platform to connect. You&apos;ll be redirected to authorize access.
            </p>
            {Object.entries(PLATFORM_INFO).map(([key, info]) => (
              <button
                key={key}
                disabled={!!connecting}
                onClick={() => handleConnect(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                  background: 'var(--bg-secondary)', border: `1.5px solid ${connecting === key ? info.color : 'var(--border-primary)'}`,
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer', width: '100%',
                  transition: 'all var(--transition-base)', fontFamily: 'inherit', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!connecting) { e.currentTarget.style.borderColor = info.color; e.currentTarget.style.background = `${info.color}08` } }}
                onMouseLeave={e => { if (connecting !== key) { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)' } }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${info.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {connecting === key ? (
                    <div style={{ width: 20, height: 20, border: `2px solid ${info.color}40`, borderTop: `2px solid ${info.color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <PlatformIcon platform={key} size={24} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{info.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{info.desc}</div>
                </div>
                {connecting === key ? (
                  <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', color: info.color, fontWeight: 600 }}>Connecting...</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                )}
              </button>
            ))}
          </>
        )}
      </div>
    </Modal>
  )
}

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [connectModalOpen, setConnectModalOpen] = useState(false)
  const [disconnectTarget, setDisconnectTarget] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    // Check for OAuth callbacks
    const successMsg = searchParams.get('success')
    const errorMsg = searchParams.get('error')

    if (successMsg === 'facebook_connected') {
      toast.success('Facebook account(s) successfully connected!')
      setSearchParams(new URLSearchParams())
    } else if (errorMsg) {
      toast.error('Failed to connect account: ' + errorMsg)
      setSearchParams(new URLSearchParams())
    }

    fetchAccounts()
  }, [searchParams, setSearchParams])

  const fetchAccounts = () => {
    setLoading(true)
    axios.get('/api/social/accounts')
      .then(res => {
        if (res.data.success) setAccounts(res.data.accounts)
      })
      .catch(err => {
        console.error(err)
        toast.error('Failed to load connected accounts')
      })
      .finally(() => setLoading(false))
  }

  const handleDisconnect = (account) => setDisconnectTarget(account)
  
  const confirmDisconnect = () => {
    axios.delete(`/api/social/accounts/${disconnectTarget.id}`)
      .then(res => {
        if (res.data.success) {
          setAccounts(a => a.filter(x => x.id !== disconnectTarget.id))
          toast.success(`${disconnectTarget.account_name} disconnected.`)
        }
      })
      .catch(err => toast.error('Failed to disconnect account'))
      .finally(() => setDisconnectTarget(null))
  }

  const handleReconnect = (account) => {
    axios.post(`/api/social/accounts/${account.id}/reconnect`)
      .then(res => {
        if (res.data.redirect_url) {
          window.location.href = res.data.redirect_url
        }
      })
      .catch(err => toast.error('Failed to initiate reconnect'))
  }

  return (
    <DashboardLayout
      title="Connected Accounts"
      actions={
        <Button variant="primary" size="sm" onClick={() => setConnectModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Connect Account
        </Button>
      }
    >
      {/* Platform availability notice */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-info-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-info-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>OAuth Integration Notice</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.6 }}>
            To enable real platform connections, configure your Facebook App ID, Instagram App ID, and LinkedIn Client ID in the backend <code style={{ background: 'var(--bg-tertiary)', padding: '1px 4px', borderRadius: 4 }}>.env</code> file. See the backend setup guide for OAuth configuration.
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Connected', value: accounts.length, color: 'var(--color-brand-500)' },
          { label: 'Active', value: accounts.filter(a => a.status === 'active').length, color: 'var(--color-success-500)' },
          { label: 'Requires Reconnect', value: accounts.filter(a => a.status === 'expired').length, color: 'var(--color-warning-500)' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-xl)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{s.value}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Account cards */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-primary)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No social accounts connected yet.</p>
          <Button variant="primary" style={{ marginTop: 16 }} onClick={() => setConnectModalOpen(true)}>Connect Your First Account</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {accounts.map(acc => (
            <AccountCard
              key={acc.id}
              account={acc}
              onDisconnect={handleDisconnect}
              onReconnect={handleReconnect}
            />
          ))}
        </div>
      )}

      {/* Connect Modal */}
      <ConnectModal isOpen={connectModalOpen} onClose={() => setConnectModalOpen(false)} />

      {/* Disconnect Confirm Modal */}
      <Modal
        isOpen={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        title="Disconnect Account"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDisconnectTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDisconnect}>Disconnect</Button>
          </>
        }
      >
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <p>Are you sure you want to disconnect <strong>{disconnectTarget?.account_name}</strong>?</p>
          <br />
          <p>All scheduled posts for this account will be cancelled. This action cannot be undone.</p>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
