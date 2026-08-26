import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function SSOCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      const authError = searchParams.get('error')
      if (authError === 'oauth_denied') {
        toast.error('Authentication cancelled')
      } else {
        toast.error('Authentication failed')
      }
      navigate('/login')
      return
    }

    // Set token for future axios requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Fetch user profile
    axios.get('/api/auth/me')
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user, token)
          toast.success('Successfully logged in!')
          navigate('/dashboard')
        } else {
          toast.error('Failed to retrieve user profile')
          navigate('/login')
        }
      })
      .catch(err => {
        console.error(err)
        toast.error('Error fetching user profile')
        navigate('/login')
      })
  }, [searchParams, navigate, setUser])

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'var(--bg-secondary)' }}>
      {error ? (
        <div style={{ color: 'var(--color-error-500)', fontWeight: 600 }}>{error}</div>
      ) : (
        <>
          <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border-secondary)', borderTopColor: 'var(--color-brand-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>Completing sign in...</h2>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  )
}
