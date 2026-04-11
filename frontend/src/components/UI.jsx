import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

// ── Navbar ───────────────────────────────────────────
export function Navbar({ title, subtitle }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const roleLabel = { admin: 'Administrator', student: 'Student', supervisor: 'Academic Supervisor' }[user?.role] || user?.role

  return (
    <nav style={{
      background: '#1A1714', color: '#F7F5F0', padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 60, position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 32, height: 32, background: '#2D6A4F', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.5px'
        }}>IL</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            {title || 'ILES'}
          </div>
          {subtitle && <div style={{ fontSize: 11, color: '#9A8F87', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{subtitle}</div>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, padding: '6px 12px', color: '#F7F5F0', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#2D6A4F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#fff'
          }}>
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
            </div>
            <div style={{ fontSize: 11, color: '#9A8F87' }}>{roleLabel}</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
            <path d="M2 4l4 4 4-4" stroke="#9A8F87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: '#FFFFFF', border: '1px solid #E2DDD6', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160, zIndex: 200,
            overflow: 'hidden', animation: 'fadeIn 0.15s ease'
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #E2DDD6' }}>
              <div style={{ fontSize: 12, color: '#9A938D' }}>Signed in as</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1714' }}>
                {user?.email || user?.username}
              </div>
            </div>
            <button
              onClick={() => { setMenuOpen(false); logout() }}
              style={{
                width: '100%', padding: '10px 14px', textAlign: 'left',
                background: 'none', border: 'none', fontSize: 14, color: '#C0392B',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FDECEA'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

// ── Status Badge ─────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    draft:     { bg: '#F0EDE8', color: '#5A5450', label: 'Draft' },
    submitted: { bg: '#FDF3DC', color: '#B5882A', label: 'Submitted' },
    reviewed:  { bg: '#D8EDDF', color: '#1B4332', label: 'Reviewed' },
    approved:  { bg: '#D8EDDF', color: '#1B4332', label: 'Approved' },
    rejected:  { bg: '#FDECEA', color: '#C0392B', label: 'Rejected' },
    active:    { bg: '#D8EDDF', color: '#1B4332', label: 'Active' },
    inactive:  { bg: '#F0EDE8', color: '#5A5450', label: 'Inactive' },
    pending:   { bg: '#FDF3DC', color: '#B5882A', label: 'Pending' },
  }
  const s = map[status?.toLowerCase()] || { bg: '#F0EDE8', color: '#5A5450', label: status || 'Unknown' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 500, padding: '3px 9px', borderRadius: 20,
      letterSpacing: '0.2px'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

// ── Button ───────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = 'md', loading, disabled, onClick, style, type = 'button', ...rest }) {
  const sizes = { sm: '7px 14px', md: '9px 18px', lg: '12px 24px' }
  const variants = {
    primary:   { bg: '#2D6A4F', color: '#fff', border: '#2D6A4F', hover: '#1B4332' },
    secondary: { bg: 'transparent', color: '#1A1714', border: '#C8C0B5', hover: '#F0EDE8' },
    danger:    { bg: '#C0392B', color: '#fff', border: '#C0392B', hover: '#A93226' },
    ghost:     { bg: 'transparent', color: '#5A5450', border: 'transparent', hover: '#F0EDE8' },
    gold:      { bg: '#B5882A', color: '#fff', border: '#B5882A', hover: '#9A7422' },
  }
  const v = variants[variant]
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: sizes[size], background: v.bg, color: v.color,
        border: `1px solid ${v.border}`, borderRadius: 8,
        fontSize: size === 'sm' ? 13 : size === 'lg' ? 15 : 14,
        fontWeight: 500, fontFamily: 'var(--font-body)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background 0.15s, transform 0.1s',
        ...style
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hover }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.background = v.bg }}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => e.currentTarget.style.transform = 'none'}
      {...rest}
    >
      {loading ? <MiniSpinner color={variant === 'secondary' || variant === 'ghost' ? '#5A5450' : '#fff'} /> : null}
      {children}
    </button>
  )
}

