import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { DashboardLayout } from '../../components/Layout'
import { Button, PlatformIcon, Avatar } from '../../components/ui'
import { useSocialAccountsStore, usePostsStore } from '../../store'
import axios from 'axios'

const PLATFORM_COLORS = { facebook: '#1877f2', instagram: '#e1306c', linkedin: '#0077b5' }

function PlatformPreview({ platform, account, content, media }) {
  if (!platform || !account) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-tertiary)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
        <p style={{ fontSize: 'var(--font-size-sm)' }}>Select a platform to see preview</p>
      </div>
    )
  }

  const renderFacebook = () => (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, background: 'white', overflow: 'hidden', maxWidth: 380, fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
          {account.account_name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1c1e21' }}>{account.account_name}</div>
          <div style={{ fontSize: 12, color: '#65676b' }}>Just now · 🌐</div>
        </div>
        <div style={{ marginLeft: 'auto', color: '#65676b', fontSize: 20 }}>···</div>
      </div>
      {content && <div style={{ padding: '0 16px 12px', fontSize: 14, color: '#1c1e21', lineHeight: 1.6 }}>{content}</div>}
      {media && <img src={media} alt="Post media" style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #e4e6eb', display: 'flex', gap: 20 }}>
        {['👍 Like', '💬 Comment', '🔁 Share'].map(a => (
          <button key={a} style={{ background: 'none', border: 'none', color: '#65676b', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px 0' }}>{a}</button>
        ))}
      </div>
    </div>
  )

  const renderInstagram = () => (
    <div style={{ border: '1px solid #dbdbdb', borderRadius: 8, background: 'white', overflow: 'hidden', maxWidth: 380, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433,#e6683c,#dc2743,#cc2366,#bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>
          {account.account_name[1] || account.account_name[0]}
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#262626' }}>{account.account_name}</div>
        <div style={{ marginLeft: 'auto', color: '#262626', fontSize: 20, cursor: 'pointer' }}>···</div>
      </div>
      {media ? (
        <img src={media} alt="Post" style={{ width: '100%', maxHeight: 380, objectFit: 'cover' }} />
      ) : (
        <div style={{ background: '#fafafa', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c7c7c7', flexDirection: 'column', gap: 8 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
          <span style={{ fontSize: 12 }}>Add a photo or video</span>
        </div>
      )}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
          {['❤️', '💬', '📤'].map(icon => <span key={icon} style={{ fontSize: 22, cursor: 'pointer' }}>{icon}</span>)}
          <span style={{ marginLeft: 'auto', fontSize: 22 }}>🔖</span>
        </div>
        <div style={{ fontSize: 14, color: '#262626', lineHeight: 1.5 }}>
          <strong>{account.account_name}</strong>{' '}
          {content || <span style={{ color: '#c7c7c7' }}>Write a caption...</span>}
        </div>
      </div>
    </div>
  )

  const renderLinkedIn = () => (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: 'white', overflow: 'hidden', maxWidth: 380, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 48, height: 48, borderRadius: 4, background: '#0077b5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
          {account.account_name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#000000de' }}>{account.account_name}</div>
          <div style={{ fontSize: 12, color: '#00000099' }}>Just now</div>
        </div>
        <div style={{ marginLeft: 'auto', cursor: 'pointer', color: '#00000099', fontSize: 20 }}>···</div>
      </div>
      {content && <div style={{ padding: '0 16px 12px', fontSize: 14, color: '#000000de', lineHeight: 1.6 }}>{content}</div>}
      {media && <img src={media} alt="Post" style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />}
      <div style={{ padding: '6px 16px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: 16 }}>
        {['👍 Like', '💬 Comment', '🔁 Repost', '📤 Send'].map(a => (
          <button key={a} style={{ background: 'none', border: 'none', color: '#00000099', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '8px 0' }}>{a}</button>
        ))}
      </div>
    </div>
  )

  const renderers = { facebook: renderFacebook, instagram: renderInstagram, linkedin: renderLinkedIn }
  return renderers[platform]?.() || null
}

export default function CreatePost() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef()

  const [form, setForm] = useState({
    platform: '',
    accountId: '',
    content: '',
    hashtags: '',
    link: '',
    postType: 'text',
    scheduledAt: '',
    publishNow: true,
  })
  const [media, setMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const { accounts, fetchAccounts, fetched: accountsFetched } = useSocialAccountsStore()
  const { fetchPosts } = usePostsStore()

  useEffect(() => {
    if (!accountsFetched) fetchAccounts()
  }, [accountsFetched, fetchAccounts])

  const selectedAccount = accounts.find(a => String(a.id) === form.accountId)
  const platformAccounts = accounts.filter(a => a.platform === form.platform && a.status === 'active')

  const CHAR_LIMITS = { facebook: 63206, instagram: 2200, linkedin: 3000 }
  const charLimit = CHAR_LIMITS[form.platform] || 2200

  const handleMediaChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { toast.error('File size must be under 50MB'); return }
    setMedia(file)
    const reader = new FileReader()
    reader.onloadend = () => setMediaPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleContentChange = (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, content: val }))
    setCharCount(val.length)
  }

  const handlePublish = async () => {
    if (!form.platform) { toast.error('Please select a platform'); return }
    if (!form.accountId) { toast.error('Please select an account'); return }
    if (!form.content.trim() && !media) { toast.error('Add content or media to publish'); return }
    if (!form.publishNow && !form.scheduledAt) { toast.error('Please select a schedule date & time'); return }

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('social_account_id', form.accountId)
      formData.append('content', form.content)
      formData.append('status', form.publishNow ? 'published' : 'scheduled')
      if (form.scheduledAt) formData.append('scheduled_at', form.scheduledAt)
      if (media) formData.append('media', media) // Backend needs MediaController/upload or support direct attach
      
      const res = await axios.post('/api/posts', formData)
      
      if (res.data.success) {
        toast.success(form.publishNow ? 'Post published successfully! 🎉' : 'Post scheduled! 📅')
        fetchPosts() // refresh posts store
        navigate('/posts')
      }
    } catch (err) {
      toast.error('Failed to create post')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fullContent = [
    form.content,
    form.hashtags && form.hashtags.split(' ').filter(Boolean).map(h => h.startsWith('#') ? h : `#${h}`).join(' '),
    form.link,
  ].filter(Boolean).join('\n\n')

  return (
    <DashboardLayout title="Create Post">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, height: 'calc(100vh - 130px)', overflow: 'hidden' }}>
        {/* Left: Composer */}
        <div style={{ overflow: 'auto', paddingRight: 4 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Select Platform & Account</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Platform selector */}
              <div>
                <label className="form-label">Platform</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {['facebook', 'instagram', 'linkedin'].map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, platform: p, accountId: '' }))}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${form.platform === p ? PLATFORM_COLORS[p] : 'var(--border-primary)'}`,
                        background: form.platform === p ? `${PLATFORM_COLORS[p]}10` : 'var(--bg-secondary)',
                        cursor: 'pointer', transition: 'all var(--transition-fast)', fontFamily: 'inherit',
                        fontWeight: 600, fontSize: 'var(--font-size-sm)',
                        color: form.platform === p ? PLATFORM_COLORS[p] : 'var(--text-secondary)',
                      }}
                    >
                      <PlatformIcon platform={p} size={18} />
                      <span className="hide-mobile">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account selector */}
              {form.platform && (
                <div className="form-group">
                  <label className="form-label">Account / Page</label>
                  {platformAccounts.length === 0 ? (
                    <div style={{ padding: '12px 16px', background: 'var(--color-warning-50)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-warning-600)' }}>
                      No active {form.platform} accounts. <button onClick={() => navigate('/accounts')} style={{ fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}>Connect one →</button>
                    </div>
                  ) : (
                    <select className="form-select" value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}>
                      <option value="">Select account...</option>
                      {platformAccounts.map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Content</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: charCount > charLimit * 0.9 ? 'var(--color-error-500)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                {charCount} / {charLimit.toLocaleString()}
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Caption / Text</label>
                <textarea
                  className="form-textarea"
                  placeholder={`Write your ${form.platform || 'social media'} post here...\n\nTip: Use line breaks, emojis, and @mentions for better engagement!`}
                  value={form.content}
                  onChange={handleContentChange}
                  rows={6}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Hashtags</label>
                  <input
                    className="form-input"
                    placeholder="#marketing #socialmedia"
                    value={form.hashtags}
                    onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))}
                  />
                  <span className="form-hint">Separate with spaces</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Link (optional)</label>
                  <input
                    className="form-input"
                    placeholder="https://yourwebsite.com"
                    type="url"
                    value={form.link}
                    onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Media</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Optional</span>
            </div>
            <div className="card-body">
              {mediaPreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                  <button
                    onClick={() => { setMedia(null); setMediaPreview(null) }}
                    style={{
                      position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}
                  >×</button>
                </div>
              ) : (
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '32px' }}
                >
                  <div className="upload-zone-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Click to upload or drag & drop
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                    PNG, JPG, GIF, MP4 up to 50MB
                  </p>
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleMediaChange} />
                </div>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Publishing</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Publish Now', value: true },
                  { label: 'Schedule', value: false },
                ].map(opt => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setForm(f => ({ ...f, publishNow: opt.value }))}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${form.publishNow === opt.value ? 'var(--color-brand-500)' : 'var(--border-primary)'}`,
                      background: form.publishNow === opt.value ? 'var(--bg-active)' : 'var(--bg-secondary)',
                      color: form.publishNow === opt.value ? 'var(--color-brand-600)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer',
                      transition: 'all var(--transition-fast)', fontFamily: 'inherit',
                    }}
                  >
                    {opt.value ? '⚡ Publish Now' : '📅 Schedule'}
                  </button>
                ))}
              </div>

              {!form.publishNow && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="animate-slide-up">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-input" value={form.scheduledAt.split('T')[0] || ''} min={new Date().toISOString().split('T')[0]}
                      onChange={e => setForm(f => ({ ...f, scheduledAt: `${e.target.value}T${form.scheduledAt.split('T')[1] || '09:00'}` }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-input" value={form.scheduledAt.split('T')[1] || '09:00'}
                      onChange={e => setForm(f => ({ ...f, scheduledAt: `${form.scheduledAt.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}` }))} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="secondary" fullWidth onClick={() => navigate('/posts')}>
                  Save as Draft
                </Button>
                <Button variant="primary" fullWidth loading={loading} onClick={handlePublish}>
                  {form.publishNow ? '🚀 Publish Now' : '📅 Schedule Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div style={{ overflow: 'auto' }}>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>Live Preview</h3>
              {form.platform && (
                <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', background: `${PLATFORM_COLORS[form.platform]}18`, color: PLATFORM_COLORS[form.platform], borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                  {form.platform.charAt(0).toUpperCase() + form.platform.slice(1)}
                </span>
              )}
            </div>
            <div className="card-body" style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 24 }}>
              <PlatformPreview
                platform={form.platform}
                account={selectedAccount}
                content={fullContent}
                media={mediaPreview}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
