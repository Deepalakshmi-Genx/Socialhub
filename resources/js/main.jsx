import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'
import './components.css'
import axios from 'axios'
import { useAuthStore } from './store'

// Apply theme from localStorage on mount
const savedTheme = localStorage.getItem('socialhub-theme') || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)

// Apply saved accent color on mount
try {
  const themeStore = JSON.parse(localStorage.getItem('socialhub-theme-store') || '{}')
  const accentId = themeStore?.state?.accent || 'violet'
  const ACCENTS = {
    violet:  { primary: '#7c5cfc', dark: '#5b3fd4' },
    blue:    { primary: '#3b82f6', dark: '#1d4ed8' },
    emerald: { primary: '#10b981', dark: '#047857' },
    rose:    { primary: '#f43f5e', dark: '#be123c' },
    amber:   { primary: '#f59e0b', dark: '#b45309' },
    cyan:    { primary: '#06b6d4', dark: '#0e7490' },
  }
  const color = ACCENTS[accentId] || ACCENTS.violet
  document.documentElement.style.setProperty('--color-brand-500', color.primary)
  document.documentElement.style.setProperty('--color-brand-600', color.primary)
  document.documentElement.style.setProperty('--color-brand-700', color.dark)
  document.documentElement.style.setProperty('--color-brand-800', color.dark)
} catch (e) {}

// Configure Axios defaults globally
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.baseURL = 'http://127.0.0.1:8000'

axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ top: 70 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: 'var(--shadow-xl)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