function MiniSpinner({ color = '#fff' }) {
  return (
    <span style={{
      width: 14, height: 14, border: `2px solid ${color}30`,
      borderTopColor: color, borderRadius: '50%', display: 'inline-block',
      animation: 'spin 0.6s linear infinite', flexShrink: 0
    }} />
  )
}

// ── Card ─────────────────────────────────────────────
export function Card({ children, style, padding = '1.5rem' }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 14,
      border: '1px solid #E2DDD6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      padding, ...style
    }}>
      {children}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 560 }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.2s ease'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2DDD6'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#1A1714' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A938D', padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────
let _setToasts = null
export function ToastProvider() {
  const [toasts, setToasts] = useState([])
  _setToasts = setToasts

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      display: 'flex', flexDirection: 'column', gap: 8
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#C0392B' : t.type === 'warning' ? '#D68910' : '#2D6A4F',
          color: '#fff', padding: '10px 16px', borderRadius: 10,
          fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', animation: 'slideIn 0.2s ease',
          minWidth: 200, maxWidth: 340
        }}>
          <span style={{ flexShrink: 0 }}>
            {t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}

export function toast(message, type = 'success') {
  if (!_setToasts) return
  const id = Date.now()
  _setToasts(prev => [...prev, { id, message, type }])
  setTimeout(() => {
    _setToasts(prev => prev.filter(t => t.id !== id))
  }, 3500)
}

// ── Spinner ──────────────────────────────────────────
export function Spinner({ size = 32, color = '#2D6A4F' }) {
  return (
    <div style={{
      width: size, height: size, border: `3px solid #E2DDD6`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
  )
}

// ── Empty State ───────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '3rem 2rem', textAlign: 'center', gap: '0.75rem'
    }}>
      {icon && <div style={{ fontSize: 40, marginBottom: 4 }}>{icon}</div>}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: '#1A1714' }}>
        {title}
      </div>
      {description && <div style={{ fontSize: 14, color: '#9A938D', maxWidth: 320 }}>{description}</div>}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  )
}

// ── Form Field ────────────────────────────────────────
export function Field({ label, required, error, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: '#5A5450', letterSpacing: '0.2px' }}>
          {label}{required && <span style={{ color: '#C0392B', marginLeft: 3 }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: '#9A938D' }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: '#C0392B' }}>{error}</span>}
    </div>
  )
}

const inputBase = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #E2DDD6', borderRadius: 8,
  fontSize: 14, color: '#1A1714', background: '#FFFFFF',
  outline: 'none', transition: 'border-color 0.15s',
  fontFamily: 'var(--font-body)',
}

export function Input({ error, style, ...props }) {
  return (
    <input
      style={{ ...inputBase, ...(error ? { borderColor: '#C0392B' } : {}), ...style }}
      onFocus={e => e.target.style.borderColor = error ? '#C0392B' : '#2D6A4F'}
      onBlur={e => e.target.style.borderColor = error ? '#C0392B' : '#E2DDD6'}
      {...props}
    />
  )
}

export function Textarea({ error, rows = 4, style, ...props }) {
  return (
    <textarea
      rows={rows}
      style={{ ...inputBase, resize: 'vertical', lineHeight: 1.5, ...(error ? { borderColor: '#C0392B' } : {}), ...style }}
      onFocus={e => e.target.style.borderColor = error ? '#C0392B' : '#2D6A4F'}
      onBlur={e => e.target.style.borderColor = error ? '#C0392B' : '#E2DDD6'}
      {...props}
    />
  )
}

export function Select({ error, style, children, ...props }) {
  return (
    <select
      style={{ ...inputBase, cursor: 'pointer', ...(error ? { borderColor: '#C0392B' } : {}), ...style }}
      onFocus={e => e.target.style.borderColor = '#2D6A4F'}
      onBlur={e => e.target.style.borderColor = error ? '#C0392B' : '#E2DDD6'}
      {...props}
    >
      {children}
    </select>
  )
}

// ── Page Layout ───────────────────────────────────────
export function PageLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F7F5F0' }}>
      <ToastProvider />
      {children}
    </div>
  )
}

export function PageBody({ children }) {
  return (
    <main style={{ flex: 1, padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {children}
    </main>
  )
}
