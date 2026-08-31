import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useSocialAccountsStore } from '../../store'
import { DashboardLayout } from '../../components/Layout'
import { Button, PlatformIcon, StepWizard } from '../../components/ui'

const STEPS = ['Platform', 'Campaign', 'Audience', 'Budget', 'Creative', 'Review']

const OBJECTIVES = [
  { key: 'awareness', icon: '👁', label: 'Brand Awareness', desc: 'Reach people more likely to remember your ad' },
  { key: 'traffic', icon: '🔗', label: 'Traffic', desc: 'Send people to a destination on or off Facebook' },
  { key: 'engagement', icon: '❤️', label: 'Engagement', desc: 'Get more post reactions, comments, and shares' },
  { key: 'leads', icon: '📋', label: 'Lead Generation', desc: 'Collect leads for your business directly from ads' },
  { key: 'app_installs', icon: '📱', label: 'App Installs', desc: 'Send people to the store to purchase your app' },
  { key: 'conversions', icon: '🎯', label: 'Conversions', desc: 'Get people to take valuable actions on your site' },
]

const INTERESTS = ['Technology', 'Business', 'Marketing', 'Fashion', 'Travel', 'Food', 'Fitness', 'Gaming', 'Finance', 'Education', 'Parenting', 'Sports', 'Photography', 'Art', 'Music']
const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany', 'France', 'Brazil', 'Singapore', 'UAE']

const StepPanel = ({ title, subtitle, children }) => (
  <div className="card animate-slide-up" style={{ maxWidth: 680, margin: '0 auto' }}>
    <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{title}</h2>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{subtitle}</p>
    </div>
    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {children}
    </div>
  </div>
)

