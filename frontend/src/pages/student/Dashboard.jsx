import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { ENDPOINTS } from '../../api/config'
import useAuth from '../../hooks/useAuth'

const logsAPI = {
  getMyLogs: () => api.get(ENDPOINTS.MY_LOGS),
  createLog: (payload) => api.post(ENDPOINTS.MY_LOGS, payload),
  updateLog: (id, payload) => api.patch(`${ENDPOINTS.MY_LOGS}${id}/`, payload),
  submitLog: (id) => api.post(`${ENDPOINTS.MY_LOGS}${id}/submit/`),
  deleteLog: (id) => api.delete(`${ENDPOINTS.MY_LOGS}${id}/`),
}

const EMPTY_FORM = {
  week_number: '',
  date: '',
  activities_performed: '',
  skills_gained: '',
  challenges_faced: '',
}

function notify(message, type = 'info') {
  const prefix = type === 'error' ? 'Error: ' : ''
  window.alert(`${prefix}${message}`)
}

function getStatusColors(status) {
  switch (status) {
    case 'draft':
      return { bg: '#e5e6fe', text: '#44474f' }
    case 'submitted':
      return { bg: '#d0e4ff', text: '#002452' }
    case 'reviewed':
      return { bg: '#8af9a9', text: '#0a3d1e' }
    case 'approved':
      return { bg: '#8af9a9', text: '#0a3d1e' }
    case 'rejected':
      return { bg: '#ffd6d6', text: '#6b1a1a' }
    default:
      return { bg: '#f1f1f1', text: '#333333' }
  }
}

function getTimeUntilFriday() {
  const now = new Date()
  const currentDay = now.getDay()
  
  // Friday is 5. 
  let daysToAdd = 5 - currentDay
  if (daysToAdd < 0) {
    daysToAdd += 7 // Already Saturday/Sunday
  } else if (daysToAdd === 0) {
    // It's Friday, check if past 5:00 PM (17:00)
    const targetToday = new Date(now)
    targetToday.setHours(17, 0, 0, 0)
    if (now > targetToday) {
      daysToAdd = 7
    }
  }
  
  const nextFriday = new Date(now)
  nextFriday.setDate(now.getDate() + daysToAdd)
  nextFriday.setHours(17, 0, 0, 0)
  
  const diffMs = nextFriday - now
  if (diffMs <= 0) return { days: 0, hours: 0, minutes: 0 }
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days, hours, minutes }
}

function formatStatus(status) {
  if (!status) return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function StatusBadge({ status }) {
  const colors = getStatusColors(status)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '0.2rem 0.55rem',
        fontSize: 12,
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        textTransform: 'capitalize',
      }}
    >
      {formatStatus(status)}
    </span>
  )
}

function SectionHeader({ number, title }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingBottom: '0.25rem',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 11,
          fontWeight: 800,
          color: '#2D6A4F',
          letterSpacing: '1px',
        }}
      >
        {number}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 15,
          fontWeight: 700,
          color: '#1A1714',
        }}
      >
        {title}
      </span>
    </div>
  )
}

function FormField({ label, required, error, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
        {label} {required ? <span style={{ color: '#b91c1c' }}>*</span> : null}
      </span>
      {children}
      {error ? <span style={{ fontSize: 12, color: '#b91c1c' }}>{error}</span> : null}
    </label>
  )
}

