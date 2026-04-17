import React, { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { ENDPOINTS } from '../../api/config'

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
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editLog, setEditLog] = useState(null)
  const [viewLog, setViewLog] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(null)

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

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  function openCreate() {
    setEditLog(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setShowForm(true)
  }

  function openEdit(log) {
    setEditLog(log)
    setForm({
      week_number: log.week_number || '',
      date: log.date || '',
      activities_performed: log.activities_performed || '',
      skills_gained: log.skills_gained || '',
      challenges_faced: log.challenges_faced || '',
    })
    setFormErrors({})
    setShowForm(true)
  }

  function validateForm() {
    const e = {}
    const week = Number(form.week_number)

    if (!form.week_number) e.week_number = 'Week number is required'
    else if (Number.isNaN(week) || week < 1 || week > 52) e.week_number = 'Must be between 1 and 52'

    if (!form.date) e.date = 'Date is required'
    if (!form.activities_performed.trim()) e.activities_performed = 'Activities are required'
    if (!form.skills_gained.trim()) e.skills_gained = 'Skills gained is required'
    if (!form.challenges_faced.trim()) e.challenges_faced = 'Challenges faced is required'

    return e
  }

  async function handleSave(submitAfter = false) {
    const errs = validateForm()
    if (Object.keys(errs).length) {
      setFormErrors(errs)
      return
    }

    setSaving(true)
    try {
      if (editLog) {
        await logsAPI.updateLog(editLog.id, {
          ...form,
          week_number: Number(form.week_number),
          status: 'draft',
        })
        notify('Log updated successfully')
      } else {
        const { data } = await logsAPI.createLog({
          ...form,
          week_number: Number(form.week_number),
          status: 'draft',
        })

        if (submitAfter) {
          await logsAPI.submitLog(data.id)
          notify('Log created and submitted')
        } else {
          notify('Log saved as draft')
        }
      }

      setShowForm(false)
      setEditLog(null)
      fetchLogs()
    } catch (err) {
      notify(err?.response?.data?.detail || 'Failed to save log', 'error')
    } finally {
      setSaving(false)
    }
  }

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 800,
                color: '#1A1714',
                letterSpacing: '-0.8px',
              }}
            >
              My Internship Logs
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
              Document your weekly activities, skills, and progress
            </p>
          </div>

          <button
            onClick={openCreate}
            style={{ ...buttonBase, background: '#002452', color: '#ffffff', display: 'inline-flex', gap: 8, alignItems: 'center' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Log Entry
          </button>
        </div>

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
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#6b7280' }}>
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📋</div>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>No logs yet</h3>
              <p style={{ marginBottom: 14 }}>Start documenting your internship experience by creating your first weekly log.</p>
              <button
                onClick={openCreate}
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
                    {['Week', 'Date', 'Activities (Preview)', 'Status', 'Actions'].map((h) => (
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
                        {log.date
                          ? new Date(log.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
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
                          {log.activities_performed?.substring(0, 80) || '—'}
                          {log.activities_performed?.length > 80 ? '...' : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={log.status} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setViewLog(log)}
                            style={{ ...buttonBase, background: '#f3f4f6', color: '#111827', padding: '0.35rem 0.6rem' }}
                          >
                            View
                          </button>

                          {log.status === 'draft' ? (
                            <>
                              <button
                                onClick={() => openEdit(log)}
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

      {showForm ? (
        <div
          onClick={() => {
            if (!saving) setShowForm(false)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(680px, 96vw)',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <h3 style={{ fontSize: 18 }}>{editLog ? `Edit - Week ${editLog.week_number}` : 'New Log Entry'}</h3>
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                style={{ ...buttonBase, background: '#f3f4f6', color: '#111827', padding: '0.3rem 0.55rem' }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <SectionHeader number="01" title="Week Information" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField label="Week Number" required error={formErrors.week_number}>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    placeholder="e.g. 3"
                    value={form.week_number}
                    onChange={(e) => setForm((f) => ({ ...f, week_number: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: `1px solid ${formErrors.week_number ? '#b91c1c' : '#d1d5db'}`,
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <FormField label="Date" required error={formErrors.date}>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: `1px solid ${formErrors.date ? '#b91c1c' : '#d1d5db'}`,
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                </FormField>
              </div>

              <SectionHeader number="02" title="Activities Performed" />
              <FormField
                label="Describe the tasks and activities you performed this week"
                required
                error={formErrors.activities_performed}
              >
                <textarea
                  rows={5}
                  placeholder="List all activities you performed during this week. Be specific about tasks, projects, and responsibilities."
                  value={form.activities_performed}
                  onChange={(e) => setForm((f) => ({ ...f, activities_performed: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${formErrors.activities_performed ? '#b91c1c' : '#d1d5db'}`,
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#111827',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </FormField>

              <SectionHeader number="03" title="Skills Gained" />
              <FormField
                label="What new skills or knowledge did you acquire?"
                required
                error={formErrors.skills_gained}
              >
                <textarea
                  rows={4}
                  placeholder="Technical skills, soft skills, domain knowledge, tools learned."
                  value={form.skills_gained}
                  onChange={(e) => setForm((f) => ({ ...f, skills_gained: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${formErrors.skills_gained ? '#b91c1c' : '#d1d5db'}`,
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#111827',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </FormField>

              <SectionHeader number="04" title="Challenges Faced" />
              <FormField
                label="What challenges did you encounter and how did you handle them?"
                required
                error={formErrors.challenges_faced}
              >
                <textarea
                  rows={4}
                  placeholder="Describe any difficulties, obstacles, or learning curves you experienced."
                  value={form.challenges_faced}
                  onChange={(e) => setForm((f) => ({ ...f, challenges_faced: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: `1px solid ${formErrors.challenges_faced ? '#b91c1c' : '#d1d5db'}`,
                    borderRadius: 8,
                    fontSize: 14,
                    color: '#111827',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </FormField>

              {editLog?.supervisor_comment ? (
                <>
                  <SectionHeader number="05" title="Supervisor Comments" />
                  <div
                    style={{
                      background: '#D8EDDF',
                      border: '1px solid #B7D9C5',
                      borderRadius: 8,
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#1B4332',
                      lineHeight: 1.6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#2D6A4F',
                        marginBottom: 6,
                        letterSpacing: '0.3px',
                      }}
                    >
                      SUPERVISOR FEEDBACK
                    </div>
                    {editLog.supervisor_comment}
                  </div>
                </>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #e5e7eb',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  style={{ ...buttonBase, background: '#e5e7eb', color: '#111827' }}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  style={{ ...buttonBase, background: '#f3f4f6', color: '#111827' }}
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>

                {!editLog ? (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    style={{ ...buttonBase, background: '#C8A217', color: '#111827' }}
                  >
                    {saving ? 'Saving...' : 'Submit Log'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {viewLog ? (
        <div
          onClick={() => setViewLog(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(620px, 96vw)',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <h3 style={{ fontSize: 18 }}>{`Week ${viewLog.week_number} Log`}</h3>
              <button
                onClick={() => setViewLog(null)}
                style={{ ...buttonBase, background: '#f3f4f6', color: '#111827', padding: '0.3rem 0.55rem' }}
              >
                Close
              </button>
            </div>
            <LogDetailView log={viewLog} />
          </div>
        </div>
      ) : null}
    </section>
  )
}