export default function CreateCampaign() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [campaign, setCampaign] = useState({
    platforms: [],
    name: '',
    objective: '',
    // Audience
    locations: [],
    ageMin: 18,
    ageMax: 65,
    gender: 'all',
    interests: [],
    // Budget
    budgetType: 'daily',
    budget: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    // Creative
    primaryText: '',
    headline: '',
    description: '',
    cta: 'Learn More',
    destinationUrl: '',
    adImage: null,
  })

  const update = (key, val) => setCampaign(c => ({ ...c, [key]: val }))
  const togglePlatform = (p) => setCampaign(c => ({ ...c, platforms: c.platforms.includes(p) ? c.platforms.filter(x => x !== p) : [...c.platforms, p] }))
  const addInterest = (i) => setCampaign(c => ({ ...c, interests: c.interests.includes(i) ? c.interests.filter(x => x !== i) : [...c.interests, i] }))
  const addLocation = (l) => setCampaign(c => ({ ...c, locations: c.locations.includes(l) ? c.locations.filter(x => x !== l) : [...c.locations, l] }))

  const canProceed = () => {
    if (step === 0) return campaign.platforms.length > 0
    if (step === 1) return !!campaign.name && !!campaign.objective
    if (step === 2) return campaign.locations.length > 0
    if (step === 3) return !!campaign.budget && !!campaign.startDate
    if (step === 4) return !!campaign.primaryText && !!campaign.headline && !!campaign.destinationUrl
    return true
  }

  const { accounts, fetchAccounts, fetched: accountsFetched } = useSocialAccountsStore()
  
  useEffect(() => {
    if (!accountsFetched) fetchAccounts()
  }, [accountsFetched, fetchAccounts])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        name: campaign.name,
        platforms: campaign.platforms,
        objective: campaign.objective,
        budget: campaign.budget,
        budget_type: campaign.budgetType,
        start_date: campaign.startDate,
        end_date: campaign.endDate || null,
        locations: campaign.locations,
        age_min: campaign.ageMin,
        age_max: campaign.ageMax,
        gender: campaign.gender,
        interests: campaign.interests,
        primary_text: campaign.primaryText,
        headline: campaign.headline,
        description: campaign.description,
        cta: campaign.cta,
        destination_url: campaign.destinationUrl,
      }

      await axios.post('/api/campaigns', payload, { headers: { 'Content-Type': 'application/json' } })
      toast.success('Campaign created successfully!')
      navigate('/campaigns')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Create Campaign">
      {/* Step wizard */}
      <div style={{ maxWidth: 680, margin: '0 auto 32px' }}>
        <StepWizard steps={STEPS} currentStep={step} />
      </div>

      {/* Step 0: Platform */}
      {step === 0 && (
        <StepPanel title="Select Platforms" subtitle="Choose the advertising platforms for your campaign">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {['facebook', 'instagram', 'linkedin'].map(p => {
              const names = { facebook: 'Facebook Ads', instagram: 'Instagram Ads', linkedin: 'LinkedIn Ads' }
              const descs = { facebook: 'Reach 3B+ users with targeted ads', instagram: 'Visual ads for engaged audiences', linkedin: 'B2B ads for professionals' }
              const colors = { facebook: 'var(--color-brand-500)', instagram: '#ec4899', linkedin: '#0a66c2' }
              
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  style={{
                    padding: 24, borderRadius: 'var(--radius-xl)', border: `2px solid ${campaign.platforms.includes(p) ? colors[p] : 'var(--border-primary)'}`,
                    background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'center', transition: 'all var(--transition-fast)',
                    boxShadow: campaign.platforms.includes(p) ? `0 0 0 4px ${colors[p]}15` : 'var(--shadow-sm)',
                    fontFamily: 'inherit'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <PlatformIcon platform={p} size={36} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)', marginBottom: 6 }}>{names[p]}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{descs[p]}</div>
                  {campaign.platforms.includes(p) && (
                    <div style={{ marginTop: 12, width: 24, height: 24, borderRadius: '50%', background: colors[p], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px auto 0', color: 'white', fontSize: 12 }}>✓</div>
                  )}
                </button>
              )
            })}
          </div>
        </StepPanel>
      )}

      {/* Step 1: Campaign Details */}
      {step === 1 && (
        <StepPanel title="Campaign Details" subtitle="Set your campaign name and objective">
          <div className="form-group">
            <label className="form-label">Campaign Name <span className="form-label-required">*</span></label>
            <input className="form-input" placeholder="e.g. Spring Product Launch 2024" value={campaign.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Campaign Objective <span className="form-label-required">*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 4 }}>
              {OBJECTIVES.map(obj => (
                <button
                  key={obj.key}
                  onClick={() => update('objective', obj.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    border: `2px solid ${campaign.objective === obj.key ? 'var(--color-brand-500)' : 'var(--border-primary)'}`,
                    borderRadius: 'var(--radius-lg)', background: campaign.objective === obj.key ? 'var(--bg-active)' : 'var(--bg-secondary)',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{obj.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: campaign.objective === obj.key ? 'var(--color-brand-600)' : 'var(--text-primary)' }}>{obj.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{obj.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </StepPanel>
      )}

      {/* Step 2: Audience */}
      {step === 2 && (
        <StepPanel title="Define Your Audience" subtitle="Target the right people with your ads">
          <div className="form-group">
            <label className="form-label">Locations <span className="form-label-required">*</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {COUNTRIES.map(country => (
                <button
                  key={country}
                  onClick={() => addLocation(country)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all var(--transition-fast)',
                    border: `1.5px solid ${campaign.locations.includes(country) ? 'var(--color-brand-500)' : 'var(--border-primary)'}`,
                    background: campaign.locations.includes(country) ? 'var(--bg-active)' : 'var(--bg-secondary)',
                    color: campaign.locations.includes(country) ? 'var(--color-brand-600)' : 'var(--text-secondary)',
                  }}
                >
                  {campaign.locations.includes(country) ? '✓ ' : ''}{country}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Age Range</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="number" className="form-input" value={campaign.ageMin} min={13} max={campaign.ageMax - 1} onChange={e => update('ageMin', e.target.value)} style={{ width: 80 }} />
                <span style={{ color: 'var(--text-tertiary)' }}>–</span>
                <input type="number" className="form-input" value={campaign.ageMax} min={campaign.ageMin + 1} max={65} onChange={e => update('ageMax', e.target.value)} style={{ width: 80 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={campaign.gender} onChange={e => update('gender', e.target.value)}>
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  onClick={() => addInterest(interest)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all var(--transition-fast)',
                    border: `1.5px solid ${campaign.interests.includes(interest) ? 'var(--color-brand-500)' : 'var(--border-primary)'}`,
                    background: campaign.interests.includes(interest) ? 'var(--bg-active)' : 'var(--bg-secondary)',
                    color: campaign.interests.includes(interest) ? 'var(--color-brand-600)' : 'var(--text-secondary)',
                  }}
                >
                  {campaign.interests.includes(interest) ? '✓ ' : ''}{interest}
                </button>
              ))}
            </div>
            {campaign.interests.length > 0 && <p className="form-hint">{campaign.interests.length} interests selected</p>}
          </div>
        </StepPanel>
      )}

      {/* Step 3: Budget */}
      {step === 3 && (
        <StepPanel title="Set Budget & Schedule" subtitle="Control how much you spend and when">
          <div style={{ display: 'flex', gap: 12 }}>
            {[{ value: 'daily', label: 'Daily Budget', icon: '📅', desc: 'Average amount per day' }, { value: 'lifetime', label: 'Lifetime Budget', icon: '📆', desc: 'Total amount for campaign' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => update('budgetType', opt.value)}
                style={{
                  flex: 1, padding: '16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${campaign.budgetType === opt.value ? 'var(--color-brand-500)' : 'var(--border-primary)'}`,
                  background: campaign.budgetType === opt.value ? 'var(--bg-active)' : 'var(--bg-secondary)',
                  cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit', transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{opt.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: campaign.budgetType === opt.value ? 'var(--color-brand-600)' : 'var(--text-primary)' }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">{campaign.budgetType === 'daily' ? 'Daily' : 'Lifetime'} Budget <span className="form-label-required">*</span></label>
              <div className="input-wrapper">
                <span className="input-icon-left" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>$</span>
                <input type="number" className="form-input has-icon-left" placeholder="50.00" value={campaign.budget} onChange={e => update('budget', e.target.value)} min="1" step="0.01" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-select" value={campaign.currency} onChange={e => update('currency', e.target.value)}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date <span className="form-label-required">*</span></label>
              <input type="date" className="form-input" value={campaign.startDate} onChange={e => update('startDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={campaign.endDate} onChange={e => update('endDate', e.target.value)} min={campaign.startDate} />
              <span className="form-hint">Leave blank for no end date</span>
            </div>
          </div>
        </StepPanel>
      )}

      {/* Step 4: Creative */}
      {step === 4 && (
        <StepPanel title="Ad Creative" subtitle="Design the ad that will be shown to your audience">
          <div className="form-group">
            <label className="form-label">Primary Text <span className="form-label-required">*</span></label>
            <textarea className="form-textarea" placeholder="Tell people what your ad is about..." value={campaign.primaryText} onChange={e => update('primaryText', e.target.value)} rows={4} />
            <span className="form-hint">{campaign.primaryText.length} / 125 characters (recommended)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Headline <span className="form-label-required">*</span></label>
              <input className="form-input" placeholder="e.g. Shop Our New Collection" value={campaign.headline} onChange={e => update('headline', e.target.value)} maxLength={40} />
              <span className="form-hint">{campaign.headline.length} / 40 characters</span>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Additional details about your offer" value={campaign.description} onChange={e => update('description', e.target.value)} maxLength={125} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Call to Action</label>
              <select className="form-select" value={campaign.cta} onChange={e => update('cta', e.target.value)}>
                {['Learn More', 'Shop Now', 'Sign Up', 'Download', 'Get Quote', 'Book Now', 'Contact Us', 'Apply Now'].map(cta => (
                  <option key={cta} value={cta}>{cta}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Destination URL <span className="form-label-required">*</span></label>
              <input type="url" className="form-input" placeholder="https://yourwebsite.com" value={campaign.destinationUrl} onChange={e => update('destinationUrl', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ad Image / Video</label>
            <div className="upload-zone" style={{ padding: '28px' }}>
              <div className="upload-zone-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Upload ad creative</p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>1200×628px recommended · PNG, JPG, MP4</p>
            </div>
          </div>
        </StepPanel>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <StepPanel title="Review & Submit" subtitle="Confirm all details before submitting">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Platform', value: campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1) },
              { label: 'Campaign Name', value: campaign.name },
              { label: 'Objective', value: campaign.objective },
              { label: 'Locations', value: campaign.locations.join(', ') || 'Not set' },
              { label: 'Audience', value: `${campaign.ageMin}–${campaign.ageMax} yrs, ${campaign.gender}` },
              { label: 'Interests', value: campaign.interests.join(', ') || 'None' },
              { label: 'Budget', value: `${campaign.currency} $${campaign.budget} / ${campaign.budgetType}` },
              { label: 'Schedule', value: `${campaign.startDate}${campaign.endDate ? ` – ${campaign.endDate}` : ' (no end date)'}` },
              { label: 'Headline', value: campaign.headline },
              { label: 'CTA', value: campaign.cta },
              { label: 'Destination', value: campaign.destinationUrl },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-tertiary)', minWidth: 140 }}>{item.label}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--color-info-50)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', fontSize: 'var(--font-size-xs)', color: 'var(--color-info-600)', lineHeight: 1.6 }}>
            ℹ️ After submission, your campaign will be reviewed by the platform (typically 24h). You&apos;ll be notified when it&apos;s approved.
          </div>
        </StepPanel>
      )}

      {/* Navigation buttons */}
      <div style={{ maxWidth: 680, margin: '24px auto 0', display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={() => step === 0 ? navigate('/campaigns') : setStep(s => s - 1)}>
          {step === 0 ? 'Cancel' : '← Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
            Continue →
          </Button>
        ) : (
          <Button variant="success" loading={submitting} onClick={handleSubmit}>
            🚀 Submit Campaign
          </Button>
        )}
      </div>
    </DashboardLayout>
  )
}
