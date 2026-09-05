// import { useEffect, useState, useRef } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { useAuthStore, formatUserName } from '../../store'
// import { toast } from 'react-hot-toast'
// import axios from 'axios'

// export default function SSOCallback() {
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { setUser } = useAuthStore()
//   const [error, setError] = useState(null)
//   const isExecuted = useRef(false)

//   useEffect(() => {
//     if (isExecuted.current) return
//     isExecuted.current = true

//     const rawToken = searchParams.get('token')
//     const token = rawToken ? decodeURIComponent(rawToken) : null
//     const urlName = searchParams.get('name')
//     const urlEmail = searchParams.get('email')
//     const urlAvatar = searchParams.get('avatar')
//     const urlId = searchParams.get('id')

//     if (!token) {
//       const authError = searchParams.get('error')
//       if (authError === 'oauth_denied') {
//         toast.error('Authentication cancelled')
//       } else {
//         toast.error('Authentication failed')
//       }
//       navigate('/login')
//       return
//     }

//     // Immediately save token in Zustand state & axios default headers so all subsequent API calls are authenticated
//     useAuthStore.setState({ token, isAuthenticated: true })
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

//     // If URL contains user profile params from backend redirect
//     if (urlName || urlEmail) {
//       const decodedEmail = urlEmail ? decodeURIComponent(urlEmail) : ''
//       const rawName = urlName ? decodeURIComponent(urlName) : null
//       const formattedName = formatUserName({ name: rawName, email: decodedEmail })

//       const ssoUser = {
//         id: urlId || 1,
//         name: formattedName,
//         email: decodedEmail,
//         avatar: urlAvatar ? decodeURIComponent(urlAvatar) : null,
//         role: 'admin'
//       }
//       setUser(ssoUser, token)
//       toast.success(`Welcome back, ${ssoUser.name}!`)
//       navigate('/dashboard')
//       return
//     }

//     // Fallback: Fetch user profile via API
//     axios.get('/api/auth/me', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     })
//       .then(res => {
//         const userData = res.data?.user || (res.data?.success ? res.data : null)
//         if (userData && (userData.name || userData.email)) {
//           const formattedName = formatUserName(userData)
//           setUser({ ...userData, name: formattedName }, token)
//           toast.success(`Welcome back, ${formattedName}!`)
//         } else {
//           const existingUser = useAuthStore.getState().user
//           if (existingUser && existingUser.email) {
//             const formattedName = formatUserName(existingUser)
//             setUser({ ...existingUser, name: formattedName }, token)
//             toast.success(`Welcome back, ${formattedName}!`)
//           } else {
//             const fallbackUser = { id: 1, name: 'Google User', email: 'user@socialhub.com', role: 'admin' }
//             const formattedName = formatUserName(fallbackUser)
//             setUser({ ...fallbackUser, name: formattedName }, token)
//             toast.success(`Welcome back, ${formattedName}!`)
//           }
//         }
//         navigate('/dashboard')
//       })
//       .catch(err => {
//         console.error('SSO profile fetch error:', err)
//         const existingUser = useAuthStore.getState().user
//         if (existingUser && existingUser.email) {
//           const formattedName = formatUserName(existingUser)
//           setUser({ ...existingUser, name: formattedName }, token)
//           toast.success(`Welcome back, ${formattedName}!`)
//         } else {
//           const fallbackUser = { id: 1, name: 'Google User', email: 'user@socialhub.com', role: 'admin' }
//           const formattedName = formatUserName(fallbackUser)
//           setUser({ ...fallbackUser, name: formattedName }, token)
//           toast.success(`Welcome back, ${formattedName}!`)
//         }
//         navigate('/dashboard')
//       })
//   }, [searchParams, navigate, setUser])

//   return (
//     <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'var(--bg-secondary)' }}>
//       {error ? (
//         <div style={{ color: 'var(--color-error-500)', fontWeight: 600 }}>{error}</div>
//       ) : (
//         <>
//           <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border-secondary)', borderTopColor: 'var(--color-brand-500)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
//           <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>Completing sign in...</h2>
//           <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//         </>
//       )}
//     </div>
//   )
// }


import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore, formatUserName } from '../../store'
import { toast } from 'react-hot-toast'
import axios from 'axios'

export default function SSOCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [error, setError] = useState(null)
  const isExecuted = useRef(false)

  useEffect(() => {
    if (isExecuted.current) return
    isExecuted.current = true

    // IMPORTANT: URLSearchParams.get() already URL-decodes the value for you.
    // Calling decodeURIComponent() on it again can corrupt the token
    // (this was the main cause of every route 401ing after SSO login).
    const token = searchParams.get('token')
    const urlName = searchParams.get('name')
    const urlEmail = searchParams.get('email')
    const urlAvatar = searchParams.get('avatar')
    const urlId = searchParams.get('id')

    if (!token) {
      const authError = searchParams.get('error')
      if (authError === 'oauth_denied') {
        toast.error('Authentication cancelled')
      } else {
        toast.error('Authentication failed')
      }
      navigate('/login', { replace: true })
      return
    }

    // Persist token immediately so all subsequent API calls are authenticated
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // If URL contains user profile params, use them directly to avoid extra API call
    if (urlName || urlEmail) {
      const ssoUser = {
        id: urlId || 1,
        name: urlName,
        email: urlEmail,
        avatar: urlAvatar,
        role: 'admin'
      }
      const formattedName = formatUserName(ssoUser)
      setUser({ ...ssoUser, name: formattedName }, token)
      toast.success(`Welcome back, ${formattedName}!`)
      navigate('/dashboard', { replace: true })
      return
    }

    // Fallback: Fetch user profile via API if URL params are missing
    axios
      .get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const apiUser = res.data?.user || (res.data?.success ? res.data : null)
        if (apiUser) {
          const formattedName = formatUserName(apiUser)
          setUser({ ...apiUser, name: formattedName }, token)
          toast.success(`Welcome back, ${formattedName}!`)
          navigate('/dashboard', { replace: true })
        } else {
          throw new Error('No user data returned')
        }
      })
      .catch((err) => {
        console.error('SSO token verification failed:', err)
        toast.error('Could not complete sign in. Please try again.')
        setError('Sign-in verification failed')
        navigate('/login?error=oauth_failed', { replace: true })
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