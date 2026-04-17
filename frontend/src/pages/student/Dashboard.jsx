import React, { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { ENDPOINTS } from '../../api/config'
import {
  Navbar, PageLayout, PageBody, Card, Btn, StatusBadge,
  Modal, Spinner, EmptyState, Field, Input, Textarea, toast
} from '../components/UI'

const logsAPI = {
  getMyLogs: () => api.get(ENDPOINTS.MY_LOGS),
  createLog: (payload) => api.post(ENDPOINTS.MY_LOGS, payload),
  updateLog: (id, payload) => api.patch(ENDPOINTS.MY_LOGS + id + '/', payload),
  submitLog: (id) => api.post(ENDPOINTS.MY_LOGS + id + '/submit/'),
  deleteLog: (id) => api.delete(ENDPOINTS.MY_LOGS + id + '/'),
}

const EMPTY_FORM = {
  week_number: '', date: '', activities_performed: '',
  skills_gained: '', challenges_faced: ''
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
      const list = Array.isArray(data) ? data : data.results || []
      setLogs(list.sort((a, b) => b.week_number - a.week_number))
    } catch {
      toast('Failed to load logs', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

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
    if (!form.week_number) e.week_number = 'Week number is required'
    else if (form.week_number < 1 || form.week_number > 52) e.week_number = 'Must be between 1 and 52'
    if (!form.date) e.date = 'Date is required'
    if (!form.activities_performed.trim()) e.activities_performed = 'Activities are required'
    if (!form.skills_gained.trim()) e.skills_gained = 'Skills gained is required'
    if (!form.challenges_faced.trim()) e.challenges_faced = 'Challenges faced is required'
    return e
  }

  async function handleSave(submitAfter = false) {
    const errs = validateForm()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      if (editLog) {
        await logsAPI.updateLog(editLog.id, { ...form, status: 'draft' })
        toast('Log updated successfully')
      } else {
        const { data } = await logsAPI.createLog({ ...form, status: 'draft' })
        if (submitAfter) {
          await logsAPI.submitLog(data.id)
          toast('Log created and submitted')
        } else {
          toast('Log saved as draft')
        }
      }
      setShowForm(false)
      fetchLogs()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to save log', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(id) {
    setSubmitting(id)
    try {
      await logsAPI.submitLog(id)
      toast('Log submitted for review')
      fetchLogs()
    } catch {
      toast('Failed to submit log', 'error')
    } finally {
      setSubmitting(null)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this log? This action cannot be undone.')) return
    setDeleting(id)
    try {
      await logsAPI.deleteLog(id)
      toast('Log deleted')
      fetchLogs()
    } catch {
      toast('Failed to delete log', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const stats = {
    total: logs.length,
    draft: logs.filter(l => l.status === 'draft').length,
    submitted: logs.filter(l => l.status === 'submitted').length,
    reviewed: logs.filter(l => l.status === 'reviewed').length,
  }

  return (
    <PageLayout>
      <Navbar title="ILES" subtitle="Student Portal" />

      <PageBody>
        <div className="fade-in">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: '#1A1714', letterSpacing: '-0.8px' }}>
                My Internship Logs
              </h1>
              <p style={{ color: '#9A938D', fontSize: 14, marginTop: 4 }}>
                Document your weekly activities, skills, and progress
              </p>
            </div>
            <Btn variant="primary" onClick={openCreate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Log Entry
            </Btn>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '2rem' }}>
            {[
              { label: 'Total Logs', value: stats.total, color: '#1A6FA8', bg: '#E8F4FD' },
              { label: 'Drafts', value: stats.draft, color: '#5A5450', bg: '#F0EDE8' },
              { label: 'Submitted', value: stats.submitted, color: '#B5882A', bg: '#FDF3DC' },
              { label: 'Reviewed', value: stats.reviewed, color: '#1B4332', bg: '#D8EDDF' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, borderRadius: 12, padding: '0.875rem 1rem',
                border: `1px solid ${s.color}20`
              }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 600, letterSpacing: '0.4px', marginBottom: 3 }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Logs Table */}
          <Card padding="0">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0EDE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>All Log Entries</h2>
              <Btn variant="ghost" size="sm" onClick={fetchLogs}>Refresh</Btn>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Spinner />
              </div>
            ) : logs.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No logs yet"
                description="Start documenting your internship experience by creating your first weekly log."
                action={<Btn variant="primary" onClick={openCreate}>Create First Log</Btn>}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2DDD6' }}>
                      {['Week', 'Date', 'Activities (Preview)', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: 'left',
                          fontSize: 12, fontWeight: 600, color: '#9A938D',
                          letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={log.id} style={{
                        borderBottom: i < logs.length - 1 ? '1px solid #F0EDE8' : 'none',
                        transition: 'background 0.1s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F7F5F0'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{
                            width: 36, height: 36, background: '#D8EDDF', borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1B4332'
                          }}>
                            {log.week_number}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#5A5450', whiteSpace: 'nowrap' }}>
                          {log.date ? new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                          <div style={{
                            fontSize: 13, color: '#5A5450', whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis'
                          }}>
                            {log.activities_performed?.substring(0, 80) || '—'}
                            {log.activities_performed?.length > 80 ? '…' : ''}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={log.status} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
                            <Btn variant="ghost" size="sm" onClick={() => setViewLog(log)}>
                              View
                            </Btn>
                            {log.status === 'draft' && (
                              <>
                                <Btn variant="secondary" size="sm" onClick={() => openEdit(log)}>
                                  Edit
                                </Btn>
                                <Btn
                                  variant="gold" size="sm"
                                  loading={submitting === log.id}
                                  onClick={() => handleSubmit(log.id)}
                                >
                                  Submit
                                </Btn>
                                <Btn
                                  variant="danger" size="sm"
                                  loading={deleting === log.id}
                                  onClick={() => handleDelete(log.id)}
                                >
                                  Delete
                                </Btn>
                              </>
                            )}
                            {log.status === 'reviewed' && log.supervisor_comment && (
                              <span style={{
                                fontSize: 12, color: '#1B4332', background: '#D8EDDF',
                                padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap'
                              }}>
                                Has comment
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </PageBody>

      {/* Log Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editLog ? `Edit — Week ${editLog.week_number}` : 'New Log Entry'}
        width={680}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section 1: Week Information */}
          <SectionHeader number="01" title="Week Information" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Week Number" required error={formErrors.week_number}>
              <input
                type="number" min="1" max="52"
                placeholder="e.g. 3"
                value={form.week_number}
                onChange={e => setForm(f => ({ ...f, week_number: e.target.value }))}
                style={{
                  width: '100%', padding: '9px 12px',
                  border: `1px solid ${formErrors.week_number ? '#C0392B' : '#E2DDD6'}`,
                  borderRadius: 8, fontSize: 14, color: '#1A1714', outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </Field>
            <Field label="Date" required error={formErrors.date}>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{
                  width: '100%', padding: '9px 12px',
                  border: `1px solid ${formErrors.date ? '#C0392B' : '#E2DDD6'}`,
                  borderRadius: 8, fontSize: 14, color: '#1A1714', outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </Field>
          </div>

          {/* Section 2 */}
          <SectionHeader number="02" title="Activities Performed" />
          <Field label="Describe the tasks and activities you performed this week" required error={formErrors.activities_performed}>
            <Textarea
              rows={5}
              placeholder="List all activities you performed during this week. Be specific about tasks, projects, and responsibilities…"
              value={form.activities_performed}
              onChange={e => setForm(f => ({ ...f, activities_performed: e.target.value }))}
              error={formErrors.activities_performed}
            />
          </Field>

          {/* Section 3 */}
          <SectionHeader number="03" title="Skills Gained" />
          <Field label="What new skills or knowledge did you acquire?" required error={formErrors.skills_gained}>
            <Textarea
              rows={4}
              placeholder="Technical skills, soft skills, domain knowledge, tools learned…"
              value={form.skills_gained}
              onChange={e => setForm(f => ({ ...f, skills_gained: e.target.value }))}
              error={formErrors.skills_gained}
            />
          </Field>

          {/* Section 4 */}
          <SectionHeader number="04" title="Challenges Faced" />
          <Field label="What challenges did you encounter and how did you handle them?" required error={formErrors.challenges_faced}>
            <Textarea
              rows={4}
              placeholder="Describe any difficulties, obstacles, or learning curves you experienced…"
              value={form.challenges_faced}
              onChange={e => setForm(f => ({ ...f, challenges_faced: e.target.value }))}
              error={formErrors.challenges_faced}
            />
          </Field>

          {/* Section 5: Supervisor Comments (read-only) */}
          {editLog?.supervisor_comment && (
            <>
              <SectionHeader number="05" title="Supervisor Comments" />
              <div style={{
                background: '#D8EDDF', border: '1px solid #B7D9C5', borderRadius: 8,
                padding: '12px 14px', fontSize: 14, color: '#1B4332', lineHeight: 1.6
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2D6A4F', marginBottom: 6, letterSpacing: '0.3px' }}>
                  SUPERVISOR FEEDBACK
                </div>
                {editLog.supervisor_comment}
              </div>
            </>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex', gap: 10, paddingTop: '0.5rem',
            borderTop: '1px solid #F0EDE8', justifyContent: 'flex-end'
          }}>
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
            <Btn variant="secondary" loading={saving} onClick={() => handleSave(false)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save as Draft
            </Btn>
            {!editLog && (
              <Btn variant="gold" loading={saving} onClick={() => handleSave(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Submit Log
              </Btn>
            )}
          </div>
        </div>
      </Modal>

      {/* View Log Modal */}
      <Modal
        open={!!viewLog}
        onClose={() => setViewLog(null)}
        title={viewLog ? `Week ${viewLog.week_number} Log` : ''}
        width={620}
      >
        {viewLog && <LogDetailView log={viewLog} />}
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageLayout>
  )
}

function SectionHeader({ number, title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      paddingBottom: '0.25rem', borderBottom: '1px solid #F0EDE8'
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
        color: '#2D6A4F', letterSpacing: '1px'
      }}>{number}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#1A1714' }}>
        {title}
      </span>
    </div>
  )
}

function LogDetailView({ log }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header info */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#D8EDDF', borderRadius: 10, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2D6A4F', letterSpacing: '0.4px' }}>WEEK</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#1B4332', lineHeight: 1 }}>
            {log.week_number}
          </div>
        </div>
        <div style={{ background: '#F0EDE8', borderRadius: 10, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#5A5450', letterSpacing: '0.4px' }}>DATE</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#1A1714', marginTop: 2 }}>
            {log.date ? new Date(log.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>
        <div style={{ background: '#FDF3DC', borderRadius: 10, padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#B5882A', letterSpacing: '0.4px' }}>STATUS</div>
          <div style={{ marginTop: 4 }}><StatusBadge status={log.status} /></div>
        </div>
      </div>

      {[
        { title: 'Activities Performed', content: log.activities_performed, color: '#1A6FA8', bg: '#E8F4FD' },
        { title: 'Skills Gained', content: log.skills_gained, color: '#1B4332', bg: '#D8EDDF' },
        { title: 'Challenges Faced', content: log.challenges_faced, color: '#B5882A', bg: '#FDF3DC' },
      ].map(s => (
        <div key={s.title}>
          <div style={{ fontSize: 12, fontWeight: 600, color: s.color, letterSpacing: '0.4px', marginBottom: 6 }}>
            {s.title.toUpperCase()}
          </div>
          <div style={{
            background: s.bg, borderRadius: 8, padding: '12px 14px',
            fontSize: 14, color: '#1A1714', lineHeight: 1.65,
            whiteSpace: 'pre-wrap'
          }}>
            {s.content || <em style={{ color: '#9A938D' }}>Not provided</em>}
          </div>
        </div>
      ))}

      {log.supervisor_comment && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#2D6A4F', letterSpacing: '0.4px', marginBottom: 6 }}>
            SUPERVISOR COMMENTS
          </div>
          <div style={{
            background: '#D8EDDF', border: '1px solid #B7D9C5', borderRadius: 8,
            padding: '12px 14px', fontSize: 14, color: '#1B4332', lineHeight: 1.65,
            whiteSpace: 'pre-wrap'
          }}>
            {log.supervisor_comment}
          </div>
        </div>
      )}
    </div>
  )
}
