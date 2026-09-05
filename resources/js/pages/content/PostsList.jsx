import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { DashboardLayout } from '../../components/Layout'
import { Button, PlatformIcon, StatusBadge, Tabs } from '../../components/ui'
import { usePostsStore } from '../../store'
import axios from 'axios'

const PLATFORM_COLORS = { facebook: '#1877f2', instagram: '#e1306c', linkedin: '#0077b5' }

export default function PostsList() {
  const navigate = useNavigate()
  const { posts, fetchPosts, fetched: postsFetched } = usePostsStore()

  useEffect(() => {
    if (!postsFetched) fetchPosts()
  }, [postsFetched, fetchPosts])
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [viewPost, setViewPost] = useState(null)

  const tabs = [
    { value: 'all', label: 'All Posts', count: posts.length },
    { value: 'published', label: 'Published', count: posts.filter(p => p.status === 'published').length },
    { value: 'scheduled', label: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
    { value: 'draft', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
    { value: 'failed', label: 'Failed', count: posts.filter(p => p.status === 'failed').length },
  ]

  const filtered = posts.filter(p => {
    const matchTab = activeTab === 'all' || p.status === activeTab
    const matchSearch = p.content?.toLowerCase().includes(search.toLowerCase()) || p.social_account?.account_name?.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = platformFilter === 'all' || p.social_account?.platform === platformFilter
    return matchTab && matchSearch && matchPlatform
  })

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`)
      fetchPosts()
      toast.success('Post deleted.')
    } catch(err) {
      toast.error('Failed to delete post.')
    }
  }

  const handleRetry = async (post) => {
    toast.loading('Retrying post...', { id: 'retry' })
    try {
      const res = await axios.post(`/api/posts/${post.id}/retry`)
      if (res.data.success) {
        if (res.data.post && res.data.post.status === 'failed') {
          toast.error('Post failed to publish again.', { id: 'retry' })
        } else {
          toast.success('Post published!', { id: 'retry' })
        }
        fetchPosts()
      } else {
        toast.error('Failed to retry post.', { id: 'retry' })
      }
    } catch(err) {
      toast.error('Failed to retry post.', { id: 'retry' })
    }
  }

  return (
    <DashboardLayout
      title="Posts"
      actions={
        <Button variant="primary" size="sm" onClick={() => navigate('/posts/create')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Create Post
        </Button>
      }
    >
      {/* Summary strip matching Dashboard UI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Posts', value: posts.length, color: '#7c5cfc' },
          { label: 'Published', value: posts.filter(p => p.status === 'published').length, color: '#10b981' },
          { label: 'Scheduled', value: posts.filter(p => p.status === 'scheduled').length, color: '#3b82f6' },
          { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length, color: '#f59e0b' },
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

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="search-box" style={{ width: 220 }}>
            <span className="search-box-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </span>
            <input placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 140 }} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
            <option value="all">All platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      {/* Posts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No posts found</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginBottom: 24 }}>
              {search || platformFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first post to get started'}
            </p>
            <Button variant="primary" onClick={() => navigate('/posts/create')}>Create Post</Button>
          </div>
        ) : (
          filtered.map((post, i) => (
            <div
              key={post.id}
              className="card animate-slide-up"
              style={{ padding: 0, animationDelay: `${i * 50}ms` }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 24px' }}>
                {/* Platform icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                  background: `${PLATFORM_COLORS[post.social_account?.platform]}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <PlatformIcon platform={post.social_account?.platform} size={20} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{post.social_account?.account_name}</span>
                    <StatusBadge status={post.status} />
                    <span style={{ padding: '2px 8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                      {post.social_account?.platform}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content}
                  </p>

                  {/* Meta info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {post.published_at && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Published: {post.published_at}
                      </span>
                    )}
                    {post.scheduled_at && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-info-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        Scheduled: {post.scheduled_at}
                      </span>
                    )}
                    {post.status === 'published' && (
                      <div style={{ display: 'flex', gap: 14 }}>
                        {[['Likes:', post.likes], ['Comments:', post.comments], ['Shares:', post.shares]]
                          .filter(([label]) => !(label === 'Shares:' && post.social_account?.platform === 'instagram'))
                          .map(([label, val], j) => (
                          <span key={j} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>{label} {val}</span>
                        ))}
                      </div>
                    )}
                    {post.status === 'failed' && post.error && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        Error: {post.error}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button variant="ghost" size="sm" onClick={() => setViewPost(post)}>View</Button>
                  {post.status === 'failed' && (
                    <Button variant="secondary" size="sm" onClick={() => handleRetry(post)}>Retry</Button>
                  )}
                  {(post.status === 'draft' || post.status === 'scheduled') && (
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/posts/edit/${post.id}`)}>Edit</Button>
                  )}
                  {post.status === 'scheduled' && (
                    <Button variant="ghost" size="sm" onClick={() => { setPosts(p => p.map(x => x.id === post.id ? { ...x, status: 'cancelled' } : x)); toast.success('Post cancelled.') }}>Cancel</Button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all var(--transition-fast)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-error-50)'; e.currentTarget.style.color = 'var(--color-error-500)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Post Modal */}
      {viewPost && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${PLATFORM_COLORS[viewPost.social_account?.platform]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlatformIcon platform={viewPost.social_account?.platform} size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{viewPost.social_account?.account_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{viewPost.status}</div>
                </div>
              </div>
              <button onClick={() => setViewPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div style={{ padding: 20, overflowY: 'auto' }}>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 16 }}>
                {viewPost.content}
              </p>
              
              {viewPost.media_path && (
                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-secondary)', background: 'var(--bg-tertiary)' }}>
                  {viewPost.post_type === 'video' ? (
                    <video src={viewPost.media_path} controls style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'contain' }} />
                  ) : (
                    <img src={viewPost.media_path} alt="Post media" style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'contain' }} />
                  )}
                </div>
              )}

              {viewPost.link && (
                <a href={viewPost.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 'var(--font-size-sm)', color: 'var(--color-primary-600)', textDecoration: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  {viewPost.link}
                </a>
              )}
            </div>
            
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setViewPost(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