function LogDetailView({ log }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#D8EDDF', borderRadius: 10, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2D6A4F', letterSpacing: '0.4px' }}>WEEK</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              color: '#1B4332',
              lineHeight: 1,
            }}
          >
            {log.week_number}
          </div>
        </div>

        <div style={{ background: '#F0EDE8', borderRadius: 10, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#5A5450', letterSpacing: '0.4px' }}>DATE</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1714', marginTop: 2 }}>
            {log.date
              ? new Date(log.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </div>
        </div>

        <div style={{ background: '#FDF3DC', borderRadius: 10, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#B5882A', letterSpacing: '0.4px' }}>STATUS</div>
          <div style={{ marginTop: 4 }}>
            <StatusBadge status={log.status} />
          </div>
        </div>
      </div>

      {[
        { title: 'Activities Performed', content: log.activities_performed, color: '#1A6FA8', bg: '#E8F4FD' },
        { title: 'Skills Gained', content: log.skills_gained, color: '#1B4332', bg: '#D8EDDF' },
        { title: 'Challenges Faced', content: log.challenges_faced, color: '#B5882A', bg: '#FDF3DC' },
      ].map((s) => (
        <div key={s.title}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.color, letterSpacing: '0.4px', marginBottom: 6 }}>
            {s.title.toUpperCase()}
          </div>
          <div
            style={{
              background: s.bg,
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 14,
              color: '#1A1714',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}
          >
            {s.content || <em style={{ color: '#9A938D' }}>Not provided</em>}
          </div>
        </div>
      ))}

      {log.supervisor_comment ? (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#2D6A4F', letterSpacing: '0.4px', marginBottom: 6 }}>
            SUPERVISOR COMMENTS
          </div>
          <div
            style={{
              background: '#D8EDDF',
              border: '1px solid #B7D9C5',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 14,
              color: '#1B4332',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}
          >
            {log.supervisor_comment}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const [placement, setPlacement] = useState(null)
  const [loadingPlacement, setLoadingPlacement] = useState(true)
  const [timeLeft, setTimeLeft] = useState(getTimeUntilFriday())

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await logsAPI.getMyLogs()
      const list = Array.isArray(data) ? data : data?.results || []
      setLogs(list.sort((a, b) => b.week_number - a.week_number))
    } catch {
      notify('Failed to load logs', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPlacement = useCallback(async () => {
    try {
      setLoadingPlacement(true)
      const { data } = await api.get(ENDPOINTS.MY_PLACEMENT)
      setPlacement(data)
    } catch (err) {
      if (err.response?.status === 404) {
        setPlacement(null)
      }
    } finally {
      setLoadingPlacement(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
    fetchPlacement()
  }, [fetchLogs, fetchPlacement])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilFriday())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  async function handleSubmit(id) {
    setSubmitting(id)
    try {
      await logsAPI.submitLog(id)
      notify('Log submitted for review')
      fetchLogs()
    } catch {
      notify('Failed to submit log', 'error')
    } finally {
      setSubmitting(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this log? This action cannot be undone.')) return

    setDeleting(id)
    try {
      await logsAPI.deleteLog(id)
      notify('Log deleted')
      fetchLogs()
    } catch {
      notify('Failed to delete log', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const stats = {
    total: logs.length,
    draft: logs.filter((l) => l.status === 'draft').length,
    submitted: logs.filter((l) => l.status === 'submitted').length,
    reviewed: logs.filter((l) => l.status === 'reviewed').length,
  }

  const buttonBase = {
    border: 'none',
    borderRadius: 8,
    padding: '0.5rem 0.75rem',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }

  return (
    <section style={{ padding: '1rem' }}>
      <div className="fade-in">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1A1714', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
            Welcome back, {user?.full_name || 'Student'}!
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            Here is an overview of your weekly internship logging progress.
          </p>
        </div>

        {/* Placement Reminders */}
        {!loadingPlacement && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {placement === null && (
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>Placement Request Required</div>
                    <div style={{ color: '#B45309', fontSize: 13, marginTop: 2 }}>Please submit your internship placement request to assign supervisors and start logging.</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/student/placement')}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.5rem 1rem',
                    fontSize: 13,
                    fontWeight: 600,
                    background: '#D97706',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Submit Request
                </button>
              </div>
            )}

            {placement && placement.status === 'active' && !placement.workplace_supervisor && !placement.invited_supervisor_email && (
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: 12,
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: 24 }}>💼</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#92400E', fontSize: 14 }}>Workplace Supervisor Missing</div>
                    <div style={{ color: '#B45309', fontSize: 13, marginTop: 2 }}>You haven't added a workplace supervisor yet. Please update your placement to ensure your logs can be reviewed.</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/student/placement')}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.5rem 1rem',
                    fontSize: 13,
                    fontWeight: 600,
                    background: '#D97706',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  Add Supervisor
                </button>
              </div>
            )}
          </div>
        )}

        {/* Countdown to Friday */}
        {placement && placement.status === 'active' && new Date() < new Date(placement.end_date) && (
          <div style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
            color: '#ffffff',
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff' }}>Weekly Log Submission Countdown</h3>
              <p style={{ fontSize: 13, color: '#DBEAFE', margin: '4px 0 0 0' }}>Submit your weekly progress logs by Friday 5:00 PM.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hrs', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes }
              ].map(t => (
                <div key={t.label} style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  minWidth: 54,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{t.value}</div>
                  <div style={{ fontSize: 10, color: '#BFDBFE', fontWeight: 600, marginTop: 4, textTransform: 'uppercase' }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            marginBottom: '2rem',
          }}
        >
          {[
            { label: 'Total Logs', value: stats.total, color: '#1A6FA8', bg: '#E8F4FD' },
            { label: 'Drafts', value: stats.draft, color: '#5A5450', bg: '#F0EDE8' },
            { label: 'Submitted', value: stats.submitted, color: '#B5882A', bg: '#FDF3DC' },
            { label: 'Reviewed', value: stats.reviewed, color: '#1B4332', bg: '#D8EDDF' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: s.bg,
                borderRadius: 12,
                padding: '0.875rem 1rem',
                border: `1px solid ${s.color}20`,
              }}
            >
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 3 }}>
                {s.label.toUpperCase()}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>All Log Entries</h2>
            <button
              onClick={fetchLogs}
              style={{ ...buttonBase, background: '#f3f4f6', color: '#1f2937' }}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {['Week', 'Period', 'Activities (Preview)', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#6b7280',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="skeleton-box" style={{ width: 36, height: 36, borderRadius: 8 }} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="skeleton-box" style={{ height: '1.25rem', width: '120px' }} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="skeleton-box" style={{ height: '1.25rem', width: '90%' }} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="skeleton-box" style={{ height: '1.5rem', width: '70px', borderRadius: 12 }} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="skeleton-box" style={{ height: '2rem', width: '60px', borderRadius: 4 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📋</div>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>No logs yet</h3>
              <p style={{ marginBottom: 14 }}>Start documenting your internship experience by creating your first weekly log.</p>
              <button
                onClick={() => navigate('/student/logs/new')}
                style={{ ...buttonBase, background: '#002452', color: '#fff' }}
              >
                Create First Log
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {['Week', 'Period', 'Activities (Preview)', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#6b7280',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: i < logs.length - 1 ? '1px solid #f3f4f6' : 'none',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            background: '#D8EDDF',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: 15,
                            color: '#1B4332',
                          }}
                        >
                          {log.week_number}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#374151', whiteSpace: 'nowrap' }}>
                        {log.week_start && log.week_end
                          ? `${new Date(log.week_start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — ${new Date(log.week_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                          : '—'}
                      </td>

                      <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                        <div
                          style={{
                            fontSize: 13,
                            color: '#374151',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {log.activities?.substring(0, 80) || '—'}
                          {log.activities?.length > 80 ? '...' : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={log.status} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                           onClick={() => navigate(`/student/logs/${log.id}`)}
                            style={{ ...buttonBase, background: '#f3f4f6', color: '#111827', padding: '0.35rem 0.6rem' }}
                          >
                            View
                          </button>

                          {log.status === 'draft' ? (
                            <>
                              <button
                                onClick={() => navigate(`/student/logs/${log.id}/edit`)}
                                style={{ ...buttonBase, background: '#e5e7eb', color: '#111827', padding: '0.35rem 0.6rem' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSubmit(log.id)}
                                disabled={submitting === log.id}
                                style={{
                                  ...buttonBase,
                                  background: '#C8A217',
                                  color: '#1f2937',
                                  opacity: submitting === log.id ? 0.7 : 1,
                                  padding: '0.35rem 0.6rem',
                                }}
                              >
                                {submitting === log.id ? 'Submitting...' : 'Submit'}
                              </button>
                              <button
                                onClick={() => handleDelete(log.id)}
                                disabled={deleting === log.id}
                                style={{
                                  ...buttonBase,
                                  background: '#ef4444',
                                  color: '#ffffff',
                                  opacity: deleting === log.id ? 0.7 : 1,
                                  padding: '0.35rem 0.6rem',
                                }}
                              >
                                {deleting === log.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          ) : null}

                          {log.status === 'reviewed' && log.supervisor_comment ? (
                            <span
                              style={{
                                fontSize: 12,
                                color: '#1B4332',
                                background: '#D8EDDF',
                                padding: '2px 8px',
                                borderRadius: 20,
                                whiteSpace: 'nowrap',
                                alignSelf: 'center',
                              }}
                            >
                              Has comment
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
