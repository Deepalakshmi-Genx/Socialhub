import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/Layout'
import { Button, PlatformIcon } from '../../components/ui'
import { usePostsStore } from '../../store'

const PLATFORM_COLORS = { facebook: '#1877f2', instagram: '#e1306c', linkedin: '#0077b5' }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

// Distribute mock posts across the current month for visual demo
function getPostsForDay(day, month, year, posts) {
  const seed = (day * 7 + month) % posts.length
  const count = [0, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0][day - 1] || 0
  return posts.slice(seed % posts.length, (seed % posts.length) + count)
}

export default function Calendar() {
  const navigate = useNavigate()
  const today = new Date()
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [view, setView] = useState('month') // month | week | day
  const [selectedPost, setSelectedPost] = useState(null)

  const { posts, fetchPosts, fetched: postsFetched } = usePostsStore()

  useEffect(() => {
    if (!postsFetched) fetchPosts()
  }, [postsFetched, fetchPosts])

  const { year, month } = viewDate
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const prevMonth = () => setViewDate(v => {
    const d = new Date(v.year, v.month - 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const nextMonth = () => setViewDate(v => {
    const d = new Date(v.year, v.month + 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDay + 1
    const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
    const isToday = isCurrentMonth && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    const dayPosts = isCurrentMonth ? getPostsForDay(dayNum, month, year, posts) : []
    return { dayNum, isCurrentMonth, isToday, dayPosts }
  })

  return (
    <DashboardLayout
      title="Content Calendar"
      actions={
        <Button variant="primary" size="sm" onClick={() => navigate('/posts/create')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Create Post
        </Button>
      }
    >
      {/* Summary strip matching Dashboard UI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Calendar Month', value: `${MONTHS[month]} ${year}`, color: '#7c5cfc' },
          { label: 'Scheduled Posts', value: posts.filter(p => p.status === 'scheduled').length, color: '#3b82f6' },
          { label: 'Published Posts', value: posts.filter(p => p.status === 'published').length, color: '#10b981' },
          { label: 'Drafts Queue', value: posts.filter(p => p.status === 'draft').length, color: '#f59e0b' },
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
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>{s.value}</div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
          </div>
        ))}
      </div>

      {/* Calendar Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={prevMonth}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0 10px', height: 32 }}
            >
              ‹
            </button>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)', minWidth: 180, textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0 10px', height: 32 }}
            >
              ›
            </button>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setViewDate({ year: today.getFullYear(), month: today.getMonth() })}
          >
            Today
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { color: 'var(--color-info-600)', label: 'Scheduled' },
              { color: 'var(--color-success-600)', label: 'Published' },
              { color: 'var(--text-tertiary)', label: 'Draft' },
              { color: 'var(--color-error-600)', label: 'Failed' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* View switcher */}
          <div className="tabs">
            {['month', 'week', 'day'].map(v => (
              <button key={v} className={`tab-btn ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month grid */}
      {view === 'month' && (
        <div className="calendar-grid">
          {DAYS.map(d => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}
          {cells.map(({ dayNum, isCurrentMonth, isToday, dayPosts }, idx) => (
            <div
              key={idx}
              className={`calendar-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => isCurrentMonth && navigate('/posts/create')}
            >
              <div className="calendar-day-num">{isCurrentMonth ? dayNum : ''}</div>
              {dayPosts.slice(0, 3).map((post, pi) => (
                <div
                  key={pi}
                  className={`calendar-post-chip ${post.status}`}
                  onClick={e => { e.stopPropagation(); setSelectedPost(post) }}
                  title={post.content.slice(0, 60)}
                >
                  <PlatformIcon platform={post.platform} size={10} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.content.slice(0, 20)}...</span>
                </div>
              ))}
              {dayPosts.length > 3 && (
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>+{dayPosts.length - 3} more</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ padding: '12px', background: 'var(--bg-tertiary)' }} />
            {DAYS.map((d, i) => {
              const dayDate = new Date(year, month, today.getDate() - today.getDay() + i)
              return (
                <div key={d} style={{ padding: '12px', textAlign: 'center', background: 'var(--bg-tertiary)', borderLeft: '1px solid var(--border-secondary)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{d}</div>
                  <div style={{
                    fontSize: 18, fontWeight: 800, color: i === today.getDay() ? 'var(--color-brand-500)' : 'var(--text-primary)',
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '4px auto 0',
                    background: i === today.getDay() ? 'var(--bg-active)' : 'transparent',
                  }}>
                    {dayDate.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time slots */}
          {Array.from({ length: 12 }, (_, h) => h + 7).map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderTop: '1px solid var(--border-secondary)' }}>
              <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {hour > 12 ? `${hour - 12}PM` : hour === 12 ? '12PM' : `${hour}AM`}
              </div>
              {Array.from({ length: 7 }, (_, di) => {
                const postForSlot = posts.find((_, pi) => (pi * 13 + di * 7 + hour) % 17 === 0)
                return (
                  <div key={di} style={{ minHeight: 50, borderLeft: '1px solid var(--border-secondary)', padding: '4px', position: 'relative' }}>
                    {postForSlot && hour === 10 + di && (
                      <div
                        className={`calendar-post-chip ${postForSlot.status}`}
                        style={{ display: 'flex' }}
                        onClick={() => setSelectedPost(postForSlot)}
                      >
                        <PlatformIcon platform={postForSlot.social_account?.platform} size={10} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 10 }}>
                          {postForSlot.content.slice(0, 18)}...
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Day view */}
      {view === 'day' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
            {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          {posts.slice(0, 4).map((post, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
              <div style={{ width: 60, fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, paddingTop: 4, flexShrink: 0 }}>
                {`${9 + i * 2}:00 ${9 + i * 2 >= 12 ? 'PM' : 'AM'}`}
              </div>
              <div style={{ flex: 1 }}>
                <div className={`calendar-post-chip ${post.status}`} style={{ display: 'inline-flex', marginBottom: 6 }}>
                  <PlatformIcon platform={post.social_account?.platform} size={12} />
                  {post.status}
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{post.content.slice(0, 100)}...</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>{post.social_account?.account_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setSelectedPost(null)}
        >
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-2xl)', padding: 24, maxWidth: 480, width: '100%', animation: 'bounceIn 200ms ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PlatformIcon platform={selectedPost.social_account?.platform} size={22} />
                <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{selectedPost.social_account?.account_name}</span>
              </div>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 20 }}>×</button>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 16 }}>{selectedPost.content}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={`post-status ${selectedPost.status}`}>{selectedPost.status}</span>
              {selectedPost.published_at && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', alignSelf: 'center' }}>{selectedPost.published_at}</span>}
              {selectedPost.scheduled_at && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-info-600)', alignSelf: 'center' }}>Scheduled: {selectedPost.scheduled_at}</span>}
            </div>
            {selectedPost.status === 'published' && (
              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                {[['Likes:', selectedPost.likes], ['Comments:', selectedPost.comments], ['Shares:', selectedPost.shares]]
                  .filter(([label]) => !(label === 'Shares:' && selectedPost.social_account?.platform === 'instagram'))
                  .map(([label, val], j) => (
                  <span key={j} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>{label} {val}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <Button variant="secondary" size="sm" fullWidth onClick={() => setSelectedPost(null)}>Close</Button>
              <Button variant="primary" size="sm" fullWidth onClick={() => { navigate('/posts/create'); setSelectedPost(null) }}>Edit Post</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
